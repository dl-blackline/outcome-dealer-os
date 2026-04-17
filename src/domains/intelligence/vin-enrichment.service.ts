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

/**
 * Simple depreciation-based market value estimate.
 * ~20% first year, ~15% per subsequent year.
 */
function estimateMarketValue(
  listPrice: number | undefined,
  year: number | undefined
): { value: number; accuracy: number } {
  if (!listPrice || listPrice <= 0) return { value: 0, accuracy: 0 }
  if (!year) return { value: listPrice * 0.85, accuracy: 0.5 }

  const currentYear = new Date().getFullYear()
  const age = Math.max(0, currentYear - year)

  let depreciation = 0
  if (age === 0) depreciation = 0
  else if (age === 1) depreciation = 0.2
  else depreciation = 0.2 + (age - 1) * 0.12

  const value = Math.max(listPrice * (1 - Math.min(depreciation, 0.85)), 0)
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
 * Seed VIN enrichment for demo inventory items.
 */
let seededVin = false

export async function ensureVinEnrichmentSeeded(): Promise<void> {
  if (seededVin) return
  seededVin = true

  const existing = await db.findMany<VinEnrichmentRow>(TABLE)
  if (existing.length > 0) return

  const demoUnits = [
    {
      id: 'inv-001',
      vin: '1HGCM82633A123456',
      year: 2023,
      make: 'Honda',
      model: 'Accord',
      trim: 'Sport',
      listPrice: 29995,
    },
    {
      id: 'inv-002',
      vin: '1FTFW1ET5EKD12345',
      year: 2024,
      make: 'Ford',
      model: 'F-150',
      trim: 'XLT',
      listPrice: 54990,
    },
    {
      id: 'inv-003',
      vin: '5YJSA1E26HF123456',
      year: 2020,
      make: 'Tesla',
      model: 'Model S',
      trim: 'Long Range',
      listPrice: 62500,
    },
  ]

  for (const unit of demoUnits) {
    await enrichVin(unit.id, unit.vin, {
      year: unit.year,
      make: unit.make,
      model: unit.model,
      trim: unit.trim,
      listPrice: unit.listPrice,
    })
  }
}
