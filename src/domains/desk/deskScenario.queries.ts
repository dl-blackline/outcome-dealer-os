import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { findMany } from '@/lib/db/helpers'
import { DeskScenarioRow, DeskScenario, mapDeskScenarioRowToDomain } from './deskScenario.types'

export async function findDeskScenariosByLead(leadId: UUID): Promise<ServiceResult<DeskScenario[]>> {
  try {
    const rows = await findMany<DeskScenarioRow>('desk_scenarios', (row) => row.lead_id === leadId)
    return ok(rows.map(mapDeskScenarioRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_LEAD_FAILED',
      message: 'Failed to find desk scenarios by lead',
      details: { error: String(error) },
    })
  }
}

export async function findDeskScenariosByCustomer(customerId: UUID): Promise<ServiceResult<DeskScenario[]>> {
  try {
    const rows = await findMany<DeskScenarioRow>('desk_scenarios', (row) => row.customer_id === customerId)
    return ok(rows.map(mapDeskScenarioRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_CUSTOMER_FAILED',
      message: 'Failed to find desk scenarios by customer',
      details: { error: String(error) },
    })
  }
}

export async function findDeskScenariosByInventoryUnit(
  inventoryUnitId: UUID
): Promise<ServiceResult<DeskScenario[]>> {
  try {
    const rows = await findMany<DeskScenarioRow>(
      'desk_scenarios',
      (row) => row.inventory_unit_id === inventoryUnitId
    )
    return ok(rows.map(mapDeskScenarioRowToDomain))
  } catch (error) {
    return fail({
      code: 'FIND_BY_INVENTORY_UNIT_FAILED',
      message: 'Failed to find desk scenarios by inventory unit',
      details: { error: String(error) },
    })
  }
}
