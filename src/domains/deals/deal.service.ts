/**
 * Deal domain KV-backed service.
 *
 * Stores MockDeal records in the KV store so that newly created deals
 * (e.g. converted from leads) survive a page reload. Seeds MOCK_DEALS
 * into KV on the first call if the table is empty.
 *
 * After every deal create/update the service fires the intelligence pipeline:
 *   1. CLV recalc for the customer
 *   2. Rep attribution (CLOSE by default for the assigned rep)
 *   3. Close probability scoring
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db, DbRow } from '@/lib/db/supabase'
import { MOCK_DEALS, type MockDeal } from '@/lib/mockData'
import { recalcCustomerCLV } from '@/domains/intelligence/clv.service'
import { addDealAttribution } from '@/domains/intelligence/rep-attribution.service'
import { scoreCloseProbability, sourceQualityScore } from '@/domains/intelligence/close-probability.service'

const TABLE = 'mock_deals'

interface MockDealRow extends DbRow {
  lead_id: UUID
  customer_name: string
  vehicle_description: string
  status: string
  amount: number
}

function rowToDeal(row: MockDealRow): MockDeal {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerName: row.customer_name,
    vehicleDescription: row.vehicle_description,
    status: row.status as MockDeal['status'],
    amount: row.amount,
    createdAt: row.created_at,
  }
}

let seeded = false

async function ensureSeeded(): Promise<void> {
  if (seeded) return
  seeded = true
  const existing = await db.findMany<MockDealRow>(TABLE)
  if (existing.length > 0) return
  for (const deal of MOCK_DEALS) {
    await db.insert<MockDealRow>(TABLE, {
      lead_id: deal.leadId,
      customer_name: deal.customerName,
      vehicle_description: deal.vehicleDescription,
      status: deal.status,
      amount: deal.amount,
    })
  }
}

export async function listDeals(): Promise<ServiceResult<MockDeal[]>> {
  try {
    await ensureSeeded()
    const rows = await db.findMany<MockDealRow>(TABLE)
    return ok(rows.map(rowToDeal))
  } catch (error) {
    return fail({ code: 'LIST_DEALS_FAILED', message: 'Failed to list deals', details: { error: String(error) } })
  }
}

export async function getDeal(id: UUID): Promise<ServiceResult<MockDeal | null>> {
  try {
    await ensureSeeded()
    const row = await db.findById<MockDealRow>(TABLE, id)
    return ok(row ? rowToDeal(row) : null)
  } catch (error) {
    return fail({ code: 'GET_DEAL_FAILED', message: 'Failed to get deal', details: { error: String(error) } })
  }
}

export async function createDeal(
  input: Omit<MockDeal, 'id' | 'createdAt'>
): Promise<ServiceResult<MockDeal>> {
  try {
    await ensureSeeded()
    const row = await db.insert<MockDealRow>(TABLE, {
      lead_id: input.leadId,
      customer_name: input.customerName,
      vehicle_description: input.vehicleDescription,
      status: input.status,
      amount: input.amount,
    })
    const deal = rowToDeal(row)
    // Fire intelligence pipeline asynchronously — never block the response
    void runIntelligencePipeline(deal)
    return ok(deal)
  } catch (error) {
    return fail({ code: 'CREATE_DEAL_FAILED', message: 'Failed to create deal', details: { error: String(error) } })
  }
}

export async function updateDealStatus(
  id: UUID,
  status: MockDeal['status']
): Promise<ServiceResult<MockDeal>> {
  try {
    const updated = await db.update<MockDealRow>(TABLE, id, { status })
    if (!updated) return fail({ code: 'DEAL_NOT_FOUND', message: 'Deal not found' })
    const deal = rowToDeal(updated)
    // Re-run pipeline on status change (e.g. funded updates CLV, rep gets CLOSE)
    void runIntelligencePipeline(deal)
    return ok(deal)
  } catch (error) {
    return fail({ code: 'UPDATE_DEAL_FAILED', message: 'Failed to update deal', details: { error: String(error) } })
  }
}

/**
 * Intelligence pipeline — runs asynchronously after every deal create/update.
 * Never throws; failures are swallowed so they cannot break the deal mutation.
 */
async function runIntelligencePipeline(deal: MockDeal): Promise<void> {
  try {
    // 1. CLV — collect all deals for this customer and recalc
    const allDeals = await db.findMany<MockDealRow>(
      TABLE,
      (r) => r.customer_name === deal.customerName
    )
    const profits = allDeals.map((d) => d.amount ?? 0)
    const latestDate = allDeals.length > 0
      ? allDeals.reduce((latest, d) => (d.created_at > latest ? d.created_at : latest), '')
      : undefined
    await recalcCustomerCLV(deal.leadId, profits, latestDate)
  } catch { /* ignore */ }

  try {
    // 2. Rep attribution — use CLOSE for funded deals, SOURCE otherwise
    const attributionType = deal.status === 'funded' ? 'CLOSE' : 'SOURCE'
    await addDealAttribution(deal.id, 'rep-system', attributionType, 'System Rep')
  } catch { /* ignore */ }

  try {
    // 3. Close probability scoring — fetch lead source for quality signal
    interface MockLeadRow extends DbRow {
      source?: string
    }
    const leadRow = await db.findById<MockLeadRow>('mock_leads', deal.leadId)
    await scoreCloseProbability(deal.id, {
      repPerformanceScore: 0.70,
      customerHistoryScore: 0.60,
      dealValueScore: Math.min((deal.amount ?? 0) / 80000, 1),
      engagementSpeedScore: 0.75,
      sourceQualityScore: sourceQualityScore(leadRow?.source),
    })
  } catch { /* ignore */ }
}
