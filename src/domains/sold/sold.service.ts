/**
 * Sold Records service
 *
 * markDealSold performs the full sold transition:
 *   1. Validate the deal has a linked inventory unit (or accept manual/legacy)
 *   2. Fetch a live inventory snapshot
 *   3. Insert a sold_records row
 *   4. Transition the inventory unit status → "sold"
 *   5. Update the deal status → sold_pending_delivery / delivered
 *
 * The three mutations happen in sequence.  They are not wrapped in a DB
 * transaction here (KV-backed layer doesn't support them) but each step is
 * idempotent-safe — a retry will not create duplicate sold records because the
 * upsert check on deal_id is enforced at the caller level.
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db } from '@/lib/db/supabase'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import { type MockDeal } from '@/lib/mockData'
import { type InventoryUnitRow } from '@/domains/inventory/inventory.types'
import {
  SoldRecord,
  SoldRecordRow,
  MarkDealSoldInput,
  SoldStatus,
  mapSoldRecordRowToDomain,
} from './sold.types'

const TABLE = 'sold_records'
const DEALS_TABLE = 'deals'
const INVENTORY_TABLE = 'inventory_units'

// ── Row shape for deal.service (KV-backed "deals" table) ─────────────────────

interface MockDealRow {
  id: UUID
  customer_name: string
  vehicle_description: string
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
  created_at: string
  updated_at?: string
  [key: string]: unknown
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSoldRecordByDealId(dealId: UUID): Promise<ServiceResult<SoldRecord | null>> {
  try {
    const rows = await findMany<SoldRecordRow>(TABLE, (r) => r.deal_id === dealId)
    return ok(rows.length > 0 ? mapSoldRecordRowToDomain(rows[0]) : null)
  } catch (error) {
    return fail({ code: 'GET_SOLD_RECORD_FAILED', message: 'Failed to get sold record', details: { error: String(error) } })
  }
}

export async function getSoldRecord(id: UUID): Promise<ServiceResult<SoldRecord | null>> {
  try {
    const row = await findById<SoldRecordRow>(TABLE, id)
    return ok(row ? mapSoldRecordRowToDomain(row) : null)
  } catch (error) {
    return fail({ code: 'GET_SOLD_RECORD_FAILED', message: 'Failed to get sold record', details: { error: String(error) } })
  }
}

export async function listSoldRecords(): Promise<ServiceResult<SoldRecord[]>> {
  try {
    const rows = await findMany<SoldRecordRow>(TABLE)
    return ok(rows.map(mapSoldRecordRowToDomain))
  } catch (error) {
    return fail({ code: 'LIST_SOLD_RECORDS_FAILED', message: 'Failed to list sold records', details: { error: String(error) } })
  }
}

export async function listSoldRecordsByCustomer(customerId: UUID): Promise<ServiceResult<SoldRecord[]>> {
  try {
    const rows = await findMany<SoldRecordRow>(TABLE, (r) => r.customer_id === customerId)
    return ok(rows.map(mapSoldRecordRowToDomain))
  } catch (error) {
    return fail({ code: 'LIST_SOLD_RECORDS_FAILED', message: 'Failed to list sold records', details: { error: String(error) } })
  }
}

export interface MarkDealSoldResult {
  soldRecord: SoldRecord
  deal: MockDeal
}

/**
 * Core sold-transition function.
 *
 * Accepts a deal id and optional override fields.  Reads the deal from the KV
 * store, optionally reads the inventory unit for a live snapshot, then:
 *   1. Creates the sold_record row
 *   2. Updates inventory_units.status → "sold"
 *   3. Updates deals.status → soldStatus param (defaults to sold_pending_delivery)
 */
