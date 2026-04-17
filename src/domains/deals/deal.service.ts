/**
 * Deal domain KV-backed service.
 *
 * Stores MockDeal records in the KV store so that newly created deals
 * (e.g. converted from leads) survive a page reload. Seeds MOCK_DEALS
 * into KV on the first call if the table is empty.
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db, DbRow } from '@/lib/db/supabase'
import { MOCK_DEALS, type MockDeal } from '@/lib/mockData'

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
    return ok(rowToDeal(row))
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
    return ok(rowToDeal(updated))
  } catch (error) {
    return fail({ code: 'UPDATE_DEAL_FAILED', message: 'Failed to update deal', details: { error: String(error) } })
  }
}
