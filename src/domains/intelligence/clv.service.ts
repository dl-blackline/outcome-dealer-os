/**
 * CLV Engine — Customer Lifetime Value service.
 *
 * Recalculates CLV for a customer whenever a deal is created or updated.
 * Stores aggregated stats in the `customer_intelligence` KV table.
 *
 * CLV = Σ(deal profit) across all deals for the customer.
 * Deal profit = frontGrossActual + backGrossActual (or amount for MockDeal).
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db } from '@/lib/db/supabase'
import {
  CustomerIntelligence,
  CustomerIntelligenceRow,
} from './intelligence.types'

const TABLE = 'customer_intelligence'

function rowToIntelligence(row: CustomerIntelligenceRow): CustomerIntelligence {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerLifetimeValue: row.customer_lifetime_value,
    totalDeals: row.total_deals,
    avgDealProfit: row.avg_deal_profit,
    lastDealDate: row.last_deal_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getCustomerIntelligence(
  customerId: UUID
): Promise<ServiceResult<CustomerIntelligence | null>> {
  try {
    const row = await db.findOne<CustomerIntelligenceRow>(
      TABLE,
      (r) => r.customer_id === customerId
    )
    return ok(row ? rowToIntelligence(row) : null)
  } catch (error) {
    return fail({
      code: 'GET_CLV_FAILED',
      message: 'Failed to get customer intelligence',
      details: { error: String(error) },
    })
  }
}

export async function listCustomerIntelligence(): Promise<
  ServiceResult<CustomerIntelligence[]>
> {
  try {
    const rows = await db.findMany<CustomerIntelligenceRow>(TABLE)
    return ok(rows.map(rowToIntelligence))
  } catch (error) {
    return fail({
      code: 'LIST_CLV_FAILED',
      message: 'Failed to list customer intelligence',
      details: { error: String(error) },
    })
  }
}

/**
 * Recalculate CLV for a customer given the full list of their deal profits.
 * Called after every deal insert/update.
 */
export async function recalcCustomerCLV(
  customerId: UUID,
  dealProfits: number[],
  lastDealDate?: string
): Promise<ServiceResult<CustomerIntelligence>> {
  try {
    const totalDeals = dealProfits.length
    const totalProfit = dealProfits.reduce((sum, p) => sum + p, 0)
    const avgDealProfit = totalDeals > 0 ? totalProfit / totalDeals : 0

    const existing = await db.findOne<CustomerIntelligenceRow>(
      TABLE,
      (r) => r.customer_id === customerId
    )

    if (existing) {
      const updated = await db.update<CustomerIntelligenceRow>(TABLE, existing.id, {
        customer_lifetime_value: totalProfit,
        total_deals: totalDeals,
        avg_deal_profit: avgDealProfit,
        last_deal_date: lastDealDate ?? existing.last_deal_date,
      })
      if (!updated) {
        return fail({ code: 'CLV_UPDATE_FAILED', message: 'Failed to update CLV record' })
      }
      return ok(rowToIntelligence(updated))
    }

    const row = await db.insert<CustomerIntelligenceRow>(TABLE, {
      customer_id: customerId,
      customer_lifetime_value: totalProfit,
      total_deals: totalDeals,
      avg_deal_profit: avgDealProfit,
      last_deal_date: lastDealDate,
    })
    return ok(rowToIntelligence(row))
  } catch (error) {
    return fail({
      code: 'RECALC_CLV_FAILED',
      message: 'Failed to recalculate CLV',
      details: { error: String(error) },
    })
  }
}
