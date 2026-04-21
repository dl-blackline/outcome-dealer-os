/**
 * Deal domain KV-backed service.
 *
 * Stores MockDeal records in the KV store so that newly created deals
 * (e.g. converted from leads) survive a page reload.
 *
 * After every deal create/update the service fires the intelligence pipeline:
 *   1. CLV recalc for the customer
 *   2. Rep attribution (CLOSE by default for the assigned rep)
 *   3. Close probability scoring
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db, DbRow } from '@/lib/db/supabase'
import { type MockDeal } from '@/lib/mockData'
import { recalcCustomerCLV } from '@/domains/intelligence/clv.service'
import { addDealAttribution } from '@/domains/intelligence/rep-attribution.service'
import { scoreCloseProbability, sourceQualityScore } from '@/domains/intelligence/close-probability.service'

const TABLE = 'deals'

interface MockDealRow extends DbRow {
  lead_id: UUID
  customer_name: string
  co_buyer?: string
  vehicle_description: string
  stock_number?: string
  vin?: string
  inventory_unit_id?: string
  inventory_snapshot?: string
  status: string
  amount: number
  sale_date?: string
  salesperson?: string
  fi_manager?: string
  down_payment?: number
  trade_amount?: number
  payoff?: number
  lender?: string
  amount_financed?: number
  notes?: string
}

function rowToDeal(row: MockDealRow): MockDeal {
  return {
    id: row.id,
    leadId: row.lead_id || undefined,
    customerName: row.customer_name,
    coBuyer: row.co_buyer,
    vehicleDescription: row.vehicle_description,
    stockNumber: row.stock_number,
    vin: row.vin,
    inventoryUnitId: row.inventory_unit_id,
    inventorySnapshot: row.inventory_snapshot ? JSON.parse(row.inventory_snapshot) : undefined,
    status: row.status as MockDeal['status'],
    amount: row.amount,
    saleDate: row.sale_date,
    salesperson: row.salesperson,
    fiManager: row.fi_manager,
    downPayment: row.down_payment,
    tradeAmount: row.trade_amount,
    payoff: row.payoff,
    lender: row.lender,
    amountFinanced: row.amount_financed,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listDeals(): Promise<ServiceResult<MockDeal[]>> {
  try {
    const rows = await db.findMany<MockDealRow>(TABLE)
    return ok(rows.map(rowToDeal))
  } catch (error) {
    return fail({ code: 'LIST_DEALS_FAILED', message: 'Failed to list deals', details: { error: String(error) } })
  }
}

export async function getDeal(id: UUID): Promise<ServiceResult<MockDeal | null>> {
  try {
    const row = await db.findById<MockDealRow>(TABLE, id)
    return ok(row ? rowToDeal(row) : null)
  } catch (error) {
    return fail({ code: 'GET_DEAL_FAILED', message: 'Failed to get deal', details: { error: String(error) } })
  }
}

export async function createDeal(
  input: Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceResult<MockDeal>> {
  try {
    const row = await db.insert<MockDealRow>(TABLE, {
      lead_id: input.leadId || '',
      customer_name: input.customerName,
      co_buyer: input.coBuyer,
      vehicle_description: input.vehicleDescription,
      stock_number: input.stockNumber,
      vin: input.vin,
      inventory_unit_id: input.inventoryUnitId,
      inventory_snapshot: input.inventorySnapshot ? JSON.stringify(input.inventorySnapshot) : undefined,
      status: input.status,
      amount: input.amount,
      sale_date: input.saleDate,
      salesperson: input.salesperson,
      fi_manager: input.fiManager,
      down_payment: input.downPayment,
      trade_amount: input.tradeAmount,
      payoff: input.payoff,
      lender: input.lender,
      amount_financed: input.amountFinanced,
      notes: input.notes,
    })
    const deal = rowToDeal(row)
    // Fire intelligence pipeline asynchronously — never block the response
    void runIntelligencePipeline(deal)
    return ok(deal)
  } catch (error) {
    return fail({ code: 'CREATE_DEAL_FAILED', message: 'Failed to create deal', details: { error: String(error) } })
  }
}

export async function updateDeal(
  id: UUID,
  input: Partial<Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ServiceResult<MockDeal>> {
  try {
    const updates: Partial<Omit<MockDealRow, 'id' | 'created_at'>> = {}
    if (input.leadId !== undefined) updates.lead_id = input.leadId
    if (input.customerName !== undefined) updates.customer_name = input.customerName
    if (input.coBuyer !== undefined) updates.co_buyer = input.coBuyer
    if (input.vehicleDescription !== undefined) updates.vehicle_description = input.vehicleDescription
    if (input.stockNumber !== undefined) updates.stock_number = input.stockNumber
    if (input.vin !== undefined) updates.vin = input.vin
    if (input.inventoryUnitId !== undefined) updates.inventory_unit_id = input.inventoryUnitId
    if (input.inventorySnapshot !== undefined) updates.inventory_snapshot = input.inventorySnapshot ? JSON.stringify(input.inventorySnapshot) : undefined
    if (input.status !== undefined) updates.status = input.status
    if (input.amount !== undefined) updates.amount = input.amount
    if (input.saleDate !== undefined) updates.sale_date = input.saleDate
    if (input.salesperson !== undefined) updates.salesperson = input.salesperson
    if (input.fiManager !== undefined) updates.fi_manager = input.fiManager
    if (input.downPayment !== undefined) updates.down_payment = input.downPayment
    if (input.tradeAmount !== undefined) updates.trade_amount = input.tradeAmount
    if (input.payoff !== undefined) updates.payoff = input.payoff
    if (input.lender !== undefined) updates.lender = input.lender
    if (input.amountFinanced !== undefined) updates.amount_financed = input.amountFinanced
    if (input.notes !== undefined) updates.notes = input.notes

    const updated = await db.update<MockDealRow>(TABLE, id, updates)
    if (!updated) return fail({ code: 'DEAL_NOT_FOUND', message: 'Deal not found' })
    const deal = rowToDeal(updated)
    void runIntelligencePipeline(deal)
    return ok(deal)
  } catch (error) {
    return fail({ code: 'UPDATE_DEAL_FAILED', message: 'Failed to update deal', details: { error: String(error) } })
  }
}

export async function deleteDeal(id: UUID): Promise<ServiceResult<boolean>> {
  try {
    const deleted = await db.deleteById(TABLE, id)
    if (!deleted) return fail({ code: 'DEAL_NOT_FOUND', message: 'Deal not found' })
    return ok(true)
  } catch (error) {
    return fail({ code: 'DELETE_DEAL_FAILED', message: 'Failed to delete deal', details: { error: String(error) } })
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
    const leadRow = await db.findById<MockLeadRow>('leads', deal.leadId)
    await scoreCloseProbability(deal.id, {
      repPerformanceScore: 0.70,
      customerHistoryScore: 0.60,
      dealValueScore: Math.min((deal.amount ?? 0) / 80000, 1),
      engagementSpeedScore: 0.75,
      sourceQualityScore: sourceQualityScore(leadRow?.source),
    })
  } catch { /* ignore */ }
}
