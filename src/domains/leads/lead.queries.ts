import { UUID } from '@/types/common'
import { findById, findMany } from '@/lib/db/helpers'
import { LeadRow, CustomerRow, HouseholdRow, CommunicationEventRow, AppointmentRow } from '@/lib/db/supabase'
import { mapLeadRowToDomain } from './lead.types'
import { mapCustomerRowToDomain } from '../customers/customer.types'
import { mapHouseholdRowToDomain } from '../households/household.types'
import { mapCommunicationEventRowToDomain } from '../communications/communication.types'
import { mapAppointmentRowToDomain } from '../appointments/appointment.types'

export interface LeadDetail {
  lead: ReturnType<typeof mapLeadRowToDomain>
  customer: ReturnType<typeof mapCustomerRowToDomain> | null
  household: ReturnType<typeof mapHouseholdRowToDomain> | null
  communications: ReturnType<typeof mapCommunicationEventRowToDomain>[]
  appointments: ReturnType<typeof mapAppointmentRowToDomain>[]
}

export async function getLeadDetail(leadId: UUID): Promise<LeadDetail | null> {
  const leadRow = await findById<LeadRow>('leads', leadId)
  if (!leadRow) return null

  let customer = null
  const customerRow = await findById<CustomerRow>('customers', leadRow.customer_id)
  if (customerRow) {
    customer = mapCustomerRowToDomain(customerRow)
  }

  let household = null
  if (leadRow.household_id) {
    const householdRow = await findById<HouseholdRow>('households', leadRow.household_id)
    if (householdRow) {
      household = mapHouseholdRowToDomain(householdRow)
    }
  }

  const communicationRows = await findMany<CommunicationEventRow>(
    'communication_events',
    (row) => row.lead_id === leadId
  )
  const communications = communicationRows.map(mapCommunicationEventRowToDomain)

  const appointmentRows = await findMany<AppointmentRow>('appointments', (row) => row.lead_id === leadId)
  const appointments = appointmentRows.map(mapAppointmentRowToDomain)

  return {
    lead: mapLeadRowToDomain(leadRow),
    customer,
    household,
    communications,
    appointments,
  }
}
