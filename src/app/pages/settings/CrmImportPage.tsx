import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  SpinnerGap,
  UserPlus,
  Car,
  DownloadSimple,
} from '@phosphor-icons/react'
import { ingestFile } from '@/domains/import/import.ingest'
import { createImportJob } from '@/domains/import/import.service'
import { runImportPipeline } from '@/domains/import/import.pipeline'
import type { RawRow, ImportJob, ImportRowResult } from '@/domains/import/import.types'
import { extractFromRow } from '@/domains/import/import.ai'

const SYSTEM_CTX = { actorType: 'system' as const, actorId: 'crm-import' }

const ACCEPTED_TYPES = '.csv,.tsv,.xlsx,.xls,.txt,.pdf'

const SAMPLE_CSV = `first_name,last_name,phone,email,address,city,state,zip,vehicle_year,vehicle_make,vehicle_model,vin,purchase_price,sale_price,deal_date,salesperson
John,Smith,555-123-4567,john.smith@email.com,123 Main St,Springfield,IL,62701,2021,Toyota,Camry,SMPL00000000000001,24000,28500,2021-06-15,Sarah Jones
Maria,Garcia,(555) 987-6543,mgarcia@example.com,456 Oak Ave,Chicago,IL,60601,2022,Honda,Accord,SMPL00000000000002,22000,26900,2022-03-10,Bob Wilson
David,Lee,555.444.3322,,789 Pine Rd,Naperville,IL,60540,,,,,,,,`

type PageStep = 'upload' | 'preview' | 'processing' | 'results'

