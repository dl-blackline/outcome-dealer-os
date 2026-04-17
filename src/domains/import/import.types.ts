import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

// ─── Raw ingest layer ───────────────────────────────────────────────────────

/** A single row normalised from any source file before AI extraction */
export interface RawRow {
  /** Opaque text blob for the whole row when no columns are present */
  rawText: string
  /** Parsed column map when headers are available */
  rawColumns?: Record<string, string>
  /** ID of the parent ImportJob */
  sourceFileId: UUID
  /** Zero-based row index within the source file */
  rowIndex: number
}

// ─── AI / extraction layer ───────────────────────────────────────────────────

export type RecordType = 'CUSTOMER_ONLY' | 'CUSTOMER_WITH_DEAL' | 'DEAL_ONLY' | 'UNKNOWN'

/** Extracted customer data (all fields optional – never hallucinated) */
export interface ExtractedCustomer {
  firstName: string | null
  lastName: string | null
  phone: string | null       // E.164 normalised when possible
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
}

/** Extracted deal data (all fields optional – never hallucinated) */
export interface ExtractedDeal {
  vehicleYear: number | null
  vehicleMake: string | null
  vehicleModel: string | null
  vin: string | null
  purchasePrice: number | null
  salePrice: number | null
  profitLoss: number | null   // computed when purchasePrice + salePrice known
  dealDate: string | null
  salesperson: string | null
  notes: string | null
}

export interface ExtractionResult {
  recordType: RecordType
  customer: ExtractedCustomer
  deal: ExtractedDeal | null
  confidenceScore: number   // 0–1
  rowIndex: number
  sourceFileId: UUID
}

// ─── ImportJob entity ────────────────────────────────────────────────────────

export type ImportJobStatus = 'pending' | 'processing' | 'complete' | 'complete_with_errors' | 'failed'

export interface ImportJobRow extends DbRow {
  file_name: string
  status: ImportJobStatus
  total_rows: number
  processed_rows: number
  failed_rows: number
  source_import_id: UUID   // canonical idempotency key = job id
}

export interface ImportJob {
  id: UUID
  fileName: string
  status: ImportJobStatus
  totalRows: number
  processedRows: number
  failedRows: number
  sourceImportId: UUID
  createdAt: string
  updatedAt: string
}

export function mapImportJobRowToDomain(row: ImportJobRow): ImportJob {
  return {
    id: row.id,
    fileName: row.file_name,
    status: row.status,
    totalRows: row.total_rows,
    processedRows: row.processed_rows,
    failedRows: row.failed_rows,
    sourceImportId: row.source_import_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

// ─── Per-row processing result ────────────────────────────────────────────────

export type RowOutcome = 'created' | 'updated' | 'skipped' | 'failed'

export interface ImportRowResult {
  rowIndex: number
  outcome: RowOutcome
  customerId?: UUID
  dealId?: UUID
  message?: string
  extraction: ExtractionResult
}