export async function markDealSold(
  input: MarkDealSoldInput
): Promise<ServiceResult<MarkDealSoldResult>> {
  try {
    // 1 ── Load the deal ────────────────────────────────────────────────────
    const dealRow = await db.findById<MockDealRow>(DEALS_TABLE, input.dealId)
    if (!dealRow) {
      return fail({ code: 'DEAL_NOT_FOUND', message: 'Deal not found' })
    }

    // Guard: prevent double-sold
    if (dealRow.status === 'sold_pending_delivery' || dealRow.status === 'delivered') {
      return fail({ code: 'DEAL_ALREADY_SOLD', message: 'This deal has already been marked sold' })
    }

    // 2 ── Resolve inventory unit ──────────────────────────────────────────
    const inventoryUnitId = input.inventoryUnitId ?? dealRow.inventory_unit_id as UUID | undefined
    const isInventoryLinked = Boolean(inventoryUnitId)

    let inventoryRow: InventoryUnitRow | null = null
    let previousInventoryStatus: string | undefined
    if (inventoryUnitId) {
      inventoryRow = await findById<InventoryUnitRow>(INVENTORY_TABLE, inventoryUnitId)
      previousInventoryStatus = inventoryRow?.status
    }

    // 3 ── Build snapshot from live inventory (fallback to deal snapshot) ──
    let existingSnapshot: Record<string, unknown> = {}
    if (dealRow.inventory_snapshot) {
      try { existingSnapshot = JSON.parse(dealRow.inventory_snapshot as string) } catch { /* ignore */ }
    }

    const snapshotYear = inventoryRow?.year ?? (existingSnapshot.year as number | undefined)
    const snapshotMake = inventoryRow?.make ?? (existingSnapshot.make as string | undefined)
    const snapshotModel = inventoryRow?.model ?? (existingSnapshot.model as string | undefined)
    const snapshotTrim = inventoryRow?.trim ?? (existingSnapshot.trim as string | undefined)
    const snapshotVin = inventoryRow?.vin ?? (existingSnapshot.vin as string | undefined)
    const snapshotVinLast6 = snapshotVin ? snapshotVin.slice(-6) : (existingSnapshot.vinLast6 as string | undefined)
    const snapshotStockNumber = inventoryRow?.stock_number ?? (existingSnapshot.stockNumber as string | undefined)
    const snapshotMileage = inventoryRow?.mileage ?? (existingSnapshot.mileage as number | undefined)
    const snapshotAskingPrice = inventoryRow?.list_price ?? inventoryRow?.sale_price ?? (existingSnapshot.askingPrice as number | undefined)
    const snapshotAcquisitionCost = inventoryRow?.acquisition_cost

    // 4 ── Insert sold_records row ─────────────────────────────────────────
    const soldStatus: SoldStatus = input.soldStatus ?? 'sold_pending_delivery'

    const rowData: Omit<SoldRecordRow, 'id' | 'created_at' | 'updated_at'> = {
      deal_id: input.dealId,
      customer_id: input.customerId,
      co_buyer_id: input.coBuyerId,
      inventory_unit_id: inventoryUnitId,

      sold_status: soldStatus,
      sold_date: input.soldDate ?? new Date().toISOString(),
      delivery_date: input.deliveryDate,
      agreed_sale_price: input.agreedSalePrice ?? (dealRow.amount as number | undefined),
      front_gross: input.frontGross,
      back_gross: input.backGross,

      salesperson: input.salesperson ?? (dealRow.salesperson as string | undefined),
      fi_manager: input.fiManager ?? (dealRow.fi_manager as string | undefined),

      lender: input.lender ?? (dealRow.lender as string | undefined),
      amount_financed: input.amountFinanced ?? (dealRow.amount_financed as number | undefined),
      down_payment: input.downPayment ?? (dealRow.down_payment as number | undefined),
      trade_amount: input.tradeAmount ?? (dealRow.trade_amount as number | undefined),
      payoff: input.payoff ?? (dealRow.payoff as number | undefined),

      snapshot_year: snapshotYear,
      snapshot_make: snapshotMake,
      snapshot_model: snapshotModel,
      snapshot_trim: snapshotTrim,
      snapshot_stock_number: snapshotStockNumber,
      snapshot_vin: snapshotVin,
      snapshot_vin_last6: snapshotVinLast6,
      snapshot_mileage: snapshotMileage,
      snapshot_asking_price: snapshotAskingPrice,
      snapshot_acquisition_cost: snapshotAcquisitionCost,
      snapshot_inventory_status_at_sale: previousInventoryStatus,

      marked_sold_by: input.markedSoldBy ?? 'system',
      previous_inventory_status: previousInventoryStatus,
      is_inventory_linked: isInventoryLinked,
      notes: input.notes,
    }

    const soldRow = await insert<SoldRecordRow>(TABLE, rowData)

    // 5 ── Transition inventory unit status ────────────────────────────────
    if (inventoryUnitId) {
      await update<InventoryUnitRow>(INVENTORY_TABLE, inventoryUnitId, { status: 'sold' })
    }

    // 6 ── Update deal status ──────────────────────────────────────────────
    const updatedDealRow = await db.update<MockDealRow>(DEALS_TABLE, input.dealId, {
      status: soldStatus,
      sale_date: soldRow.sold_date,
    })

    const soldRecord = mapSoldRecordRowToDomain(soldRow)

    // Build a minimal MockDeal-compatible object from the raw row
    const deal: MockDeal = rowToDeal(updatedDealRow ?? dealRow)

    return ok({ soldRecord, deal })
  } catch (error) {
    return fail({
      code: 'MARK_DEAL_SOLD_FAILED',
      message: 'Failed to mark deal as sold',
      details: { error: String(error) },
    })
  }
}

