/**
 * inventory.deduplication.ts
 *
 * Single-source-of-truth duplicate detection for inventory units.
 *
 * All creation paths (manual form, bulk import, CSV/XLSX decode, admin add) MUST
 * run these checks before inserting a new canonical inventory record.
 *
 * Priority order:
 *   1. VIN exact match         — highest confidence, definitive duplicate
 *   2. Stock number exact match — high confidence
 *   3. Source listing ID match  — high confidence when available
 *   4. Year + make + model + mileage similarity — secondary / soft match
 *
 * Callers receive a DuplicateCheckResult and decide how to proceed:
 *   - 'none'        → safe to create
 *   - 'exact'       → definitive duplicate, do not create silently
 *   - 'likely'      → probable match, warn user and require confirmation
 *   - 'ambiguous'   → possible match, send to review queue or warn
 */

import type { InventoryRecord } from './inventory.runtime'

// ── Result types ──────────────────────────────────────────────────────────────

export type DuplicateConfidence = 'none' | 'exact' | 'likely' | 'ambiguous'

export interface DuplicateMatch {
  /** The existing canonical record that may be a duplicate */
  record: InventoryRecord
  /** How confident we are this is a duplicate */
  confidence: DuplicateConfidence
  /** Human-readable reasons explaining why this was flagged */
  reasons: string[]
}

export interface DuplicateCheckResult {
  /** Overall confidence level (worst-case of all matches) */
  confidence: DuplicateConfidence
  /** All candidate matches, sorted by confidence descending */
  matches: DuplicateMatch[]
  /** True when there is at least one exact or likely match */
  isDuplicate: boolean
  /** Summary string suitable for displaying to a user */
  summary: string
}

// ── Input shape ───────────────────────────────────────────────────────────────

