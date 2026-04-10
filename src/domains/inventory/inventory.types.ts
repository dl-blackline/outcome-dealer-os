import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface InventoryUnitRow extends DbRow {
  vin?: string
  stock_number?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  vehicle_catalog_item_id?: UUID
  unit_type: string
  acquisition_source?: string
  acquisition_cost?: number
  reconditioning_cost?: number
  total_cost_basis?: number
  list_price?: number
  sale_price?: number
  status: string
  recon_status: string
  frontline_ready_at?: string
  aging_days: number
  wholesale_recommended: boolean
}

export interface InventoryUnit {
  id: UUID
  vin?: string
  stockNumber?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  vehicleCatalogItemId?: UUID
  unitType: string
  acquisitionSource?: string
  acquisitionCost?: number
  reconditioningCost?: number
  totalCostBasis?: number
  listPrice?: number
  salePrice?: number
  status: string
  reconStatus: string
  frontlineReadyAt?: string
  agingDays: number
  wholesaleRecommended: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateInventoryUnitInput {
  vin?: string
  stockNumber?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  vehicleCatalogItemId?: UUID
  unitType?: string
  acquisitionSource?: string
  acquisitionCost?: number
  reconditioningCost?: number
  totalCostBasis?: number
  listPrice?: number
  salePrice?: number
  status?: string
  reconStatus?: string
}

export interface UpdateInventoryUnitInput {
  vin?: string
  stockNumber?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  vehicleCatalogItemId?: UUID
  unitType?: string
  acquisitionSource?: string
  acquisitionCost?: number
  reconditioningCost?: number
  totalCostBasis?: number
  listPrice?: number
  salePrice?: number
  status?: string
  reconStatus?: string
  frontlineReadyAt?: string
  agingDays?: number
  wholesaleRecommended?: boolean
}

export function mapInventoryUnitRowToDomain(row: InventoryUnitRow): InventoryUnit {
  return {
    id: row.id,
    vin: row.vin,
    stockNumber: row.stock_number,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    mileage: row.mileage,
    vehicleCatalogItemId: row.vehicle_catalog_item_id,
    unitType: row.unit_type,
    acquisitionSource: row.acquisition_source,
    acquisitionCost: row.acquisition_cost,
    reconditioningCost: row.reconditioning_cost,
    totalCostBasis: row.total_cost_basis,
    listPrice: row.list_price,
    salePrice: row.sale_price,
    status: row.status,
    reconStatus: row.recon_status,
    frontlineReadyAt: row.frontline_ready_at,
    agingDays: row.aging_days,
    wholesaleRecommended: row.wholesale_recommended,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
