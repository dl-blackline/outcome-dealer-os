import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  InventoryUnitRow,
  InventoryUnit,
  CreateInventoryUnitInput,
  UpdateInventoryUnitInput,
  mapInventoryUnitRowToDomain,
} from './inventory.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { hasPermission } from '@/domains/roles/policy'

export async function getInventoryUnitById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<InventoryUnit>> {
  try {
    const row = await findById<InventoryUnitRow>('inventory_units', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Inventory unit not found' })
    }
    return ok(mapInventoryUnitRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_INVENTORY_UNIT_FAILED',
      message: 'Failed to get inventory unit',
      details: { error: String(error) },
    })
  }
}

export async function listInventoryUnits(
  filters?: {
    status?: string
    reconStatus?: string
    wholesaleRecommended?: boolean
  },
  ctx?: ServiceContext
): Promise<ServiceResult<InventoryUnit[]>> {
  try {
    const rows = await findMany<InventoryUnitRow>('inventory_units', (row) => {
      if (filters?.status && row.status !== filters.status) {
        return false
      }
      if (filters?.reconStatus && row.recon_status !== filters.reconStatus) {
        return false
      }
      if (filters?.wholesaleRecommended !== undefined && row.wholesale_recommended !== filters.wholesaleRecommended) {
        return false
      }
      return true
    })
    return ok(rows.map(mapInventoryUnitRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_INVENTORY_UNITS_FAILED',
      message: 'Failed to list inventory units',
      details: { error: String(error) },
    })
  }
}

export async function createInventoryUnit(
  input: CreateInventoryUnitInput,
  ctx: ServiceContext
): Promise<ServiceResult<InventoryUnit>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_trades')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to create inventory units' })
      }
    }

    const rowData: Omit<InventoryUnitRow, 'id' | 'created_at' | 'updated_at'> = {
      vin: input.vin,
      stock_number: input.stockNumber,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim,
      mileage: input.mileage,
      vehicle_catalog_item_id: input.vehicleCatalogItemId,
      unit_type: input.unitType || 'retail_vehicle',
      acquisition_source: input.acquisitionSource,
      acquisition_cost: input.acquisitionCost,
      reconditioning_cost: input.reconditioningCost,
      total_cost_basis: input.totalCostBasis,
      list_price: input.listPrice,
      sale_price: input.salePrice,
      status: input.status || 'inventory',
      recon_status: input.reconStatus || 'not_started',
      aging_days: 0,
      wholesale_recommended: false,
    }

    const row = await insert<InventoryUnitRow>('inventory_units', rowData)
    const unit = mapInventoryUnitRowToDomain(row)

    await writeAuditLog(
      {
        action: 'inventory_unit.create',
        objectType: 'inventory_unit',
        objectId: row.id,
        after: {
          vin: input.vin,
          stockNumber: input.stockNumber,
          year: input.year,
          make: input.make,
          model: input.model,
        },
      },
      ctx
    )

    return ok(unit)
  } catch (error) {
    return fail({
      code: 'CREATE_INVENTORY_UNIT_FAILED',
      message: 'Failed to create inventory unit',
      details: { error: String(error) },
    })
  }
}

export async function updateInventoryUnit(
  id: UUID,
  input: UpdateInventoryUnitInput,
  ctx: ServiceContext
): Promise<ServiceResult<InventoryUnit>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_trades')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to update inventory units' })
      }
    }

    const existing = await findById<InventoryUnitRow>('inventory_units', id)
    if (!existing) {
      return fail({ code: 'NOT_FOUND', message: 'Inventory unit not found' })
    }

    const updates: Partial<InventoryUnitRow> = {}
    if (input.vin !== undefined) updates.vin = input.vin
    if (input.stockNumber !== undefined) updates.stock_number = input.stockNumber
    if (input.year !== undefined) updates.year = input.year
    if (input.make !== undefined) updates.make = input.make
    if (input.model !== undefined) updates.model = input.model
    if (input.trim !== undefined) updates.trim = input.trim
    if (input.mileage !== undefined) updates.mileage = input.mileage
    if (input.vehicleCatalogItemId !== undefined) updates.vehicle_catalog_item_id = input.vehicleCatalogItemId
    if (input.unitType !== undefined) updates.unit_type = input.unitType
    if (input.acquisitionSource !== undefined) updates.acquisition_source = input.acquisitionSource
    if (input.acquisitionCost !== undefined) updates.acquisition_cost = input.acquisitionCost
    if (input.reconditioningCost !== undefined) updates.reconditioning_cost = input.reconditioningCost
    if (input.totalCostBasis !== undefined) updates.total_cost_basis = input.totalCostBasis
    if (input.listPrice !== undefined) updates.list_price = input.listPrice
    if (input.salePrice !== undefined) updates.sale_price = input.salePrice
    if (input.status !== undefined) updates.status = input.status
    if (input.reconStatus !== undefined) updates.recon_status = input.reconStatus
    if (input.frontlineReadyAt !== undefined) updates.frontline_ready_at = input.frontlineReadyAt
    if (input.agingDays !== undefined) updates.aging_days = input.agingDays
    if (input.wholesaleRecommended !== undefined) updates.wholesale_recommended = input.wholesaleRecommended

    const row = await update<InventoryUnitRow>('inventory_units', id, updates)
    if (!row) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update inventory unit' })
    }

    const unit = mapInventoryUnitRowToDomain(row)

    await writeAuditLog(
      {
        action: 'inventory_unit.update',
        objectType: 'inventory_unit',
        objectId: id,
        before: {
          status: existing.status,
          reconStatus: existing.recon_status,
          listPrice: existing.list_price,
        },
        after: {
          status: row.status,
          reconStatus: row.recon_status,
          listPrice: row.list_price,
        },
      },
      ctx
    )

    return ok(unit)
  } catch (error) {
    return fail({
      code: 'UPDATE_INVENTORY_UNIT_FAILED',
      message: 'Failed to update inventory unit',
      details: { error: String(error) },
    })
  }
}