export async function finalizeDealDelivery(
  dealId: UUID,
  deliveryDate?: string
): Promise<ServiceResult<SoldRecord>> {
  try {
    const rows = await findMany<SoldRecordRow>(TABLE, (r) => r.deal_id === dealId)
    if (rows.length === 0) {
      return fail({ code: 'SOLD_RECORD_NOT_FOUND', message: 'No sold record found for this deal' })
    }
    const existingRow = rows[0]

    const updatedRow = await update<SoldRecordRow>(TABLE, existingRow.id, {
      sold_status: 'delivered',
      delivery_date: deliveryDate ?? new Date().toISOString(),
    })
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update sold record' })
    }

    // Also update the deal status
    await db.update<MockDealRow>(DEALS_TABLE, dealId, { status: 'delivered' })

    // Transition inventory to delivered status
    if (existingRow.inventory_unit_id) {
      await update<InventoryUnitRow>(INVENTORY_TABLE, existingRow.inventory_unit_id, { status: 'delivered' })
    }

    return ok(mapSoldRecordRowToDomain(updatedRow))
  } catch (error) {
    return fail({
      code: 'FINALIZE_DELIVERY_FAILED',
      message: 'Failed to finalize delivery',
      details: { error: String(error) },
    })
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function rowToDeal(row: MockDealRow): MockDeal {
  return {
    id: row.id,
    leadId: row.lead_id as UUID | undefined,
    customerName: row.customer_name,
    vehicleDescription: row.vehicle_description,
    inventoryUnitId: row.inventory_unit_id as string | undefined,
    inventorySnapshot: row.inventory_snapshot ? (() => { try { return JSON.parse(row.inventory_snapshot as string) } catch { return undefined } })() : undefined,
    status: row.status as MockDeal['status'],
    amount: row.amount,
    saleDate: row.sale_date as string | undefined,
    salesperson: row.salesperson as string | undefined,
    fiManager: row.fi_manager as string | undefined,
    downPayment: row.down_payment as number | undefined,
    tradeAmount: row.trade_amount as number | undefined,
    payoff: row.payoff as number | undefined,
    lender: row.lender as string | undefined,
    amountFinanced: row.amount_financed as number | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
