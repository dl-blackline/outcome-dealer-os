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

/**
 * Emit an ingestion event to all subscribers.
 * Call this from real ingestion pipelines to stream progress to the UI.
 */
export function emitIngestionEvent(jobId: string, type: IngestionEventType, message: string, data?: Record<string, unknown>, confidence?: number): void {
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

/**
 * Update the current ingestion job state and notify all subscribers.
 * Call this from real ingestion pipelines to update progress in the UI.
 */
export function updateIngestionJobState(patch: Partial<IngestionJobState>): void {
  currentJobState = { ...currentJobState, ...patch }
  for (const listener of jobStateListeners) {
    try { listener({ ...currentJobState }) } catch { /* ignore */ }
  }
}
