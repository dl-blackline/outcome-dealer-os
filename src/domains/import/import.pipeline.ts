/**
 * import.pipeline.ts
 *
 * Batch processing pipeline:
 *   RawRow[] → AI extraction → Deduplication → DB write
 *
 * Each batch of BATCH_SIZE rows is processed sequentially (async, non-blocking
 * per-batch) so the UI can show live progress.  The caller supplies an optional
 * onProgress callback that is fired after every batch.
 */
import { UUID, ServiceContext } from '@/types/common'
import { findMany, insert } from '@/lib/db/helpers'
import { CustomerRow, DbRow } from '@/lib/db/supabase'
import {
  createCustomer,
  updateCustomer,
} from '@/domains/customers/customer.service'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { RawRow, ImportRowResult, ExtractionResult, ImportJobStatus } from './import.types'
import { extractFromRow, normalizePhone } from './import.ai'
import { updateImportJob } from './import.service'

const BATCH_SIZE = 100

// ─── Deduplication ────────────────────────────────────────────────────────────

/** Levenshtein distance – used for fuzzy name matching */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen
}

/**
 * Find an existing customer matching by:
 *  1. Phone (primary) – exact E.164 match
 *  2. Email (secondary) – case-insensitive exact
 *  3. Fuzzy name + partial address (fallback, threshold 0.85)
 */
