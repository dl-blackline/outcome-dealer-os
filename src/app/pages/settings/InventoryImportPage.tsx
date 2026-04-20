import { useCallback, useMemo, useState } from 'react'
import { ingestFile } from '@/domains/import/import.ingest'
import {
  createRuntimeInventoryRecord,
  updateRuntimeInventoryRecordFull,
  useInventoryCatalog,
  type InventoryRecord,
  type InventoryRecordCreateInput,
  type InventoryRecordFullUpdate,
} from '@/domains/inventory/inventory.runtime'
import { ManufacturerMark } from '@/components/inventory/ManufacturerMark'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowClockwise,
  DownloadSimple,
  ArrowsClockwise,
} from '@phosphor-icons/react'

type RowAction = 'create' | 'update' | 'review' | 'skip'

type ParsedInventoryRow = {
  rowIndex: number
  vin?: string
  stockNumber?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  bodyStyle?: string
  mileage?: number
  price?: number
  wholesalePrice?: number
  isWholesaleVisible?: boolean
  wholesaleStatus?: string
  wholesaleNotes?: string
  status?: string
  isPublished?: boolean
  isFeatured?: boolean
  available?: boolean
  description?: string
}

type PreparedRow = {
  parsed: ParsedInventoryRow
  action: RowAction
  reason: string
  matchedId?: string
  updatePayload?: InventoryRecordFullUpdate
  createPayload?: InventoryRecordCreateInput
}

type AppliedResult = {
  rowIndex: number
  action: 'created' | 'updated' | 'failed'
  message: string
}

const COLUMN_MAP: Record<string, keyof ParsedInventoryRow | 'listPrice'> = {
  vin: 'vin',
  vin_number: 'vin',
  stock: 'stockNumber',
  stock_number: 'stockNumber',
  stocknumber: 'stockNumber',
  year: 'year',
  make: 'make',
  manufacturer: 'make',
  model: 'model',
  trim: 'trim',
  body_style: 'bodyStyle',
  bodystyle: 'bodyStyle',
  mileage: 'mileage',
  miles: 'mileage',
  sale_price: 'price',
  internet_price: 'price',
  asking_price: 'price',
  list_price: 'listPrice',
  wholesale_price: 'wholesalePrice',
  dealer_price: 'wholesalePrice',
  wholesale_visible: 'isWholesaleVisible',
  is_wholesale_visible: 'isWholesaleVisible',
  wholesale_status: 'wholesaleStatus',
  wholesale_notes: 'wholesaleNotes',
  status: 'status',
  is_published: 'isPublished',
  is_featured: 'isFeatured',
  available_publicly: 'available',
  available: 'available',
  description: 'description',
  public_description: 'description',
}

const SAMPLE_CSV = `vin,stock_number,year,make,model,trim,body_style,mileage,sale_price,wholesale_price,wholesale_visible,wholesale_status,status,is_published,is_featured\n1HGBH41JXMN109186,STK-001,2023,Honda,Accord,Sport,Sedan,12500,28900,25100,true,ready,frontline,true,false`

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '_')
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'y', 'published', 'active'].includes(normalized)) return true
  if (['false', '0', 'no', 'n', 'draft', 'inactive'].includes(normalized)) return false
  return undefined
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const cleaned = value.replace(/[$,\s]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : undefined
}

function normalizeStatus(value: string | undefined): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_')
  if (['inventory', 'frontline', 'recon', 'sold', 'wholesale'].includes(normalized)) {
    return normalized
  }
  return 'inventory'
}

