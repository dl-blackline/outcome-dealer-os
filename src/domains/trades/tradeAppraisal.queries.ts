import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { findMany } from '@/lib/db/helpers'
import { TradeAppraisalRow, TradeAppraisal, mapTradeAppraisalRowToDomain } from './tradeAppraisal.types'

export async function findTradeAppraisalsByLead(leadId: UUID): Promise<ServiceResult<TradeAppraisal[]>> {
  try {
    const rows = await findMany<TradeAppraisalRow>('trade_appraisals', (row) => row.lead_id === leadId)
    return ok(rows.map(mapTradeAppraisalRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_LEAD_FAILED',
      message: 'Failed to find trade appraisals by lead',
      details: { error: String(error) },
    })
  }
}

export async function findTradeAppraisalsByCustomer(customerId: UUID): Promise<ServiceResult<TradeAppraisal[]>> {
  try {
    const rows = await findMany<TradeAppraisalRow>('trade_appraisals', (row) => row.customer_id === customerId)
    return ok(rows.map(mapTradeAppraisalRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_CUSTOMER_FAILED',
      message: 'Failed to find trade appraisals by customer',
      details: { error: String(error) },
    })
  }
}

export async function findTradeAppraisalsByInventoryUnit(
  inventoryUnitId: UUID
): Promise<ServiceResult<TradeAppraisal[]>> {
  try {
    const rows = await findMany<TradeAppraisalRow>(
      'trade_appraisals',
      (row) => row.inventory_unit_id === inventoryUnitId
    )
    return ok(rows.map(mapTradeAppraisalRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_INVENTORY_UNIT_FAILED',
      message: 'Failed to find trade appraisals by inventory unit',
      details: { error: String(error) },
    })
  }
}

export async function findPendingManagerApprovals(): Promise<ServiceResult<TradeAppraisal[]>> {
  try {
    const rows = await findMany<TradeAppraisalRow>(
      'trade_appraisals',
      (row) => row.manager_approved === false && row.appraisal_value !== undefined
    )
    return ok(rows.map(mapTradeAppraisalRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_PENDING_APPROVALS_FAILED',
      message: 'Failed to find pending manager approvals',
      details: { error: String(error) },
    })
  }
}
