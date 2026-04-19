import { useState, useCallback } from 'react'
import { createRuntimeInventoryRecord } from '@/domains/inventory/inventory.runtime'
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
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  FileText,
  CheckCircle,
  Warning,
  X,
  ArrowRight,
  DownloadSimple,
} from '@phosphor-icons/react'

/** Expected CSV columns (case-insensitive, underscore/space normalised) */
const COLUMN_MAP: Record<string, string> = {
  vin: 'vin',
  stock_number: 'stockNumber',
  stock: 'stockNumber',
  year: 'year',
  make: 'make',
  model: 'model',
  trim: 'trim',
  mileage: 'mileage',
  miles: 'mileage',
  list_price: 'listPrice',
  list: 'listPrice',
  sale_price: 'salePrice',
  internet_price: 'salePrice',
  acquisition_cost: 'acquisitionCost',
  cost: 'acquisitionCost',
  status: 'status',
  recon_status: 'reconStatus',
}

interface ParsedRow {
  vin?: string
  stockNumber?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  listPrice?: number
  salePrice?: number
  acquisitionCost?: number
  status?: string
  reconStatus?: string
  _raw: Record<string, string>
  _errors: string[]
}

function normaliseKey(key: string): string {
  return key.toLowerCase().replace(/[\s-]/g, '_')
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const headerRaw = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''))
  const headers = headerRaw.map(normaliseKey)

  const parsed = lines.slice(1).map((line) => {
    const values = parseCsvLine(line).map((v) => v.replace(/^"|"$/g, ''))
    const raw: Record<string, string> = {}
    headers.forEach((h, i) => {
      raw[headerRaw[i]] = values[i] ?? ''
    })

    const row: ParsedRow = { _raw: raw, _errors: [] }

    headers.forEach((normHeader, i) => {
      const field = COLUMN_MAP[normHeader]
      if (!field) return
      const val = values[i] ?? ''

      switch (field) {
        case 'vin':
          row.vin = val || undefined
          break
        case 'stockNumber':
          row.stockNumber = val || undefined
          break
        case 'make':
          row.make = val || undefined
          break
        case 'model':
          row.model = val || undefined
          break
        case 'trim':
          row.trim = val || undefined
          break
        case 'status':
          row.status = val || undefined
          break
        case 'reconStatus':
          row.reconStatus = val || undefined
          break
        case 'year': {
          const n = parseInt(val, 10)
          if (!isNaN(n) && n > 1900 && n <= new Date().getFullYear() + 2) {
            row.year = n
          } else if (val) {
            row._errors.push(`Invalid year: ${val}`)
          }
          break
        }
        case 'mileage': {
          const n = parseInt(val.replace(/,/g, ''), 10)
          if (!isNaN(n) && n >= 0) {
            row.mileage = n
          } else if (val) {
            row._errors.push(`Invalid mileage: ${val}`)
          }
          break
        }
        case 'listPrice':
        case 'salePrice':
        case 'acquisitionCost': {
          const n = parseFloat(val.replace(/[$,]/g, ''))
          if (!isNaN(n) && n >= 0) {
            row[field as 'listPrice' | 'salePrice' | 'acquisitionCost'] = n
          } else if (val) {
            row._errors.push(`Invalid ${field}: ${val}`)
          }
          break
        }
      }
    })

    if (!row.vin && !row.stockNumber) {
      row._errors.push('Must have VIN or Stock Number')
    }
    if (!row.make || !row.model) {
      row._errors.push('Make and Model are required')
    }

    return row
  })

  const seenVin = new Set<string>()
  const seenStock = new Set<string>()

  for (const row of parsed) {
    const vin = (row.vin || '').trim().toUpperCase()
    if (vin) {
      if (seenVin.has(vin)) {
        row._errors.push(`Duplicate VIN in file: ${vin}`)
      } else {
        seenVin.add(vin)
      }
    }

    const stock = (row.stockNumber || '').trim().toUpperCase()
    if (stock) {
      if (seenStock.has(stock)) {
        row._errors.push(`Duplicate stock number in file: ${stock}`)
      } else {
        seenStock.add(stock)
      }
    }
  }

  return parsed
}

function describeRow(row: ParsedRow): string {
  const parts: string[] = []
  if (row.year) parts.push(String(row.year))
  if (row.make) parts.push(row.make)
  if (row.model) parts.push(row.model)
  if (row.trim) parts.push(row.trim)
  return parts.join(' ') || '(Unknown)'
}

type ImportStatus = 'success' | 'error'

interface ImportResult {
  row: ParsedRow
  status: ImportStatus
  message?: string
}

const SAMPLE_CSV = `vin,stock_number,year,make,model,trim,mileage,list_price,sale_price,status
1HGBH41JXMN109186,STK-001,2023,Honda,Accord,Sport,12500,29900,28900,frontline
1FTFW1ET5NFA12345,STK-002,2022,Ford,F-150,XLT,28700,45500,43900,frontline
5YJ3E1EA1NF123456,STK-003,2021,Tesla,Model 3,Long Range,41000,39900,38500,frontline`

