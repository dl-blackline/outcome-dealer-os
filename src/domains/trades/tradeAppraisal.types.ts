import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface TradeAppraisalRow extends DbRow {
  lead_id?: UUID
  customer_id: UUID
  inventory_unit_id?: UUID
  vin?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  condition_notes?: string
  appraisal_value?: number
  recon_estimate?: number
  market_exit_value?: number
  valuation_explanation?: string
  appraised_by_user_id?: UUID
  manager_approved: boolean
  manager_approved_by_user_id?: UUID
}

export interface TradeAppraisal {
  id: UUID
  leadId?: UUID
  customerId: UUID
  inventoryUnitId?: UUID
  vin?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  conditionNotes?: string
  appraisalValue?: number
  reconEstimate?: number
  marketExitValue?: number
  valuationExplanation?: string
  appraisedByUserId?: UUID
  managerApproved: boolean
  managerApprovedByUserId?: UUID
  createdAt: string
  updatedAt?: string
}

export interface CreateTradeAppraisalInput {
  leadId?: UUID
  customerId: UUID
  inventoryUnitId?: UUID
  vin?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  conditionNotes?: string
  appraisalValue?: number
  reconEstimate?: number
  marketExitValue?: number
  valuationExplanation?: string
  appraisedByUserId?: UUID
}

export interface UpdateTradeAppraisalInput {
  vin?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  conditionNotes?: string
  appraisalValue?: number
  reconEstimate?: number
  marketExitValue?: number
  valuationExplanation?: string
  managerApproved?: boolean
  managerApprovedByUserId?: UUID
}

export function mapTradeAppraisalRowToDomain(row: TradeAppraisalRow): TradeAppraisal {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    inventoryUnitId: row.inventory_unit_id,
    vin: row.vin,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    mileage: row.mileage,
    conditionNotes: row.condition_notes,
    appraisalValue: row.appraisal_value,
    reconEstimate: row.recon_estimate,
    marketExitValue: row.market_exit_value,
    valuationExplanation: row.valuation_explanation,
    appraisedByUserId: row.appraised_by_user_id,
    managerApproved: row.manager_approved,
    managerApprovedByUserId: row.manager_approved_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
