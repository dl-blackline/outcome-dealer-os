import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface DeskScenarioRow extends DbRow {
  lead_id?: UUID
  customer_id: UUID
  inventory_unit_id: UUID
  trade_appraisal_id?: UUID
  scenario_type: string
  sale_price?: number
  down_payment?: number
  trade_value?: number
  payoff?: number
  taxes?: number
  fees?: number
  term_months?: number
  apr?: number
  monthly_payment?: number
  incentive_snapshot: Record<string, unknown>
  front_gross_estimate?: number
  payment_explanation?: string
  customer_summary?: string
  presented_by_user_id?: UUID
}

export interface DeskScenario {
  id: UUID
  leadId?: UUID
  customerId: UUID
  inventoryUnitId: UUID
  tradeAppraisalId?: UUID
  scenarioType: string
  salePrice?: number
  downPayment?: number
  tradeValue?: number
  payoff?: number
  taxes?: number
  fees?: number
  termMonths?: number
  apr?: number
  monthlyPayment?: number
  incentiveSnapshot: Record<string, unknown>
  frontGrossEstimate?: number
  paymentExplanation?: string
  customerSummary?: string
  presentedByUserId?: UUID
  createdAt: string
  updatedAt?: string
}

export interface CreateDeskScenarioInput {
  leadId?: UUID
  customerId: UUID
  inventoryUnitId: UUID
  tradeAppraisalId?: UUID
  scenarioType: string
  salePrice?: number
  downPayment?: number
  tradeValue?: number
  payoff?: number
  taxes?: number
  fees?: number
  termMonths?: number
  apr?: number
  monthlyPayment?: number
  incentiveSnapshot?: Record<string, unknown>
  frontGrossEstimate?: number
  paymentExplanation?: string
  customerSummary?: string
  presentedByUserId?: UUID
}

export interface UpdateDeskScenarioInput {
  salePrice?: number
  downPayment?: number
  tradeValue?: number
  payoff?: number
  taxes?: number
  fees?: number
  termMonths?: number
  apr?: number
  monthlyPayment?: number
  incentiveSnapshot?: Record<string, unknown>
  frontGrossEstimate?: number
  paymentExplanation?: string
  customerSummary?: string
}

export function mapDeskScenarioRowToDomain(row: DeskScenarioRow): DeskScenario {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    inventoryUnitId: row.inventory_unit_id,
    tradeAppraisalId: row.trade_appraisal_id,
    scenarioType: row.scenario_type,
    salePrice: row.sale_price,
    downPayment: row.down_payment,
    tradeValue: row.trade_value,
    payoff: row.payoff,
    taxes: row.taxes,
    fees: row.fees,
    termMonths: row.term_months,
    apr: row.apr,
    monthlyPayment: row.monthly_payment,
    incentiveSnapshot: row.incentive_snapshot || {},
    frontGrossEstimate: row.front_gross_estimate,
    paymentExplanation: row.payment_explanation,
    customerSummary: row.customer_summary,
    presentedByUserId: row.presented_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
