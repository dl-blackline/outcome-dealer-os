import { UUID } from '@/types/common'
import { findById, findMany } from '@/lib/db/helpers'
import { HouseholdRow, CustomerRow, LeadRow, CommunicationEventRow, AppointmentRow } from '@/lib/db/supabase'
import { mapHouseholdRowToDomain } from './household.types'
import { mapCustomerRowToDomain } from '../customers/customer.types'
import { mapLeadRowToDomain } from '../leads/lead.types'
import { mapCommunicationEventRowToDomain } from '../communications/communication.types'
import { mapAppointmentRowToDomain } from '../appointments/appointment.types'

export interface HouseholdDetail {
  household: ReturnType<typeof mapHouseholdRowToDomain>
  members: ReturnType<typeof mapCustomerRowToDomain>[]
  leads: ReturnType<typeof mapLeadRowToDomain>[]
  communications: ReturnType<typeof mapCommunicationEventRowToDomain>[]
  appointments: ReturnType<typeof mapAppointmentRowToDomain>[]
}

export async function getHouseholdDetail(householdId: UUID): Promise<HouseholdDetail | null> {
  const householdRow = await findById<HouseholdRow>('households', householdId)
  if (!householdRow) return null

  const memberRows = await findMany<CustomerRow>('customers', (row) => row.household_id === householdId)
  const members = memberRows.map(mapCustomerRowToDomain)

  const leadRows = await findMany<LeadRow>('leads', (row) => row.household_id === householdId)
  const leads = leadRows.map(mapLeadRowToDomain)

  const customerIds = members.map((m) => m.id)
  const communicationRows = await findMany<CommunicationEventRow>('communication_events', (row) =>
    customerIds.includes(row.customer_id)
  )
  const communications = communicationRows.map(mapCommunicationEventRowToDomain)

  const appointmentRows = await findMany<AppointmentRow>('appointments', (row) =>
    customerIds.includes(row.customer_id)
  )
  const appointments = appointmentRows.map(mapAppointmentRowToDomain)

  return {
    household: mapHouseholdRowToDomain(householdRow),
    members,
    leads,
    communications,
    appointments,
  }
}
