import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface CustomerRow extends DbRow {
  household_id?: UUID
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source?: string
  lifecycle_stage: string
  current_vehicle_summary?: string
  preferred_contact_method?: string
  opt_in_sms: boolean
  opt_in_email: boolean
}

export interface Customer {
  id: UUID
  householdId?: UUID
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source?: string
  lifecycleStage: string
  currentVehicleSummary?: string
  preferredContactMethod?: string
  optInSms: boolean
  optInEmail: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerInput {
  householdId?: UUID
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source?: string
  lifecycleStage?: 'lead' | 'prospect' | 'customer' | 'inactive'
  currentVehicleSummary?: string
  preferredContactMethod?: 'phone' | 'email' | 'sms'
  optInSms?: boolean
  optInEmail?: boolean
}

export interface UpdateCustomerInput {
  householdId?: UUID
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source?: string
  lifecycleStage?: 'lead' | 'prospect' | 'customer' | 'inactive'
  currentVehicleSummary?: string
  preferredContactMethod?: 'phone' | 'email' | 'sms'
  optInSms?: boolean
  optInEmail?: boolean
}

export function mapCustomerRowToDomain(row: CustomerRow): Customer {
  return {
    id: row.id,
    householdId: row.household_id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    source: row.source,
    lifecycleStage: row.lifecycle_stage,
    currentVehicleSummary: row.current_vehicle_summary,
    preferredContactMethod: row.preferred_contact_method,
    optInSms: row.opt_in_sms,
    optInEmail: row.opt_in_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}
