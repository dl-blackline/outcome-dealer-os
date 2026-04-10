import { UUID } from '@/types/common'

export interface FIMenuRow {
  id: UUID
  deal_id?: UUID
  lender_decision_id?: UUID
  reserve_amount?: number
  vsc_selected: boolean
  gap_selected: boolean
  ancillary_products_json: Record<string, unknown>[]
  menu_presented_at?: string
  accepted_products_json: Record<string, unknown>[]
  created_at: string
  updated_at?: string
}

export interface AncillaryProduct {
  productType: string
  productName: string
  cost: number
  price: number
  provider?: string
  term?: number
  selected?: boolean
  [key: string]: unknown
}

export interface FIMenu {
  id: UUID
  dealId?: UUID
  lenderDecisionId?: UUID
  reserveAmount?: number
  vscSelected: boolean
  gapSelected: boolean
  ancillaryProducts: AncillaryProduct[]
  menuPresentedAt?: string
  acceptedProducts: AncillaryProduct[]
  createdAt: string
  updatedAt?: string
}

export interface CreateFIMenuInput {
  dealId?: UUID
  lenderDecisionId?: UUID
  reserveAmount?: number
  vscSelected?: boolean
  gapSelected?: boolean
  ancillaryProducts?: AncillaryProduct[]
}

export interface UpdateFIMenuInput {
  dealId?: UUID
  lenderDecisionId?: UUID
  reserveAmount?: number
  vscSelected?: boolean
  gapSelected?: boolean
  ancillaryProducts?: AncillaryProduct[]
  menuPresentedAt?: string
  acceptedProducts?: AncillaryProduct[]
}

export function mapFIMenuRowToDomain(row: FIMenuRow): FIMenu {
  return {
    id: row.id,
    dealId: row.deal_id,
    lenderDecisionId: row.lender_decision_id,
    reserveAmount: row.reserve_amount,
    vscSelected: row.vsc_selected,
    gapSelected: row.gap_selected,
    ancillaryProducts: row.ancillary_products_json as AncillaryProduct[],
    menuPresentedAt: row.menu_presented_at,
    acceptedProducts: row.accepted_products_json as AncillaryProduct[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapFIMenuToRow(
  domain: Partial<FIMenu>
): Partial<Omit<FIMenuRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    deal_id: domain.dealId,
    lender_decision_id: domain.lenderDecisionId,
    reserve_amount: domain.reserveAmount,
    vsc_selected: domain.vscSelected,
    gap_selected: domain.gapSelected,
    ancillary_products_json: domain.ancillaryProducts || [],
    menu_presented_at: domain.menuPresentedAt,
    accepted_products_json: domain.acceptedProducts || [],
  }
}
