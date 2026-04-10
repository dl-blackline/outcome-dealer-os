import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface HouseholdRow extends DbRow {
  primary_customer_id?: UUID
  household_name?: string
  household_type: string
  notes?: string
  preferred_store_id?: UUID
}

export interface Household {
  id: UUID
  primaryCustomerId?: UUID
  householdName?: string
  householdType: string
  notes?: string
  preferredStoreId?: UUID
  createdAt: string
  updatedAt: string
}

export interface CreateHouseholdInput {
  householdName?: string
  householdType?: 'consumer' | 'business' | 'fleet'
  notes?: string
  preferredStoreId?: UUID
}

export interface UpdateHouseholdInput {
  primaryCustomerId?: UUID
  householdName?: string
  householdType?: 'consumer' | 'business' | 'fleet'
  notes?: string
  preferredStoreId?: UUID
}

export function mapHouseholdRowToDomain(row: HouseholdRow): Household {
  return {
    id: row.id,
    primaryCustomerId: row.primary_customer_id,
    householdName: row.household_name,
    householdType: row.household_type,
    notes: row.notes,
    preferredStoreId: row.preferred_store_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}
