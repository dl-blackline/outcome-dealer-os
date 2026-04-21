import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

// ── Sold status pipeline ──────────────────────────────────────────────────────

export type SoldStatus = 'sold_pending_delivery' | 'delivered'

export const SOLD_STATUS_LABELS: Record<SoldStatus, string> = {
  sold_pending_delivery: 'Sold – Pending Delivery',
  delivered: 'Delivered',
}

// ── DB row ────────────────────────────────────────────────────────────────────

export interface SoldRecordRow extends DbRow {
  deal_id?: UUID
  customer_id?: UUID
  co_buyer_id?: UUID
  inventory_unit_id?: UUID

  sold_status: string
  sold_date: string
  delivery_date?: string
  agreed_sale_price?: number
  front_gross?: number
  back_gross?: number

  salesperson?: string
  fi_manager?: string

  lender?: string
  amount_financed?: number
  down_payment?: number
  trade_amount?: number
  payoff?: number

  snapshot_year?: number
  snapshot_make?: string
  snapshot_model?: string
  snapshot_trim?: string
  snapshot_body_style?: string
  snapshot_stock_number?: string
  snapshot_vin?: string
  snapshot_vin_last6?: string
  snapshot_mileage?: number
  snapshot_exterior_color?: string
  snapshot_interior_color?: string
  snapshot_primary_image_url?: string
  snapshot_asking_price?: number
  snapshot_acquisition_cost?: number
  snapshot_inventory_status_at_sale?: string

  marked_sold_by?: string
  previous_inventory_status?: string
  is_inventory_linked: boolean
  notes?: string
}

// ── Domain model ──────────────────────────────────────────────────────────────

export interface SoldRecord {
  id: UUID
  dealId?: UUID
  customerId?: UUID
  coBuyerId?: UUID
  inventoryUnitId?: UUID

  soldStatus: SoldStatus
  soldDate: string
  deliveryDate?: string
  agreedSalePrice?: number
  frontGross?: number
  backGross?: number

  salesperson?: string
  fiManager?: string

  lender?: string
  amountFinanced?: number
  downPayment?: number
  tradeAmount?: number
  payoff?: number

  snapshotYear?: number
  snapshotMake?: string
  snapshotModel?: string
  snapshotTrim?: string
  snapshotBodyStyle?: string
  snapshotStockNumber?: string
  snapshotVin?: string
  snapshotVinLast6?: string
  snapshotMileage?: number
  snapshotExteriorColor?: string
  snapshotInteriorColor?: string
  snapshotPrimaryImageUrl?: string
  snapshotAskingPrice?: number
  snapshotAcquisitionCost?: number
  snapshotInventoryStatusAtSale?: string

  markedSoldBy?: string
  previousInventoryStatus?: string
  isInventoryLinked: boolean
  notes?: string

  createdAt: string
  updatedAt?: string
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface MarkDealSoldInput {
  dealId: UUID
  customerId?: UUID
  coBuyerId?: UUID
  inventoryUnitId?: UUID
  soldStatus?: SoldStatus
  soldDate?: string
  deliveryDate?: string
  agreedSalePrice?: number
  frontGross?: number
  backGross?: number
  salesperson?: string
  fiManager?: string
  lender?: string
  amountFinanced?: number
  downPayment?: number
  tradeAmount?: number
  payoff?: number
  markedSoldBy?: string
  notes?: string
}

// ── Mappers ───────────────────────────────────────────────────────────────────

export function mapSoldRecordRowToDomain(row: SoldRecordRow): SoldRecord {
  return {
    id: row.id,
    dealId: row.deal_id,
    customerId: row.customer_id,
    coBuyerId: row.co_buyer_id,
    inventoryUnitId: row.inventory_unit_id,

    soldStatus: row.sold_status as SoldStatus,
    soldDate: row.sold_date,
    deliveryDate: row.delivery_date,
    agreedSalePrice: row.agreed_sale_price,
    frontGross: row.front_gross,
    backGross: row.back_gross,

    salesperson: row.salesperson,
    fiManager: row.fi_manager,

    lender: row.lender,
    amountFinanced: row.amount_financed,
    downPayment: row.down_payment,
    tradeAmount: row.trade_amount,
    payoff: row.payoff,

    snapshotYear: row.snapshot_year,
    snapshotMake: row.snapshot_make,
    snapshotModel: row.snapshot_model,
    snapshotTrim: row.snapshot_trim,
    snapshotBodyStyle: row.snapshot_body_style,
    snapshotStockNumber: row.snapshot_stock_number,
    snapshotVin: row.snapshot_vin,
    snapshotVinLast6: row.snapshot_vin_last6,
    snapshotMileage: row.snapshot_mileage,
    snapshotExteriorColor: row.snapshot_exterior_color,
    snapshotInteriorColor: row.snapshot_interior_color,
    snapshotPrimaryImageUrl: row.snapshot_primary_image_url,
    snapshotAskingPrice: row.snapshot_asking_price,
    snapshotAcquisitionCost: row.snapshot_acquisition_cost,
    snapshotInventoryStatusAtSale: row.snapshot_inventory_status_at_sale,

    markedSoldBy: row.marked_sold_by,
    previousInventoryStatus: row.previous_inventory_status,
    isInventoryLinked: row.is_inventory_linked,
    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