async function findMatchingCustomer(
  ext: ExtractionResult
): Promise<CustomerRow | null> {
  const all = await findMany<CustomerRow>('customers')

  // 1. Phone match
  if (ext.customer.phone) {
    const byPhone = all.find(
      (r) => normalizePhone(r.phone) === ext.customer.phone
    )
    if (byPhone) return byPhone
  }

  // 2. Email match
  if (ext.customer.email) {
    const byEmail = all.find(
      (r) => r.email?.toLowerCase() === ext.customer.email!.toLowerCase()
    )
    if (byEmail) return byEmail
  }

  // 3. Fuzzy name + address
  const fullNameExt = [ext.customer.firstName, ext.customer.lastName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (fullNameExt.length >= 4) {
    for (const r of all) {
      const fullNameRow = [r.first_name, r.last_name].filter(Boolean).join(' ')
      const nameSim = similarity(fullNameExt, fullNameRow.toLowerCase())
      if (nameSim >= 0.85) {
        // Bonus: check zip or city match
        const sameZip = ext.customer.zip && r.zip && ext.customer.zip === r.zip
        const sameCity =
          ext.customer.city &&
          r.city &&
          ext.customer.city.toLowerCase() === r.city.toLowerCase()
        if (nameSim >= 0.92 || sameZip || sameCity) return r
      }
    }
  }

  return null
}

// ─── ImportedDeal row type ────────────────────────────────────────────────────

interface ImportedDealRow extends DbRow {
  customer_id: UUID
  vehicle_year: number | null
  vehicle_make: string | null
  vehicle_model: string | null
  vin: string | null
  purchase_price: number | null
  sale_price: number | null
  profit_loss: number | null
  deal_date: string | null
  salesperson: string | null
  notes: string | null
  source_import_id: UUID
}

async function insertImportedDeal(
  customerId: UUID,
  ext: ExtractionResult,
  sourceImportId: UUID
): Promise<UUID> {
  const row = await insert<ImportedDealRow>('imported_deals', {
    customer_id: customerId,
    vehicle_year: ext.deal!.vehicleYear,
    vehicle_make: ext.deal!.vehicleMake,
    vehicle_model: ext.deal!.vehicleModel,
    vin: ext.deal!.vin,
    purchase_price: ext.deal!.purchasePrice,
    sale_price: ext.deal!.salePrice,
    profit_loss: ext.deal!.profitLoss,
    deal_date: ext.deal!.dealDate,
    salesperson: ext.deal!.salesperson,
    notes: ext.deal!.notes,
    source_import_id: sourceImportId,
  })
  return row.id
}

// ─── Single-row processor ─────────────────────────────────────────────────────

async function processRow(
  row: RawRow,
  sourceImportId: UUID,
  ctx: ServiceContext
): Promise<ImportRowResult> {
  const ext = extractFromRow(row, row.sourceFileId)

  if (ext.recordType === 'UNKNOWN') {
    return {
      rowIndex: row.rowIndex,
      outcome: 'skipped',
      message: 'Could not extract any useful data from row',
      extraction: ext,
    }
  }

  try {
    // ── Customer upsert ──
    let customerId: UUID | undefined
    const existing = await findMatchingCustomer(ext)

    if (existing) {
      // Update with any new non-null fields
      const updatePayload: Parameters<typeof updateCustomer>[1] = {}
      if (ext.customer.phone && !existing.phone) updatePayload.phone = ext.customer.phone
      if (ext.customer.email && !existing.email) updatePayload.email = ext.customer.email
      if (ext.customer.address && !existing.address) updatePayload.address = ext.customer.address
      if (ext.customer.city && !existing.city) updatePayload.city = ext.customer.city
      if (ext.customer.state && !existing.state) updatePayload.state = ext.customer.state
      if (ext.customer.zip && !existing.zip) updatePayload.zip = ext.customer.zip

      if (Object.keys(updatePayload).length > 0) {
        await updateCustomer(existing.id, updatePayload, ctx)
      }

      customerId = existing.id
    } else if (
      ext.recordType === 'CUSTOMER_ONLY' ||
      ext.recordType === 'CUSTOMER_WITH_DEAL'
    ) {
      const result = await createCustomer(
        {
          firstName: ext.customer.firstName ?? undefined,
          lastName: ext.customer.lastName ?? undefined,
          fullName:
            [ext.customer.firstName, ext.customer.lastName].filter(Boolean).join(' ') ||
            undefined,
          phone: ext.customer.phone ?? undefined,
          email: ext.customer.email ?? undefined,
          address: ext.customer.address ?? undefined,
          city: ext.customer.city ?? undefined,
          state: ext.customer.state ?? undefined,
          zip: ext.customer.zip ?? undefined,
          source: `import:${sourceImportId}`,
          lifecycleStage: 'customer',
        },
        ctx
      )
      if (!result.ok) {
        return {
          rowIndex: row.rowIndex,
          outcome: 'failed',
          message: result.error.message,
          extraction: ext,
        }
      }
      customerId = result.value.id
    }

    // ── Deal insert ──
    let dealId: UUID | undefined
    if (ext.deal && customerId) {
      dealId = await insertImportedDeal(customerId, ext, sourceImportId)
      await writeAuditLog(
        {
          action: 'import.deal_created',
          objectType: 'imported_deal',
          objectId: dealId,
          after: { customerId, sourceImportId, rowIndex: row.rowIndex },
        },
        ctx
      )
    }

    return {
      rowIndex: row.rowIndex,
      outcome: existing ? 'updated' : 'created',
      customerId,
      dealId,
      extraction: ext,
    }
  } catch (error) {
    return {
      rowIndex: row.rowIndex,
      outcome: 'failed',
      message: String(error),
      extraction: ext,
    }
  }
}

// ─── Batch runner ─────────────────────────────────────────────────────────────

export interface PipelineOptions {
  jobId: UUID
  sourceImportId: UUID
  ctx: ServiceContext
  onProgress?: (processed: number, failed: number, total: number) => void
}

export async function runImportPipeline(
  rows: RawRow[],
  opts: PipelineOptions
): Promise<ImportRowResult[]> {
  const { jobId, sourceImportId, ctx, onProgress } = opts
  const results: ImportRowResult[] = []
  let processed = 0
  let failed = 0

  await updateImportJob(jobId, { status: 'processing', totalRows: rows.length })

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)

    for (const row of batch) {
      const result = await processRow(row, sourceImportId, ctx)
      results.push(result)
      processed++
      if (result.outcome === 'failed') failed++
    }

    // Yield to event loop between batches to keep the UI responsive
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    onProgress?.(processed, failed, rows.length)
    await updateImportJob(jobId, { processedRows: processed, failedRows: failed })
  }

  const finalStatus: ImportJobStatus =
    failed === rows.length
      ? 'failed'
      : failed > 0
        ? 'complete_with_errors'
        : 'complete'
  await updateImportJob(jobId, { status: finalStatus })

  return results
}
