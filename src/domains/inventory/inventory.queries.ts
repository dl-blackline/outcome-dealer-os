import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { findMany, findOne } from '@/lib/db/helpers'
import { InventoryUnitRow, InventoryUnit, mapInventoryUnitRowToDomain } from './inventory.types'

export async function findInventoryUnitByVIN(vin: string): Promise<ServiceResult<InventoryUnit | null>> {
  try {
    const row = await findOne<InventoryUnitRow>('inventory_units', (row) => row.vin === vin)
    return ok(row ? mapInventoryUnitRowToDomain(row) : null)
  } catch (error) {
    return fail({
      code: 'FIND_BY_VIN_FAILED',
      message: 'Failed to find inventory unit by VIN',
      details: { error: String(error) },
    })
  }
}

export async function findInventoryUnitByStockNumber(
  stockNumber: string
): Promise<ServiceResult<InventoryUnit | null>> {
  try {
    const row = await findOne<InventoryUnitRow>('inventory_units', (row) => row.stock_number === stockNumber)
    return ok(row ? mapInventoryUnitRowToDomain(row) : null)
  } catch (error) {
    return fail({
      code: 'FIND_BY_STOCK_NUMBER_FAILED',
      message: 'Failed to find inventory unit by stock number',
      details: { error: String(error) },
    })
  }
}

export async function findInventoryUnitsByStatus(status: string): Promise<ServiceResult<InventoryUnit[]>> {
  try {
    const rows = await findMany<InventoryUnitRow>('inventory_units', (row) => row.status === status)
    return ok(rows.map(mapInventoryUnitRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_STATUS_FAILED',
      message: 'Failed to find inventory units by status',
      details: { error: String(error) },
    })
  }
}

export async function findInventoryUnitsByReconStatus(reconStatus: string): Promise<ServiceResult<InventoryUnit[]>> {
  try {
    const rows = await findMany<InventoryUnitRow>('inventory_units', (row) => row.recon_status === reconStatus)
    return ok(rows.map(mapInventoryUnitRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_RECON_STATUS_FAILED',
      message: 'Failed to find inventory units by recon status',
      details: { error: String(error) },
    })
  }
}

export async function findAgingInventoryUnits(minAgingDays: number): Promise<ServiceResult<InventoryUnit[]>> {
  try {
    const rows = await findMany<InventoryUnitRow>(
      'inventory_units',
      (row) => row.aging_days >= minAgingDays
    )
    const sorted = rows.sort((a, b) => b.aging_days - a.aging_days)
    return ok(sorted.map(mapInventoryUnitRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_AGING_UNITS_FAILED',
      message: 'Failed to find aging inventory units',
      details: { error: String(error) },
    })
  }
}

export async function findWholesaleRecommendedUnits(): Promise<ServiceResult<InventoryUnit[]>> {
  try {
    const rows = await findMany<InventoryUnitRow>(
      'inventory_units',
      (row) => row.wholesale_recommended === true
    )
    return ok(rows.map(mapInventoryUnitRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_WHOLESALE_RECOMMENDED_FAILED',
      message: 'Failed to find wholesale recommended units',
      details: { error: String(error) },
    })
  }
}
