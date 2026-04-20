/**
 * VIN Enrichment Layer.
 *
 * Decodes vehicle data using the free NHTSA VIN Decode API:
 *   https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{VIN}?format=json
 *
 * Stores decoded data in `vin_enrichment` KV table.
 * Falls back to year/make/model from InventoryUnit if NHTSA is unavailable.
 *
 * Market value is estimated via a simple heuristic (depreciation model)
 * until a real pricing API (KBB, Edmunds, Black Book) is integrated.
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db } from '@/lib/db/supabase'
import { VinEnrichment, VinEnrichmentRow, NHTSAResponse } from './intelligence.types'

const TABLE = 'vin_enrichment'
const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin'

function rowToEnrichment(row: VinEnrichmentRow): VinEnrichment {
  return {
    id: row.id,
    inventoryUnitId: row.inventory_unit_id,
    vin: row.vin,
    decodedYear: row.decoded_year,
    decodedMake: row.decoded_make,
    decodedModel: row.decoded_model,
    decodedTrim: row.decoded_trim,
    bodyType: row.body_type,
    engineDescription: row.engine_description,
    estimatedMarketValue: row.estimated_market_value,
    priceAccuracyScore: row.price_accuracy_score,
    enrichmentSource: row.enrichment_source,
    enrichedAt: row.enriched_at,
    createdAt: row.created_at,
  }
}

/** Pull a named field from NHTSA Results array */
function nhtsaField(results: NHTSAResponse['Results'], variable: string): string | null {
  const item = results.find((r) => r.Variable.toLowerCase() === variable.toLowerCase())
  return item?.Value ?? null
}

// Depreciation model constants
const FIRST_YEAR_DEPRECIATION = 0.20
const ANNUAL_DEPRECIATION = 0.12
const MAX_DEPRECIATION = 0.85

/**
 * Simple depreciation-based market value estimate.
 * ~20% first year, ~12% per subsequent year.
 */
function estimateMarketValue(
  listPrice: number | undefined,
  year: number | undefined
): { value: number; accuracy: number } {
  if (!listPrice || listPrice <= 0) return { value: 0, accuracy: 0 }
  if (!year) return { value: listPrice * (1 - FIRST_YEAR_DEPRECIATION), accuracy: 0.5 }

  const currentYear = new Date().getFullYear()
  const age = Math.max(0, currentYear - year)

  let depreciation = 0
  if (age === 0) depreciation = 0
  else if (age === 1) depreciation = FIRST_YEAR_DEPRECIATION
  else depreciation = FIRST_YEAR_DEPRECIATION + (age - 1) * ANNUAL_DEPRECIATION

  const value = Math.max(listPrice * (1 - Math.min(depreciation, MAX_DEPRECIATION)), 0)
  // accuracy degrades with age (no real pricing API)
  const accuracy = Math.max(0.9 - age * 0.07, 0.3)

  return { value: Math.round(value), accuracy: Math.round(accuracy * 100) / 100 }
}

export async function enrichVin(
  inventoryUnitId: UUID,
  vin: string,
  fallback?: { year?: number; make?: string; model?: string; trim?: string; listPrice?: number }
): Promise<ServiceResult<VinEnrichment>> {
  try {
    const existing = await db.findOne<VinEnrichmentRow>(
      TABLE,
      (r) => r.inventory_unit_id === inventoryUnitId
    )

    let decoded: {
      year?: number
      make?: string
      model?: string
      trim?: string
      bodyType?: string
      engine?: string
    } = {}
    let source = 'fallback'

    // Attempt NHTSA decode
    try {
      const response = await fetch(`${NHTSA_BASE}/${encodeURIComponent(vin)}?format=json`)
      if (response.ok) {
        const data: NHTSAResponse = await response.json()
        if (data.Results && data.Results.length > 0) {
          const yearVal = nhtsaField(data.Results, 'Model Year')
          decoded = {
            year: yearVal ? parseInt(yearVal, 10) : fallback?.year,
            make: nhtsaField(data.Results, 'Make') ?? fallback?.make,
            model: nhtsaField(data.Results, 'Model') ?? fallback?.model,
            trim: nhtsaField(data.Results, 'Trim') ?? fallback?.trim,
            bodyType: nhtsaField(data.Results, 'Body Class') ?? undefined,
            engine:
              [
                nhtsaField(data.Results, 'Engine Number of Cylinders'),
                nhtsaField(data.Results, 'Displacement (L)'),
                nhtsaField(data.Results, 'Fuel Type - Primary'),
              ]
                .filter(Boolean)
                .join(' ') || undefined,
          }
          source = 'nhtsa'
        }
      }
    } catch {
      // Network unavailable — use fallback only
    }

    // If NHTSA failed or returned empty, use fallback
    if (source === 'fallback' && fallback) {
      decoded = {
        year: fallback.year,
        make: fallback.make,
        model: fallback.model,
        trim: fallback.trim,
      }
    }

    const { value: estimatedMarketValue, accuracy: priceAccuracyScore } = estimateMarketValue(
      fallback?.listPrice,
      decoded.year
    )

    const now = new Date().toISOString()
    const payload = {
      inventory_unit_id: inventoryUnitId,
      vin,
      decoded_year: decoded.year,
      decoded_make: decoded.make,
      decoded_model: decoded.model,
      decoded_trim: decoded.trim,
      body_type: decoded.bodyType,
      engine_description: decoded.engine,
      estimated_market_value: estimatedMarketValue > 0 ? estimatedMarketValue : undefined,
      price_accuracy_score: estimatedMarketValue > 0 ? priceAccuracyScore : undefined,
      enrichment_source: source,
      enriched_at: now,
    }

    let row: VinEnrichmentRow
    if (existing) {
      const updated = await db.update<VinEnrichmentRow>(TABLE, existing.id, payload)
      row = updated ?? existing
    } else {
      row = await db.insert<VinEnrichmentRow>(TABLE, payload)
    }

    return ok(rowToEnrichment(row))
  } catch (error) {
    return fail({
      code: 'VIN_ENRICHMENT_FAILED',
      message: 'Failed to enrich VIN',
      details: { error: String(error) },
    })
  }
}

export async function getVinEnrichment(
  inventoryUnitId: UUID
): Promise<ServiceResult<VinEnrichment | null>> {
  try {
    const row = await db.findOne<VinEnrichmentRow>(
      TABLE,
      (r) => r.inventory_unit_id === inventoryUnitId
    )
    return ok(row ? rowToEnrichment(row) : null)
  } catch (error) {
    return fail({
      code: 'GET_ENRICHMENT_FAILED',
      message: 'Failed to get VIN enrichment',
      details: { error: String(error) },
    })
  }
}

export async function listVinEnrichments(): Promise<ServiceResult<VinEnrichment[]>> {
  try {
    const rows = await db.findMany<VinEnrichmentRow>(TABLE)
    return ok(rows.map(rowToEnrichment))
  } catch (error) {
    return fail({
      code: 'LIST_ENRICHMENTS_FAILED',
      message: 'Failed to list VIN enrichments',
      details: { error: String(error) },
    })
  }
}

/**
 * VIN enrichment data is no longer seeded automatically with demo units.
 * Enrichment is triggered when real inventory is imported.
 */
export async function ensureVinEnrichmentSeeded(): Promise<void> {
  // No-op: demo seeding removed. VIN enrichment is triggered via real inventory import.
}
