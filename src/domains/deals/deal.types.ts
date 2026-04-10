import { UUID } from '@/types/common'

export interface DealRow {
  id: UUID
  lead_id: UUID
  customer_id: UUID
  inventory_unit_id: UUID
  trade_appraisal_id?: UUID
  desk_scenario_id?: UUID
  credit_app_id?: UUID
  lender_decision_id?: UUID
  fi_menu_id?: UUID
  status: string
  funded_status: string
  funding_exception_count: number
  front_gross_actual?: number
  back_gross_actual?: number
  sold_at?: string
  delivered_at?: string
  created_at: string
  updated_at?: string
}

export interface Deal {
  id: UUID
  leadId: UUID
  customerId: UUID
  inventoryUnitId: UUID
  tradeAppraisalId?: UUID
  deskScenarioId?: UUID
  creditAppId?: UUID
  lenderDecisionId?: UUID
  fiMenuId?: UUID
  status: 'open' | 'quoted' | 'signed' | 'funded' | 'delivered' | 'cancelled'
  fundedStatus: 'not_funded' | 'pending' | 'funded' | 'rejected'
  fundingExceptionCount: number
  frontGrossActual?: number
  backGrossActual?: number
  soldAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateDealInput {
  leadId: UUID
  customerId: UUID
  inventoryUnitId: UUID
  tradeAppraisalId?: UUID
  deskScenarioId?: UUID
  creditAppId?: UUID
  lenderDecisionId?: UUID
  fiMenuId?: UUID
  frontGrossActual?: number
  backGrossActual?: number
}

export interface UpdateDealInput {
  tradeAppraisalId?: UUID
  deskScenarioId?: UUID
  creditAppId?: UUID
  lenderDecisionId?: UUID
  fiMenuId?: UUID
  status?: 'open' | 'quoted' | 'signed' | 'funded' | 'delivered' | 'cancelled'
  fundedStatus?: 'not_funded' | 'pending' | 'funded' | 'rejected'
  fundingExceptionCount?: number
  frontGrossActual?: number
  backGrossActual?: number
  soldAt?: string
  deliveredAt?: string
}

export function mapDealRowToDomain(row: DealRow): Deal {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    inventoryUnitId: row.inventory_unit_id,
    tradeAppraisalId: row.trade_appraisal_id,
    deskScenarioId: row.desk_scenario_id,
    creditAppId: row.credit_app_id,
    lenderDecisionId: row.lender_decision_id,
    fiMenuId: row.fi_menu_id,
    status: row.status as Deal['status'],
    fundedStatus: row.funded_status as Deal['fundedStatus'],
    fundingExceptionCount: row.funding_exception_count,
    frontGrossActual: row.front_gross_actual,
    backGrossActual: row.back_gross_actual,
    soldAt: row.sold_at,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapDealToRow(
  domain: Partial<Deal>
): Partial<Omit<DealRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    lead_id: domain.leadId,
    customer_id: domain.customerId,
    inventory_unit_id: domain.inventoryUnitId,
    trade_appraisal_id: domain.tradeAppraisalId,
    desk_scenario_id: domain.deskScenarioId,
    credit_app_id: domain.creditAppId,
    lender_decision_id: domain.lenderDecisionId,
    fi_menu_id: domain.fiMenuId,
    status: domain.status,
    funded_status: domain.fundedStatus,
    funding_exception_count: domain.fundingExceptionCount,
    front_gross_actual: domain.frontGrossActual,
    back_gross_actual: domain.backGrossActual,
    sold_at: domain.soldAt,
    delivered_at: domain.deliveredAt,
  }
}
