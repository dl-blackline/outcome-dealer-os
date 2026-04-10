import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  VehicleCatalogItemRow,
  VehicleCatalogItem,
  CreateVehicleCatalogItemInput,
  UpdateVehicleCatalogItemInput,
  mapVehicleCatalogItemRowToDomain,
} from './vehicleCatalog.types'
import { writeAuditLog } from '@/domains/audit/audit.service'

export async function getVehicleCatalogItemById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<VehicleCatalogItem>> {
  try {
    const row = await findById<VehicleCatalogItemRow>('vehicle_catalog_items', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Vehicle catalog item not found' })
    }
    return ok(mapVehicleCatalogItemRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_VEHICLE_CATALOG_ITEM_FAILED',
      message: 'Failed to get vehicle catalog item',
      details: { error: String(error) },
    })
  }
}

export async function listVehicleCatalogItems(
  filters?: {
    year?: number
    make?: string
    model?: string
    segment?: string
  },
  ctx?: ServiceContext
): Promise<ServiceResult<VehicleCatalogItem[]>> {
  try {
    const rows = await findMany<VehicleCatalogItemRow>('vehicle_catalog_items', (row) => {
      if (filters?.year && row.year !== filters.year) {
        return false
      }
      if (filters?.make && row.make !== filters.make) {
        return false
      }
      if (filters?.model && row.model !== filters.model) {
        return false
      }
      if (filters?.segment && row.segment !== filters.segment) {
        return false
      }
      return true
    })
    return ok(rows.map(mapVehicleCatalogItemRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_VEHICLE_CATALOG_ITEMS_FAILED',
      message: 'Failed to list vehicle catalog items',
      details: { error: String(error) },
    })
  }
}

export async function createVehicleCatalogItem(
  input: CreateVehicleCatalogItemInput,
  ctx: ServiceContext
): Promise<ServiceResult<VehicleCatalogItem>> {
  try {
    const rowData: Omit<VehicleCatalogItemRow, 'id' | 'created_at' | 'updated_at'> = {
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim,
      package_data: input.packageData || {},
      powertrain: input.powertrain,
      body_style: input.bodyStyle,
      segment: input.segment,
      competitive_set: input.competitiveSet || [],
      ownership_notes: input.ownershipNotes,
    }

    const row = await insert<VehicleCatalogItemRow>('vehicle_catalog_items', rowData)
    const item = mapVehicleCatalogItemRowToDomain(row)

    await writeAuditLog(
      {
        action: 'vehicle_catalog_item.create',
        objectType: 'vehicle_catalog_item',
        objectId: row.id,
        after: {
          year: input.year,
          make: input.make,
          model: input.model,
        },
      },
      ctx
    )

    return ok(item)
  } catch (error) {
    return fail({
      code: 'CREATE_VEHICLE_CATALOG_ITEM_FAILED',
      message: 'Failed to create vehicle catalog item',
      details: { error: String(error) },
    })
  }
}

export async function updateVehicleCatalogItem(
  id: UUID,
  input: UpdateVehicleCatalogItemInput,
  ctx: ServiceContext
): Promise<ServiceResult<VehicleCatalogItem>> {
  try {
    const existing = await findById<VehicleCatalogItemRow>('vehicle_catalog_items', id)
    if (!existing) {
      return fail({ code: 'NOT_FOUND', message: 'Vehicle catalog item not found' })
    }

    const updates: Partial<VehicleCatalogItemRow> = {}
    if (input.year !== undefined) updates.year = input.year
    if (input.make !== undefined) updates.make = input.make
    if (input.model !== undefined) updates.model = input.model
    if (input.trim !== undefined) updates.trim = input.trim
    if (input.packageData !== undefined) updates.package_data = input.packageData
    if (input.powertrain !== undefined) updates.powertrain = input.powertrain
    if (input.bodyStyle !== undefined) updates.body_style = input.bodyStyle
    if (input.segment !== undefined) updates.segment = input.segment
    if (input.competitiveSet !== undefined) updates.competitive_set = input.competitiveSet
    if (input.ownershipNotes !== undefined) updates.ownership_notes = input.ownershipNotes

    const row = await update<VehicleCatalogItemRow>('vehicle_catalog_items', id, updates)
    if (!row) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update vehicle catalog item' })
    }

    const item = mapVehicleCatalogItemRowToDomain(row)

    await writeAuditLog(
      {
        action: 'vehicle_catalog_item.update',
        objectType: 'vehicle_catalog_item',
        objectId: id,
        before: {
          year: existing.year,
          make: existing.make,
          model: existing.model,
        },
        after: {
          year: row.year,
          make: row.make,
          model: row.model,
        },
      },
      ctx
    )

    return ok(item)
  } catch (error) {
    return fail({
      code: 'UPDATE_VEHICLE_CATALOG_ITEM_FAILED',
      message: 'Failed to update vehicle catalog item',
      details: { error: String(error) },
    })
  }
}
