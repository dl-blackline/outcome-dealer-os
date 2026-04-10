import { UUID } from '@/types/common'
import { findById, findMany } from '@/lib/db/helpers'
import { CustomerRow, HouseholdRow, LeadRow } from '@/lib/db/supabase'
import { mapCustomerRowToDomain } from './customer.types'
import { mapHouseholdRowToDomain } from '../households/household.types'
import { mapLeadRowToDomain } from '../leads/lead.types'

export interface CustomerDetail {
  customer: ReturnType<typeof mapCustomerRowToDomain>
  household: ReturnType<typeof mapHouseholdRowToDomain> | null
  leads: ReturnType<typeof mapLeadRowToDomain>[]
}

export async function getCustomerDetail(customerId: UUID): Promise<CustomerDetail | null> {
  const customerRow = await findById<CustomerRow>('customers', customerId)
  if (!customerRow) return null

  let household = null
  if (customerRow.household_id) {
    const householdRow = await findById<HouseholdRow>('households', customerRow.household_id)
    if (householdRow) {
      household = mapHouseholdRowToDomain(householdRow)
    }
  }

  const leadRows = await findMany<LeadRow>('leads', (row) => row.customer_id === customerId)
  const leads = leadRows.map(mapLeadRowToDomain)

  return {
    customer: mapCustomerRowToDomain(customerRow),
    household,
    leads,
  }
}