function parseRawTextFallback(rawText: string, rowIndex: number): ParsedInventoryRow {
  const text = rawText.toLowerCase()
  const vinMatch = rawText.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i)
  const yearMatch = rawText.match(/\b(19[5-9]\d|20[0-3]\d)\b/)
  const stockMatch = rawText.match(/stock[:#\s-]*([a-z0-9-]+)/i)
  const priceMatch = rawText.match(/\$\s?([\d,]+(?:\.\d{2})?)/)
  const mileageMatch = rawText.match(/([\d,]{4,6})\s*(mi|miles)/i)

  const makeGuess = ['toyota', 'honda', 'ford', 'chevrolet', 'nissan', 'kia', 'hyundai', 'mazda', 'subaru', 'jeep', 'ram', 'gmc', 'tesla']
    .find((m) => text.includes(m))

  return {
    rowIndex,
    vin: vinMatch?.[0]?.toUpperCase(),
    stockNumber: stockMatch?.[1]?.toUpperCase(),
    year: yearMatch ? Number(yearMatch[1]) : undefined,
    make: makeGuess ? makeGuess.charAt(0).toUpperCase() + makeGuess.slice(1) : undefined,
    price: priceMatch ? Number(priceMatch[1].replace(/,/g, '')) : undefined,
    mileage: mileageMatch ? Number(mileageMatch[1].replace(/,/g, '')) : undefined,
  }
}

function parsePreparedRows(fileRows: Awaited<ReturnType<typeof ingestFile>>): ParsedInventoryRow[] {
  return fileRows.map((row) => {
    if (!row.rawColumns || Object.keys(row.rawColumns).length === 0) {
      return parseRawTextFallback(row.rawText, row.rowIndex)
    }

    const parsed: ParsedInventoryRow = { rowIndex: row.rowIndex }

    for (const [rawKey, rawValue] of Object.entries(row.rawColumns)) {
      const key = COLUMN_MAP[normalizeKey(rawKey)]
      if (!key) continue
      const value = String(rawValue ?? '').trim()
      if (!value) continue

      if (key === 'year') parsed.year = parseNumber(value)
      else if (key === 'mileage') parsed.mileage = parseNumber(value)
      else if (key === 'price') parsed.price = parseNumber(value)
      else if (key === 'wholesalePrice') parsed.wholesalePrice = parseNumber(value)
      else if (key === 'listPrice' && parsed.price === undefined) parsed.price = parseNumber(value)
      else if (key === 'isPublished') parsed.isPublished = parseBoolean(value)
      else if (key === 'isFeatured') parsed.isFeatured = parseBoolean(value)
      else if (key === 'available') parsed.available = parseBoolean(value)
      else if (key === 'isWholesaleVisible') parsed.isWholesaleVisible = parseBoolean(value)
      else if (key === 'status') parsed.status = normalizeStatus(value)
      else if (key === 'wholesaleStatus') parsed.wholesaleStatus = value
      else if (key === 'wholesaleNotes') parsed.wholesaleNotes = value
      else if (key === 'vin') parsed.vin = value.toUpperCase()
      else if (key === 'stockNumber') parsed.stockNumber = value.toUpperCase()
      else if (key === 'make') parsed.make = value
      else if (key === 'model') parsed.model = value
      else if (key === 'trim') parsed.trim = value
      else if (key === 'bodyStyle') parsed.bodyStyle = value
      else if (key === 'description') parsed.description = value
    }

    if (!parsed.make || !parsed.model) {
      const fallback = parseRawTextFallback(row.rawText, row.rowIndex)
      parsed.make = parsed.make || fallback.make
      parsed.year = parsed.year || fallback.year
      parsed.vin = parsed.vin || fallback.vin
      parsed.stockNumber = parsed.stockNumber || fallback.stockNumber
      parsed.price = parsed.price ?? fallback.price
      parsed.mileage = parsed.mileage ?? fallback.mileage
    }

    return parsed
  })
}

function scoreCompleteness(record: InventoryRecord): number {
  let score = 0
  if (record.vin) score += 2
  if (record.stockNumber) score += 2
  if (record.trim) score += 1
  if (record.bodyStyle) score += 1
  if (record.mileage > 0) score += 1
  if (record.price > 0) score += 1
  if (record.description) score += 1
  if (record.photos.some((p) => p.source !== 'placeholder')) score += 1
  return score
}

function scoreIncoming(row: ParsedInventoryRow): number {
  let score = 0
  if (row.vin) score += 2
  if (row.stockNumber) score += 2
  if (row.trim) score += 1
  if (row.bodyStyle) score += 1
  if (typeof row.mileage === 'number' && row.mileage > 0) score += 1
  if (typeof row.price === 'number' && row.price > 0) score += 1
  if (row.description) score += 1
  return score
}

function findMatchingRecord(records: InventoryRecord[], row: ParsedInventoryRow): InventoryRecord | undefined {
  const vin = row.vin?.trim().toUpperCase()
  const stock = row.stockNumber?.trim().toUpperCase()

  if (vin) {
    const byVin = records.find((r) => (r.vin || '').trim().toUpperCase() === vin)
    if (byVin) return byVin
  }

  if (stock) {
    const byStock = records.find((r) => (r.stockNumber || '').trim().toUpperCase() === stock)
    if (byStock) return byStock
  }

  if (row.year && row.make && row.model) {
    const make = row.make.trim().toLowerCase()
    const model = row.model.trim().toLowerCase()
    return records.find((r) => r.year === row.year && r.make.toLowerCase() === make && r.model.toLowerCase() === model)
  }

  return undefined
}

function buildUpdatePayload(existing: InventoryRecord, row: ParsedInventoryRow): { payload: InventoryRecordFullUpdate; hasChanges: boolean; hasConflict: boolean } {
  const payload: InventoryRecordFullUpdate = {}
  let hasChanges = false
  let hasConflict = false

  const maybeSet = <K extends keyof InventoryRecordFullUpdate>(field: K, incoming: InventoryRecordFullUpdate[K], current: unknown) => {
    if (incoming === undefined || incoming === null || incoming === '') return
    if (current === undefined || current === null || current === '' || current === 0) {
      payload[field] = incoming
      hasChanges = true
      return
    }

    if (typeof incoming === 'number' && typeof current === 'number') {
      if (incoming > 0 && current <= 0) {
        payload[field] = incoming
        hasChanges = true
      }
      return
    }

    if (String(incoming).trim().toLowerCase() !== String(current).trim().toLowerCase()) {
      if (field === 'year' || field === 'make' || field === 'model') {
        hasConflict = true
      }
    }
  }

  maybeSet('vin', row.vin, existing.vin)
  maybeSet('stockNumber', row.stockNumber, existing.stockNumber)
  maybeSet('year', row.year, existing.year)
  maybeSet('make', row.make, existing.make)
  maybeSet('model', row.model, existing.model)
  maybeSet('trim', row.trim, existing.trim)
  maybeSet('bodyStyle', row.bodyStyle, existing.bodyStyle)
  maybeSet('mileage', row.mileage, existing.mileage)
  maybeSet('price', row.price, existing.price)
  maybeSet('wholesalePrice', row.wholesalePrice, existing.wholesalePrice)
  maybeSet('status', row.status, existing.status)
  maybeSet('wholesaleStatus', row.wholesaleStatus, existing.wholesaleStatus)
  maybeSet('wholesaleNotes', row.wholesaleNotes, existing.wholesaleNotes)
  maybeSet('description', row.description, existing.description)

  if (row.available !== undefined && row.available !== existing.available) {
    payload.available = row.available
    hasChanges = true
  }
  if (row.isPublished !== undefined && row.isPublished !== existing.isPublished) {
    payload.isPublished = row.isPublished
    hasChanges = true
  }
  if (row.isFeatured !== undefined && row.isFeatured !== existing.isFeatured) {
    payload.isFeatured = row.isFeatured
    hasChanges = true
  }
  if (row.isWholesaleVisible !== undefined && row.isWholesaleVisible !== existing.isWholesaleVisible) {
    payload.isWholesaleVisible = row.isWholesaleVisible
    hasChanges = true
  }

  const incomingScore = scoreIncoming(row)
  const existingScore = scoreCompleteness(existing)
  if (incomingScore < 3 && existingScore > incomingScore) {
    return { payload, hasChanges, hasConflict: true }
  }

  return { payload, hasChanges, hasConflict }
}

function buildCreatePayload(row: ParsedInventoryRow): InventoryRecordCreateInput {
  return {
    vin: row.vin,
    stockNumber: row.stockNumber,
    year: row.year || new Date().getFullYear(),
    make: row.make || 'Unknown',
    model: row.model || 'Vehicle',
    trim: row.trim,
    bodyStyle: row.bodyStyle,
    mileage: row.mileage,
    price: row.price,
    wholesalePrice: row.wholesalePrice,
    isWholesaleVisible: row.isWholesaleVisible ?? false,
    wholesaleStatus: row.wholesaleStatus,
    wholesaleNotes: row.wholesaleNotes,
    status: row.status || 'inventory',
    available: row.available ?? true,
    isPublished: row.isPublished ?? false,
    isFeatured: row.isFeatured ?? false,
    description: row.description,
  }
}

function prepareRows(parsedRows: ParsedInventoryRow[], existingRecords: InventoryRecord[]): PreparedRow[] {
  const seenKeys = new Set<string>()

  return parsedRows.map((parsed) => {
    const identityKey = `${parsed.vin || ''}|${parsed.stockNumber || ''}`
    if (identityKey !== '|' && seenKeys.has(identityKey)) {
      return { parsed, action: 'review', reason: 'Duplicate VIN/stock found in import file.' }
    }
    if (identityKey !== '|') seenKeys.add(identityKey)

    if (!parsed.make || !parsed.model || !parsed.year) {
      return { parsed, action: 'review', reason: 'Missing required vehicle fields (year/make/model).' }
    }

    const matched = findMatchingRecord(existingRecords, parsed)
    if (!matched) {
      return {
        parsed,
        action: 'create',
        reason: 'New inventory unit detected.',
        createPayload: buildCreatePayload(parsed),
      }
    }

    const { payload, hasChanges, hasConflict } = buildUpdatePayload(matched, parsed)
    if (hasConflict) {
      return {
        parsed,
        action: 'review',
        reason: `Potential conflict with existing unit ${matched.id}.`,
        matchedId: matched.id,
        updatePayload: payload,
      }
    }

    if (!hasChanges) {
      return {
        parsed,
        action: 'skip',
        reason: `Existing unit ${matched.id} already has equal or better data.`,
        matchedId: matched.id,
      }
    }

    return {
      parsed,
      action: 'update',
      reason: `Update existing unit ${matched.id} with stronger incoming fields.`,
      matchedId: matched.id,
      updatePayload: payload,
    }
  })
}

export function InventoryImportPage() {
  const { records, refresh } = useInventoryCatalog()

  const [fileName, setFileName] = useState('')
  const [preparedRows, setPreparedRows] = useState<PreparedRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [results, setResults] = useState<AppliedResult[]>([])

  const stats = useMemo(() => {
    const createCount = preparedRows.filter((r) => r.action === 'create').length
    const updateCount = preparedRows.filter((r) => r.action === 'update').length
    const reviewCount = preparedRows.filter((r) => r.action === 'review').length
    const skipCount = preparedRows.filter((r) => r.action === 'skip').length
    return { createCount, updateCount, reviewCount, skipCount }
  }, [preparedRows])

  const reviewQueue = useMemo(
    () => preparedRows.filter((r) => r.action === 'review'),
    [preparedRows],
  )

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setResults([])

    const supported = ['.csv', '.tsv', '.xlsx', '.xls', '.pdf', '.txt']
    const lower = file.name.toLowerCase()
    if (!supported.some((ext) => lower.endsWith(ext))) {
      setPreparedRows([])
      setFileName('')
      setError('Unsupported file type. Upload CSV, XLSX, PDF, TSV, or TXT.')
      return
    }

    setProcessing(true)
    setFileName(file.name)

    try {
      const sourceFileId = crypto.randomUUID()
      const fileRows = await ingestFile(file, sourceFileId)
      const parsed = parsePreparedRows(fileRows)
      const prepared = prepareRows(parsed, records)
      setPreparedRows(prepared)
    } catch (err) {
      setPreparedRows([])
      setError(`Failed to parse file: ${String(err)}`)
    } finally {
      setProcessing(false)
    }
  }, [records])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }, [handleFile])

  async function applyPreparedRows() {
    const actionable = preparedRows.filter((r) => r.action === 'create' || r.action === 'update')
    if (actionable.length === 0) {
      setError('No create/update rows are ready to apply.')
      return
    }

    setApplying(true)
    setError(null)

    const nextResults: AppliedResult[] = []
    for (const row of actionable) {
      try {
        if (row.action === 'create' && row.createPayload) {
          const result = await createRuntimeInventoryRecord(row.createPayload, true)
          const created = result.record
          if (!created) throw new Error('Runtime create returned null')
          nextResults.push({ rowIndex: row.parsed.rowIndex, action: 'created', message: `Created ${created.year} ${created.make} ${created.model}` })
        }

        if (row.action === 'update' && row.matchedId && row.updatePayload) {
          const updated = await updateRuntimeInventoryRecordFull(row.matchedId, row.updatePayload)
          if (!updated) throw new Error('Runtime update returned null')
          nextResults.push({ rowIndex: row.parsed.rowIndex, action: 'updated', message: `Updated ${updated.year} ${updated.make} ${updated.model}` })
        }
      } catch (err) {
        nextResults.push({ rowIndex: row.parsed.rowIndex, action: 'failed', message: String(err) })
      }
    }

    setResults(nextResults)
    setApplying(false)
    await refresh()
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory-import-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="ods-page ods-flow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Ingestion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Import CSV/XLSX/PDF, auto-detect duplicates, update stronger rows, and queue weak/conflicting rows for review.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample} className="gap-1.5">
          <DownloadSimple size={16} />
          Download Sample
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="rounded-xl border border-border bg-card/70 p-4 text-sm">
          <p className="font-semibold">Apply Results</p>
          <div className="mt-2 space-y-1.5 text-muted-foreground">
            {results.map((result) => (
              <p key={`${result.rowIndex}-${result.action}`}>
                Row {result.rowIndex + 1}: {result.action.toUpperCase()} - {result.message}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="py-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 py-14 text-center"
          >
            <Upload size={42} className="mb-4 text-muted-foreground/60" />
            <h2 className="text-lg font-semibold">Drop inventory file here</h2>
            <p className="mt-1 text-sm text-muted-foreground">Supports CSV, TSV, XLSX, XLS, PDF, and TXT</p>
            <label className="mt-6 cursor-pointer">
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent">
                <FileText size={16} />
                Choose File
              </span>
              <input type="file" accept=".csv,.tsv,.xlsx,.xls,.pdf,.txt" className="sr-only" onChange={handleFileInput} />
            </label>
            {fileName ? <p className="mt-3 text-xs text-muted-foreground">Loaded: {fileName}</p> : null}
            {processing ? <p className="mt-2 text-xs text-muted-foreground">Parsing and preparing rows...</p> : null}
          </div>
        </CardContent>
      </Card>

      {preparedRows.length > 0 ? (
        <>
          <div className="ods-toolbar justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Create {stats.createCount}</Badge>
              <Badge variant="secondary">Update {stats.updateCount}</Badge>
              <Badge variant="outline">Review {stats.reviewCount}</Badge>
              <Badge variant="outline">Skip {stats.skipCount}</Badge>
            </div>
            <Button onClick={() => void applyPreparedRows()} disabled={applying || (stats.createCount + stats.updateCount === 0)} className="gap-1.5">
              {applying ? <ArrowsClockwise className="animate-spin" size={16} /> : <ArrowClockwise size={16} />}
              Apply Import
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prepared Rows</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>VIN / Stock</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preparedRows.map((row) => {
                    const decisionClass =
                      row.action === 'create'
                        ? 'text-emerald-600'
                        : row.action === 'update'
                        ? 'text-blue-600'
                        : row.action === 'review'
                        ? 'text-amber-600'
                        : 'text-muted-foreground'

                    return (
                      <TableRow key={row.parsed.rowIndex}>
                        <TableCell>{row.parsed.rowIndex + 1}</TableCell>
                        <TableCell>
                          <ManufacturerMark make={row.parsed.make} size="sm" showLabel />
                        </TableCell>
                        <TableCell>
                          {(row.parsed.year || '----')} {row.parsed.make || 'Unknown'} {row.parsed.model || ''} {row.parsed.trim || ''}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.parsed.vin || row.parsed.stockNumber || '—'}</TableCell>
                        <TableCell className={decisionClass}>{row.action.toUpperCase()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.reason}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review Needed Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewQueue.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle size={16} />No review-needed rows.</div>
              ) : (
                <div className="space-y-2">
                  {reviewQueue.map((row) => (
                    <div key={`review-${row.parsed.rowIndex}`} className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">Row {row.parsed.rowIndex + 1}: {(row.parsed.year || '----')} {row.parsed.make || 'Unknown'} {row.parsed.model || ''}</span>
                        <Badge variant="outline" className="text-amber-700">Review</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{row.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingestion Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- VIN/stock matching is used for duplicate detection against existing runtime inventory.</p>
          <p>- Incoming rows update existing units only when data is stronger or missing on current records.</p>
          <p>- Weak or conflicting rows are quarantined into the review queue instead of auto-writing.</p>
          <p>- Import writes always use the canonical runtime inventory create/update functions.</p>
        </CardContent>
      </Card>
    </div>
  )
}
