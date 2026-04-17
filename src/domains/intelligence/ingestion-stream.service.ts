/**
 * Real-time Ingestion Streaming Service.
 *
 * Implements an in-memory SSE-style event emitter for the ingestion pipeline.
 * Any component can subscribe to ingestion events via `onIngestionEvent`.
 *
 * Event types mirror the pipeline stages:
 *   job_started -> row_parsed -> ai_extracted -> customer_created ->
 *   deal_created -> deduplicated -> vin_enriched -> clv_updated ->
 *   rep_attributed -> probability_scored -> job_complete | row_error
 *
 * The `runDemoIngestionJob` function simulates a full pipeline run
 * so the dashboard has live data to display.
 */
import {
  IngestionEvent,
  IngestionEventType,
  IngestionJobState,
} from './intelligence.types'

// ─── In-memory event bus ──────────────────────────────────────────────────────

type IngestionListener = (event: IngestionEvent) => void
type JobStateListener = (state: IngestionJobState) => void

const eventListeners: IngestionListener[] = []
const jobStateListeners: JobStateListener[] = []

let currentJobState: IngestionJobState = {
  jobId: '',
  totalRows: 0,
  processedRows: 0,
  successCount: 0,
  errorCount: 0,
  rowsPerSecond: 0,
  status: 'idle',
  aiConfidenceDistribution: { high: 0, medium: 0, low: 0 },
}

export function onIngestionEvent(listener: IngestionListener): () => void {
  eventListeners.push(listener)
  return () => {
    const idx = eventListeners.indexOf(listener)
    if (idx >= 0) eventListeners.splice(idx, 1)
  }
}

export function onJobStateChange(listener: JobStateListener): () => void {
  jobStateListeners.push(listener)
  return () => {
    const idx = jobStateListeners.indexOf(listener)
    if (idx >= 0) jobStateListeners.splice(idx, 1)
  }
}

export function getCurrentJobState(): IngestionJobState {
  return { ...currentJobState }
}

function emit(jobId: string, type: IngestionEventType, message: string, data?: Record<string, unknown>, confidence?: number): void {
  const event: IngestionEvent = {
    id: crypto.randomUUID(),
    jobId,
    type,
    timestamp: new Date().toISOString(),
    message,
    data,
    confidence,
  }
  for (const listener of eventListeners) {
    try { listener(event) } catch { /* ignore listener errors */ }
  }
}