export function CrmImportPage() {
  const [step, setStep] = useState<PageStep>('upload')
  const [fileName, setFileName] = useState('')
  const [rows, setRows] = useState<RawRow[]>([])
  const [job, setJob] = useState<ImportJob | null>(null)
  const [results, setResults] = useState<ImportRowResult[]>([])
  const [progress, setProgress] = useState({ processed: 0, failed: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  // Preview extractions
  const previews = rows.slice(0, 10).map((r) => extractFromRow(r, r.sourceFileId))

  // Counts
  const successCount = results.filter((r) => r.outcome === 'created' || r.outcome === 'updated').length
  const failedCount = results.filter((r) => r.outcome === 'failed').length
  const skippedCount = results.filter((r) => r.outcome === 'skipped').length

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setFileName(file.name)
    try {
      const tempId = crypto.randomUUID()
      const parsed = await ingestFile(file, tempId)
      if (parsed.length === 0) {
        setError('No data rows found in file. Please check the file format.')
        return
      }
      setRows(parsed)
      setStep('preview')
    } catch (err) {
      setError(String(err))
    }
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
    setError(null)
    abortRef.current = false
    setStep('processing')
    setProgress({ processed: 0, failed: 0, total: rows.length })

    const jobResult = await createImportJob(fileName, rows.length)
    if (!jobResult.ok) {
      setError(jobResult.error.message)
      setStep('preview')
      return
    }

    const createdJob = jobResult.value
    setJob(createdJob)

    // Re-stamp sourceFileId on all rows with the canonical job id
    const stamped: RawRow[] = rows.map((r) => ({
      ...r,
      sourceFileId: createdJob.sourceImportId,
    }))

    const pipelineResults = await runImportPipeline(stamped, {
      jobId: createdJob.id,
      sourceImportId: createdJob.sourceImportId,
      ctx: SYSTEM_CTX,
      onProgress: (processed, failed, total) => {
        setProgress({ processed, failed, total })
      },
    })

    setResults(pipelineResults)
    setStep('results')
  }

  function reset() {
    setStep('upload')
    setFileName('')
    setRows([])
    setJob(null)
    setResults([])
    setProgress({ processed: 0, failed: 0, total: 0 })
    setError(null)
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crm-import-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-10 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Data Import</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bulk-import customers, leads, and historical vehicle deals from any CRM export.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample} className="gap-1.5">
          <DownloadSimple size={16} />
          Sample CSV
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <Warning size={16} weight="fill" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 1: Upload ── */}
      {step === 'upload' && (
        <Card>
          <CardContent className="py-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center transition-colors hover:border-primary/50 hover:bg-accent/30"
            >
              <Upload size={48} className="mb-4 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold">Drop your CRM export here</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Customers, deals, leads — any structured export from your existing CRM
              </p>
              <label className="mt-6 cursor-pointer">
                <span className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                  <FileText size={16} />
                  Choose File
                </span>
                <input
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </label>
              <p className="mt-4 text-xs text-muted-foreground">
                Supported: CSV, TSV, XLSX, XLS, TXT, PDF (text-based)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: Preview ── */}
      {step === 'preview' && (
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
                <Badge variant="secondary">{rows.length} rows detected</Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {previews.filter((p) => p.recordType === 'CUSTOMER_WITH_DEAL').length} with deals
                </Badge>
                <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">
                  {previews.filter((p) => p.recordType === 'CUSTOMER_ONLY').length} customer-only
                </Badge>
                {previews.filter((p) => p.recordType === 'UNKNOWN').length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    {previews.filter((p) => p.recordType === 'UNKNOWN').length} unrecognised
                  </Badge>
                )}
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={reset} className="gap-1">
                    <X size={14} />
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleImport} className="gap-1.5">
                    Import {rows.length} Records
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview table – first 10 rows */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Preview (first {Math.min(10, rows.length)} rows)
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle / Deal</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previews.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground text-xs">{p.rowIndex + 1}</TableCell>
                      <TableCell>
                        <RecordTypeBadge type={p.recordType} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {[p.customer.firstName, p.customer.lastName].filter(Boolean).join(' ') || (
                          <span className="text-muted-foreground text-xs">unknown</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.customer.phone && <div>{p.customer.phone}</div>}
                        {p.customer.email && <div>{p.customer.email}</div>}
                        {!p.customer.phone && !p.customer.email && '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.deal
                          ? [p.deal.vehicleYear, p.deal.vehicleMake, p.deal.vehicleModel]
                              .filter(Boolean)
                              .join(' ') || '—'
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfidenceBadge score={p.confidenceScore} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 10 && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-t">
                + {rows.length - 10} more rows not shown in preview
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── STEP 3: Processing ── */}
      {step === 'processing' && (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center gap-6">
              <SpinnerGap size={48} className="animate-spin text-primary" />
              <div className="w-full max-w-md space-y-2 text-center">
                <p className="font-medium">
                  Processing {progress.processed} / {progress.total} records…
                </p>
                <Progress
                  value={progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}
                  className="h-2"
                />
                {progress.failed > 0 && (
                  <p className="text-xs text-amber-600">{progress.failed} failed so far</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Deduplicating customers and writing to database…
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4: Results ── */}
      {step === 'results' && (
        <div className="space-y-4">
          {/* Summary card */}
          <Card className={failedCount === 0 ? 'border-emerald-200 bg-emerald-50/50' : ''}>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                    failedCount === 0 ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}
                >
                  <CheckCircle
                    size={32}
                    weight="fill"
                    className={failedCount === 0 ? 'text-emerald-600' : 'text-amber-600'}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Import Complete</h2>
                  <p className="text-sm text-muted-foreground">
                    Job ID: <span className="font-mono text-xs">{job?.id}</span>
                  </p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{successCount}</div>
                    <div className="text-xs text-muted-foreground">Imported</div>
                  </div>
                  {skippedCount > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-amber-500">{skippedCount}</div>
                      <div className="text-xs text-muted-foreground">Skipped</div>
                    </div>
                  )}
                  {failedCount > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Row Results</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto max-h-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-muted-foreground text-xs">
                        {r.rowIndex + 1}
                      </TableCell>
                      <TableCell>
                        <RecordTypeBadge type={r.extraction.recordType} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {[
                          r.extraction.customer.firstName,
                          r.extraction.customer.lastName,
                        ]
                          .filter(Boolean)
                          .join(' ') || (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                        {r.customerId && (
                          <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                            {r.customerId.slice(0, 8)}…
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.extraction.deal
                          ? [
                              r.extraction.deal.vehicleYear,
                              r.extraction.deal.vehicleMake,
                              r.extraction.deal.vehicleModel,
                            ]
                              .filter(Boolean)
                              .join(' ') || '—'
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <OutcomeBadge outcome={r.outcome} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {r.message ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              Import Another File
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecordTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'CUSTOMER_WITH_DEAL':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 gap-1 text-xs">
          <UserPlus size={10} />
          <Car size={10} />
          Customer + Deal
        </Badge>
      )
    case 'CUSTOMER_ONLY':
      return (
        <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 gap-1 text-xs">
          <UserPlus size={10} />
          Customer
        </Badge>
      )
    case 'DEAL_ONLY':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1 text-xs">
          <Car size={10} />
          Deal
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Unknown
        </Badge>
      )
  }
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color =
    pct >= 75
      ? 'text-emerald-700 bg-emerald-100'
      : pct >= 50
        ? 'text-amber-700 bg-amber-100'
        : 'text-red-700 bg-red-100'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {pct}%
    </span>
  )
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  switch (outcome) {
    case 'created':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">
          Created
        </Badge>
      )
    case 'updated':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
          Updated
        </Badge>
      )
    case 'skipped':
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
          Skipped
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">
          Failed
        </Badge>
      )
    default:
      return <Badge variant="outline" className="text-xs">{outcome}</Badge>
  }
}