export interface DuplicateCheckInput {
  vin?: string
  stockNumber?: string
  sourceListingId?: string
  year?: number
  make?: string
  model?: string
  mileage?: number
  /** Optionally exclude a specific record id (useful when editing an existing record) */
  excludeId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeStr(s: string | undefined | null): string {
  return (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function vinNormalize(vin: string | undefined | null): string {
  return (vin ?? '').trim().toUpperCase()
}

/** Levenshtein distance for fuzzy title/name similarity */
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

function strSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

function confidenceOrder(c: DuplicateConfidence): number {
  const order: Record<DuplicateConfidence, number> = { exact: 3, likely: 2, ambiguous: 1, none: 0 }
  return order[c]
}

function worstConfidence(a: DuplicateConfidence, b: DuplicateConfidence): DuplicateConfidence {
  return confidenceOrder(a) >= confidenceOrder(b) ? a : b
}

// ── Core check ────────────────────────────────────────────────────────────────

/**
 * Run all duplicate checks against the provided catalog of existing records.
 *
 * This function is pure — it does not mutate any records or storage.
 * The caller is responsible for loading the current canonical inventory list
 * (via listRuntimeInventoryRecords) before calling this.
 */
export function checkInventoryDuplicates(
  input: DuplicateCheckInput,
  existingRecords: InventoryRecord[],
): DuplicateCheckResult {
  const candidates: DuplicateMatch[] = []

  const inputVin = vinNormalize(input.vin)
  const inputStock = normalizeStr(input.stockNumber)
  const inputSourceId = normalizeStr(input.sourceListingId)
  const inputYmm = normalizeStr(`${input.year ?? ''} ${input.make ?? ''} ${input.model ?? ''}`)

  for (const record of existingRecords) {
    if (input.excludeId && record.id === input.excludeId) continue

    const reasons: string[] = []
    let confidence: DuplicateConfidence = 'none'

    // 1. VIN exact match — highest priority
    const recordVin = vinNormalize(record.vin)
    if (inputVin && recordVin && inputVin === recordVin) {
      reasons.push(`VIN exact match: ${inputVin}`)
      confidence = 'exact'
    }

    // 2. Stock number exact match
    const recordStock = normalizeStr(record.stockNumber)
    if (inputStock && recordStock && inputStock === recordStock) {
      reasons.push(`Stock number exact match: ${input.stockNumber}`)
      confidence = worstConfidence(confidence, 'exact')
    }

    // 3. Source listing ID exact match
    const recordSourceId = normalizeStr(record.sourceListingId || record.listingId)
    if (inputSourceId && recordSourceId && inputSourceId === recordSourceId) {
      reasons.push(`Source listing ID match: ${input.sourceListingId}`)
      confidence = worstConfidence(confidence, 'exact')
    }

    // 4. Fuzzy year/make/model + mileage similarity (secondary)
    if (confidence === 'none' && input.year && input.make && input.model) {
      const recordYmm = normalizeStr(`${record.year} ${record.make} ${record.model}`)
      const ymmSim = strSimilarity(inputYmm, recordYmm)

      if (ymmSim >= 0.92) {
        // Same YMM, check mileage proximity
        if (
          input.mileage !== undefined &&
          record.mileage !== undefined &&
          Math.abs(input.mileage - record.mileage) <= 2000
        ) {
          reasons.push(
            `Very similar vehicle: ${record.year} ${record.make} ${record.model} with similar mileage (${record.mileage?.toLocaleString()} mi)`
          )
          confidence = 'likely'
        } else if (ymmSim >= 0.97) {
          reasons.push(
            `Identical year/make/model: ${record.year} ${record.make} ${record.model}`
          )
          confidence = 'ambiguous'
        }
      }
    }

    if (confidence !== 'none') {
      candidates.push({ record, confidence, reasons })
    }
  }

  // Sort by confidence descending
  candidates.sort(
    (a, b) => confidenceOrder(b.confidence) - confidenceOrder(a.confidence)
  )

  const overallConfidence: DuplicateConfidence =
    candidates.length === 0
      ? 'none'
      : candidates[0].confidence

  const isDuplicate = overallConfidence === 'exact' || overallConfidence === 'likely'

  let summary = 'No duplicates detected.'
  if (overallConfidence === 'exact') {
    summary = `Exact duplicate detected: ${candidates[0].reasons.join('; ')}`
  } else if (overallConfidence === 'likely') {
    summary = `Likely duplicate: ${candidates[0].reasons.join('; ')}`
  } else if (overallConfidence === 'ambiguous') {
    summary = `Possible duplicate — review required: ${candidates[0].reasons.join('; ')}`
  }

  return { confidence: overallConfidence, matches: candidates, isDuplicate, summary }
}

// ── Safe merge helper ─────────────────────────────────────────────────────────

/**
 * Merge incoming data onto an existing canonical record using safe rules:
 * - Never overwrite a non-blank field with a blank/undefined value
 * - Never wipe cost, pricing, recon, or photo data with public-side updates
 * - Always preserve canonical unit identity (id, vin, stockNumber)
 *
 * Returns the merged update object (partial) that can be passed to
 * updateRuntimeInventoryRecord / updateRuntimeInventoryRecordFull.
 */
export function safeMergeInventoryUpdate(
  existing: InventoryRecord,
  incoming: Partial<InventoryRecord>,
): Partial<InventoryRecord> {
  const merged: Partial<InventoryRecord> = {}

  // Always preserve identity — never overwrite with blank
  if (incoming.vin && !existing.vin) merged.vin = incoming.vin
  if (incoming.stockNumber && !existing.stockNumber) merged.stockNumber = incoming.stockNumber

  // Vehicle attributes — update only if incoming has a value
  if (incoming.year && incoming.year !== existing.year) merged.year = incoming.year
  if (incoming.make && incoming.make !== existing.make) merged.make = incoming.make
  if (incoming.model && incoming.model !== existing.model) merged.model = incoming.model
  if (incoming.trim && incoming.trim !== existing.trim) merged.trim = incoming.trim
  if (incoming.mileage !== undefined && incoming.mileage !== existing.mileage) merged.mileage = incoming.mileage
  if (incoming.bodyStyle && incoming.bodyStyle !== existing.bodyStyle) merged.bodyStyle = incoming.bodyStyle
  if (incoming.exteriorColor && !existing.exteriorColor) merged.exteriorColor = incoming.exteriorColor
  if (incoming.interiorColor && !existing.interiorColor) merged.interiorColor = incoming.interiorColor
  if (incoming.drivetrain && !existing.drivetrain) merged.drivetrain = incoming.drivetrain
  if (incoming.engine && !existing.engine) merged.engine = incoming.engine
  if (incoming.transmission && !existing.transmission) merged.transmission = incoming.transmission
  if (incoming.condition && !existing.condition) merged.condition = incoming.condition

  // Pricing — do not wipe existing values with blanks / zeros
  if (incoming.price && incoming.price > 0) merged.price = incoming.price
  if (incoming.wholesalePrice !== undefined && incoming.wholesalePrice > 0 && !existing.wholesalePrice) {
    merged.wholesalePrice = incoming.wholesalePrice
  }
  // Cost fields — never overwrite existing cost data with incoming blanks
  if (incoming.acquisitionCost !== undefined && incoming.acquisitionCost > 0 && !existing.acquisitionCost) {
    merged.acquisitionCost = incoming.acquisitionCost
  }
  if (incoming.dealerPack !== undefined && incoming.dealerPack > 0 && !existing.dealerPack) {
    merged.dealerPack = incoming.dealerPack
  }
  if (incoming.reconCostTotal !== undefined && incoming.reconCostTotal > 0) {
    merged.reconCostTotal = incoming.reconCostTotal
  }
  if (incoming.floorPlanInterest !== undefined && incoming.floorPlanInterest > 0) {
    merged.floorPlanInterest = incoming.floorPlanInterest
  }
  if (incoming.totalInvestedCost !== undefined && incoming.totalInvestedCost > 0) {
    merged.totalInvestedCost = incoming.totalInvestedCost
  }

  // Public merchandising — safe to update from public side
  if (incoming.description) merged.description = incoming.description
  if (incoming.features && incoming.features.length > 0) merged.features = incoming.features
  if (incoming.isPublished !== undefined) merged.isPublished = incoming.isPublished
  if (incoming.isFeatured !== undefined) merged.isFeatured = incoming.isFeatured
  if (incoming.available !== undefined) merged.available = incoming.available

  // Status — update only if explicitly provided
  if (incoming.status) merged.status = incoming.status

  // Recon — never wipe recon stage / known issues with blank
  if (incoming.reconStage) merged.reconStage = incoming.reconStage
  if (incoming.knownIssues && incoming.knownIssues.length > 0) merged.knownIssues = incoming.knownIssues

  // Documents — append, do not replace
  if (incoming.documentLinks && incoming.documentLinks.length > 0) {
    const existingLinks = existing.documentLinks ?? []
    const existingUrls = new Set(existingLinks.map((d) => d.url))
    const newLinks = incoming.documentLinks.filter((d) => !existingUrls.has(d.url))
    if (newLinks.length > 0) {
      merged.documentLinks = [...existingLinks, ...newLinks]
    }
  }

  return merged
}

// ── Import resolution helper ──────────────────────────────────────────────────

export type ImportRowResolution = 'create' | 'update' | 'skip' | 'review'

export interface ImportResolutionResult {
  resolution: ImportRowResolution
  existingRecord?: InventoryRecord
  mergedUpdate?: Partial<InventoryRecord>
  reason: string
}

/**
 * Decide how to handle an incoming inventory row during import.
 *
 * - exact duplicate → skip (same VIN/stock with same data)
 * - same unit with better/newer data → update (safe merge)
 * - ambiguous match → review queue
 * - no match → create new canonical unit
 */
export function resolveImportRow(
  incoming: Partial<InventoryRecord> & { year: number; make: string; model: string },
  existingRecords: InventoryRecord[],
): ImportResolutionResult {
  const check = checkInventoryDuplicates(
    {
      vin: incoming.vin,
      stockNumber: incoming.stockNumber,
      sourceListingId: incoming.sourceListingId,
      year: incoming.year,
      make: incoming.make,
      model: incoming.model,
      mileage: incoming.mileage,
    },
    existingRecords,
  )

  if (check.confidence === 'none') {
    return { resolution: 'create', reason: 'No existing record found — creating new canonical unit.' }
  }

  if (check.confidence === 'ambiguous') {
    return {
      resolution: 'review',
      existingRecord: check.matches[0].record,
      reason: `Ambiguous match — manual review required. ${check.summary}`,
    }
  }

  if (check.confidence === 'exact' || check.confidence === 'likely') {
    const best = check.matches[0].record
    const merged = safeMergeInventoryUpdate(best, incoming as Partial<InventoryRecord>)

    if (Object.keys(merged).length === 0) {
      return {
        resolution: 'skip',
        existingRecord: best,
        reason: `Exact duplicate — no new data to update. ${check.summary}`,
      }
    }

    return {
      resolution: 'update',
      existingRecord: best,
      mergedUpdate: merged,
      reason: `${check.confidence === 'exact' ? 'Exact' : 'Likely'} match — updating existing canonical unit. ${check.summary}`,
    }
  }

  return { resolution: 'create', reason: 'No definitive match — creating new canonical unit.' }
}