export function InventoryImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const validRows = rows.filter((r) => r._errors.length === 0)
  const invalidRows = rows.filter((r) => r._errors.length > 0)

  const handleFile = useCallback((file: File) => {
    setImportError(null)

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setRows([])
      setFileName('')
      setImportError('Unsupported file type. Please upload a .csv file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setRows([])
      setFileName('')
      setImportError('File is too large. Please upload a CSV under 5MB.')
      return
    }

    setFileName(file.name)
    setResults([])
    setImportDone(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setImportError('No valid rows detected. Ensure the file includes a header row and at least one data row.')
      }
      setRows(parsed)
    }
    reader.onerror = () => {
      setImportError('Could not read this file. Please try again.')
      setRows([])
      setFileName('')
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  async function handleImport() {
    if (validRows.length === 0) {
      setImportError('No valid rows available to import.')
      return
    }

    setImportError(null)
    setImporting(true)
    const importResults: ImportResult[] = []

    for (const row of validRows) {
      try {
        const created = await createRuntimeInventoryRecord({
          vin: row.vin,
          stockNumber: row.stockNumber,
          year: row.year || new Date().getFullYear(),
          make: row.make || 'Unknown',
          model: row.model || 'Vehicle',
          trim: row.trim,
          mileage: row.mileage,
          price: row.salePrice ?? row.listPrice,
          status: row.status || 'inventory',
          isPublished: false,
          available: true,
          description: `${describeRow(row)} imported from inventory CSV.`,
        })

        if (created) {
          importResults.push({ row, status: 'success' })
        } else {
          importResults.push({ row, status: 'error', message: 'Record was not created.' })
        }
      } catch (err) {
        importResults.push({ row, status: 'error', message: String(err) })
      }
    }

    setResults(importResults)
    setImporting(false)
    setImportDone(true)
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

  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <div className="space-y-10 pb-8">
      {importError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {importError}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory CSV Import</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a CSV export from your DMS to bulk-import inventory units.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample} className="gap-1.5">
          <DownloadSimple size={16} />
          Download Sample CSV
        </Button>
      </div>

      {/* Upload zone */}
      {rows.length === 0 && (
        <Card>
          <CardContent className="py-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
            >
              <Upload size={48} className="mb-4 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold">Drop a CSV file here</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Or click to browse from your computer
              </p>
              <label className="mt-6 cursor-pointer">
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                  <FileText size={16} />
                  Choose CSV File
                </span>
                <input
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </label>
              <p className="mt-4 text-xs text-muted-foreground">
                Supported columns: VIN, Stock Number, Year, Make, Model, Trim, Mileage,
                List Price, Sale Price, Acquisition Cost, Status
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed preview */}
      {rows.length > 0 && !importDone && (
        <div className="space-y-4">
          {/* Summary bar */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-muted-foreground" />
                  <span className="font-medium text-sm">{fileName}</span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <Badge variant="secondary">{rows.length} rows parsed</Badge>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <CheckCircle size={12} weight="fill" className="mr-1" />
                  {validRows.length} valid
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <Warning size={12} weight="fill" className="mr-1" />
                    {invalidRows.length} with errors
                  </Badge>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setRows([]); setFileName(''); setImportError(null) }}
                    className="gap-1"
                  >
                    <X size={14} />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    disabled={validRows.length === 0 || importing}
                    onClick={handleImport}
                    className="gap-1.5"
                  >
                    {importing ? 'Importing…' : `Import ${validRows.length} Units`}
                    {!importing && <ArrowRight size={14} />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>VIN / Stock</TableHead>
                    <TableHead className="text-right">Mileage</TableHead>
                    <TableHead className="text-right">List Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx} className={row._errors.length > 0 ? 'bg-red-50/50' : ''}>
                      <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                      <TableCell className="font-medium text-sm">{describeRow(row)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {row.vin ?? row.stockNumber ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.mileage != null
                          ? new Intl.NumberFormat('en-US').format(row.mileage)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.listPrice != null
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(row.listPrice)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {row.status ? (
                          <Badge variant="outline" className="text-xs">
                            {row.status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">inventory</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row._errors.length === 0 ? (
                          <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Warning size={16} weight="fill" className="text-red-500 shrink-0" />
                            <span className="text-xs text-red-600">
                              {row._errors.join('; ')}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Import results */}
      {importDone && (
        <div className="space-y-4">
          <Card className={successCount > 0 ? 'border-emerald-200 bg-emerald-50/50' : ''}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                    errorCount === 0 ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}
                >
                  <CheckCircle
                    size={32}
                    weight="fill"
                    className={errorCount === 0 ? 'text-emerald-600' : 'text-amber-600'}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Import Complete — {successCount} of {validRows.length} units added
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {successCount} unit{successCount !== 1 ? 's' : ''} successfully imported.
                    {errorCount > 0 && ` ${errorCount} failed — see details below.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>VIN / Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{describeRow(r.row)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.row.vin ?? r.row.stockNumber ?? '—'}
                      </TableCell>
                      <TableCell>
                        {r.status === 'success' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">
                            Imported
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.message ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRows([])
                setFileName('')
                setResults([])
                setImportDone(false)
              }}
            >
              Import Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