function updateJobState(patch: Partial<IngestionJobState>): void {
  currentJobState = { ...currentJobState, ...patch }
  for (const listener of jobStateListeners) {
    try { listener({ ...currentJobState }) } catch { /* ignore */ }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Demo ingestion simulation ────────────────────────────────────────────────

interface DemoRow {
  customerName: string
  vehicle: string
  source: string
  repName: string
  vin?: string
  amount: number
  confidence: number
}

const DEMO_ROWS: DemoRow[] = [
  { customerName: 'James Walker', vehicle: '2023 Chevrolet Silverado 1500', source: 'Referral', repName: 'John Smith', vin: '1GCUDCED5NZ123456', amount: 48500, confidence: 0.94 },
  { customerName: 'Priya Patel', vehicle: '2022 Toyota Camry XSE', source: 'Website Form', repName: 'Lisa Chen', vin: '4T1G11AK5NU123456', amount: 31200, confidence: 0.87 },
  { customerName: 'Derek Nguyen', vehicle: '2024 Honda Pilot TrailSport', source: 'Phone Call', repName: 'Mike Torres', vin: '5FNYF8H97SB123456', amount: 44900, confidence: 0.91 },
  { customerName: 'Samantha Brooks', vehicle: '2021 Ford Bronco Sport', source: 'Trade-In Appraisal', repName: 'John Smith', vin: '3FMCR9C61MRA12345', amount: 36700, confidence: 0.78 },
  { customerName: 'Carlos Rivera', vehicle: '2023 Jeep Grand Cherokee L', source: 'Email Campaign', repName: 'Lisa Chen', amount: 53100, confidence: 0.62 },
  { customerName: 'Amanda Foster', vehicle: '2022 Subaru Outback Limited', source: 'Social Media', repName: 'Mike Torres', vin: '4S4BTALC2N3123456', amount: 38400, confidence: 0.55 },
]

let demoRunning = false

export async function runDemoIngestionJob(): Promise<void> {
  if (demoRunning) return
  demoRunning = true

  const jobId = `job-${Date.now()}`
  const totalRows = DEMO_ROWS.length
  const startedAt = new Date().toISOString()

  updateJobState({
    jobId,
    totalRows,
    processedRows: 0,
    successCount: 0,
    errorCount: 0,
    rowsPerSecond: 0,
    status: 'running',
    startedAt,
    completedAt: undefined,
    aiConfidenceDistribution: { high: 0, medium: 0, low: 0 },
  })

  emit(jobId, 'job_started', `Ingestion job ${jobId} started — ${totalRows} rows queued`)

  await sleep(400)

  const confDist = { high: 0, medium: 0, low: 0 }
  const startMs = Date.now()

  for (let i = 0; i < DEMO_ROWS.length; i++) {
    const row = DEMO_ROWS[i]
    await sleep(600 + Math.random() * 400)

    emit(jobId, 'row_parsed', `Row ${i + 1}: ${row.customerName} — ${row.vehicle}`, { row: i + 1 })
    await sleep(200)

    emit(jobId, 'ai_extracted', `AI extracted — ${row.vehicle} (${Math.round(row.confidence * 100)}% confidence)`, { customerName: row.customerName }, row.confidence)

    if (row.confidence >= 0.85) confDist.high++
    else if (row.confidence >= 0.65) confDist.medium++
    else confDist.low++

    await sleep(150)

    emit(jobId, 'customer_created', `Customer created: ${row.customerName}`, { name: row.customerName, source: row.source })
    await sleep(100)

    emit(jobId, 'deal_created', `Deal attached: ${row.vehicle} — $${row.amount.toLocaleString()}`, { vehicle: row.vehicle, amount: row.amount })
    await sleep(100)

    if (row.vin) {
      emit(jobId, 'vin_enriched', `VIN decoded: ${row.vin}`, { vin: row.vin })
      await sleep(100)
    }

    emit(jobId, 'clv_updated', `CLV recalculated for ${row.customerName}`)
    await sleep(80)

    emit(jobId, 'rep_attributed', `Rep assigned: ${row.repName} (CLOSE)`, { rep: row.repName })
    await sleep(80)

    emit(jobId, 'probability_scored', `Close probability scored`, { score: Math.round((row.confidence * 0.9 + 0.05) * 100) })

    const elapsedSec = (Date.now() - startMs) / 1000
    const rps = elapsedSec > 0 ? Math.round((i + 1) / elapsedSec * 10) / 10 : 0

    updateJobState({
      processedRows: i + 1,
      successCount: i + 1,
      rowsPerSecond: rps,
      aiConfidenceDistribution: { ...confDist },
    })
  }

  await sleep(300)

  const completedAt = new Date().toISOString()
  emit(jobId, 'job_complete', `Job complete — ${totalRows}/${totalRows} rows processed successfully`)

  updateJobState({
    status: 'complete',
    completedAt,
    rowsPerSecond: 0,
  })

  demoRunning = false
}

export function resetDemoJob(): void {
  demoRunning = false
  updateJobState({
    jobId: '',
    totalRows: 0,
    processedRows: 0,
    successCount: 0,
    errorCount: 0,
    rowsPerSecond: 0,
    status: 'idle',
    startedAt: undefined,
    completedAt: undefined,
    aiConfidenceDistribution: { high: 0, medium: 0, low: 0 },
  })
}
