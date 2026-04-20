/**
 * Rep Attribution System.
 *
 * Tracks which salesperson influenced or closed each deal.
 * Maintains a RepPerformance ledger that is updated whenever attribution changes.
 *
 * Attribution rules:
 *   SOURCE   — rep created/sourced the lead
 *   CLOSE    — rep closed the deal (marked funded/signed)
 *   ASSIST   — rep had any other interaction
 *   FOLLOW_UP — rep performed a follow-up touch
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db, DbRow } from '@/lib/db/supabase'
import {
  DealAttribution,
  DealAttributionRow,
  RepPerformance,
  RepPerformanceRow,
  AttributionType,
} from './intelligence.types'

interface MockDealRow extends DbRow {
  lead_id: UUID
  customer_name: string
  vehicle_description: string
  status: string
  amount: number
}

const ATTRIBUTION_TABLE = 'deal_attributions'
const PERFORMANCE_TABLE = 'rep_performance'

// ─── Mappers ─────────────────────────────────────────────────────────────────

function rowToAttribution(row: DealAttributionRow): DealAttribution {
  return {
    id: row.id,
    dealId: row.deal_id,
    salesRepId: row.sales_rep_id,
    salesRepName: row.sales_rep_name,
    attributionType: row.attribution_type,
    createdAt: row.created_at,
  }
}

function rowToPerformance(row: RepPerformanceRow): RepPerformance {
  return {
    id: row.id,
    repId: row.rep_id,
    repName: row.rep_name,
    totalDeals: row.total_deals,
    totalProfit: row.total_profit,
    avgProfitPerDeal: row.avg_profit_per_deal,
    conversionRate: row.conversion_rate,
    weightedAttributionScore: row.weighted_attribution_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ─── Attribution weights for scoring ─────────────────────────────────────────

const ATTRIBUTION_WEIGHT: Record<AttributionType, number> = {
  CLOSE: 1.0,
  SOURCE: 0.5,
  ASSIST: 0.25,
  FOLLOW_UP: 0.15,
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function addDealAttribution(
  dealId: UUID,
  salesRepId: string,
  attributionType: AttributionType,
  salesRepName?: string
): Promise<ServiceResult<DealAttribution>> {
  try {
    const existing = await db.findOne<DealAttributionRow>(
      ATTRIBUTION_TABLE,
      (r) => r.deal_id === dealId && r.sales_rep_id === salesRepId
    )

    let row: DealAttributionRow
    if (existing) {
      const updated = await db.update<DealAttributionRow>(
        ATTRIBUTION_TABLE,
        existing.id,
        { attribution_type: attributionType, sales_rep_name: salesRepName ?? existing.sales_rep_name }
      )
      row = updated ?? existing
    } else {
      row = await db.insert<DealAttributionRow>(ATTRIBUTION_TABLE, {
        deal_id: dealId,
        sales_rep_id: salesRepId,
        sales_rep_name: salesRepName,
        attribution_type: attributionType,
      })
    }

    // Rebuild rep performance after every attribution change
    await rebuildRepPerformance(salesRepId, salesRepName)

    return ok(rowToAttribution(row))
  } catch (error) {
    return fail({
      code: 'ADD_ATTRIBUTION_FAILED',
      message: 'Failed to add deal attribution',
      details: { error: String(error) },
    })
  }
}

export async function getAttributionsForDeal(
  dealId: UUID
): Promise<ServiceResult<DealAttribution[]>> {
  try {
    const rows = await db.findMany<DealAttributionRow>(
      ATTRIBUTION_TABLE,
      (r) => r.deal_id === dealId
    )
    return ok(rows.map(rowToAttribution))
  } catch (error) {
    return fail({
      code: 'GET_ATTRIBUTIONS_FAILED',
      message: 'Failed to get attributions',
      details: { error: String(error) },
    })
  }
}

export async function listRepPerformances(): Promise<ServiceResult<RepPerformance[]>> {
  try {
    const rows = await db.findMany<RepPerformanceRow>(PERFORMANCE_TABLE)
    return ok(rows.map(rowToPerformance))
  } catch (error) {
    return fail({
      code: 'LIST_PERFORMANCE_FAILED',
      message: 'Failed to list rep performances',
      details: { error: String(error) },
    })
  }
}

export async function getRepPerformance(
  repId: string
): Promise<ServiceResult<RepPerformance | null>> {
  try {
    const row = await db.findOne<RepPerformanceRow>(
      PERFORMANCE_TABLE,
      (r) => r.rep_id === repId
    )
    return ok(row ? rowToPerformance(row) : null)
  } catch (error) {
    return fail({
      code: 'GET_PERFORMANCE_FAILED',
      message: 'Failed to get rep performance',
      details: { error: String(error) },
    })
  }
}

/**
 * Rebuild a rep's performance ledger based on all their attributions.
 * Called after every attribution upsert.
 */
async function rebuildRepPerformance(repId: string, repName?: string): Promise<void> {
  const attributions = await db.findMany<DealAttributionRow>(
    ATTRIBUTION_TABLE,
    (r) => r.sales_rep_id === repId
  )

  const totalDeals = attributions.filter((a) => a.attribution_type === 'CLOSE').length
  // Use a Set for O(n+m) lookup instead of O(n*m) with Array.some
  const closedDealIds = new Set(
    attributions
      .filter((a) => a.attribution_type === 'CLOSE')
      .map((a) => a.deal_id)
  )
  const allDeals = await db.findMany<MockDealRow>(
    'mock_deals',
    (d) => closedDealIds.has(d.id)
  )

  const totalProfit = allDeals.reduce((sum, d) => sum + (d.amount ?? 0), 0)
  const avgProfitPerDeal = totalDeals > 0 ? totalProfit / totalDeals : 0

  // conversionRate: closed deals / all touched deals
  const touchedDeals = new Set(attributions.map((a) => a.deal_id)).size
  const conversionRate = touchedDeals > 0 ? totalDeals / touchedDeals : 0

  // weightedAttributionScore: sum of weights across all attributions
  const weightedScore = attributions.reduce(
    (sum, a) => sum + (ATTRIBUTION_WEIGHT[a.attribution_type] ?? 0),
    0
  )

  const existing = await db.findOne<RepPerformanceRow>(
    PERFORMANCE_TABLE,
    (r) => r.rep_id === repId
  )

  const perfData = {
    rep_id: repId,
    rep_name: repName,
    total_deals: totalDeals,
    total_profit: totalProfit,
    avg_profit_per_deal: avgProfitPerDeal,
    conversion_rate: conversionRate,
    weighted_attribution_score: weightedScore,
  }

  if (existing) {
    await db.update<RepPerformanceRow>(PERFORMANCE_TABLE, existing.id, {
      rep_name: repName ?? existing.rep_name,
      total_deals: perfData.total_deals,
      total_profit: perfData.total_profit,
      avg_profit_per_deal: perfData.avg_profit_per_deal,
      conversion_rate: perfData.conversion_rate,
      weighted_attribution_score: perfData.weighted_attribution_score,
    })
  } else {
    await db.insert<RepPerformanceRow>(PERFORMANCE_TABLE, perfData)
  }
}

/**
 * Seed attribution data is no longer seeded automatically.
 * Attribution records are created as real deals are processed.
 */
export async function ensureRepAttributionSeeded(): Promise<void> {
  // No-op: demo seeding removed. Attribution is created via real deal processing.
}
