import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import { HouseholdRow } from '@/lib/db/supabase'
import {
  Household,
  CreateHouseholdInput,
  UpdateHouseholdInput,
  mapHouseholdRowToDomain,
} from './household.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'

export async function getHouseholdById(id: UUID): Promise<ServiceResult<Household>> {
  try {
    const row = await findById<HouseholdRow>('households', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Household not found' })
    }
    return ok(mapHouseholdRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_HOUSEHOLD_FAILED',
      message: 'Failed to get household',
      details: { error: String(error) },
    })
  }
}

export async function listHouseholds(filters?: {
  householdType?: string
}): Promise<ServiceResult<Household[]>> {
  try {
    const rows = await findMany<HouseholdRow>('households', (row) => {
      if (filters?.householdType && row.household_type !== filters.householdType) {
        return false
      }
      return true
    })
    return ok(rows.map(mapHouseholdRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_HOUSEHOLDS_FAILED',
      message: 'Failed to list households',
      details: { error: String(error) },
    })
  }
}

export async function createHousehold(
  input: CreateHouseholdInput,
  ctx: ServiceContext
): Promise<ServiceResult<Household>> {
  try {
    if (!input.householdName && input.householdType === 'business') {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'Business households require a household name',
      })
    }

    const rowData: Omit<HouseholdRow, 'id' | 'created_at' | 'updated_at'> = {
      household_name: input.householdName,
      household_type: input.householdType || 'consumer',
      notes: input.notes,
      preferred_store_id: input.preferredStoreId,
      primary_customer_id: undefined,
    }

    const row = await insert<HouseholdRow>('households', rowData)
    const household = mapHouseholdRowToDomain(row)

    await writeAuditLog(
      {
        action: 'household.create',
        objectType: 'household',
        objectId: household.id,
        after: household as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(household)
  } catch (error) {
    return fail({
      code: 'CREATE_HOUSEHOLD_FAILED',
      message: 'Failed to create household',
      details: { error: String(error) },
    })
  }
}

export async function updateHousehold(
  id: UUID,
  input: UpdateHouseholdInput,
  ctx: ServiceContext
): Promise<ServiceResult<Household>> {
  try {
    const existingRow = await findById<HouseholdRow>('households', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Household not found' })
    }

    const before = mapHouseholdRowToDomain(existingRow)

    const updates: Partial<Omit<HouseholdRow, 'id' | 'created_at'>> = {}
    if (input.primaryCustomerId !== undefined)
      updates.primary_customer_id = input.primaryCustomerId
    if (input.householdName !== undefined) updates.household_name = input.householdName
    if (input.householdType !== undefined) updates.household_type = input.householdType
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.preferredStoreId !== undefined) updates.preferred_store_id = input.preferredStoreId

    const updatedRow = await update<HouseholdRow>('households', id, updates)
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update household' })
    }

    const after = mapHouseholdRowToDomain(updatedRow)

    await writeAuditLog(
      {
        action: 'household.update',
        objectType: 'household',
        objectId: id,
        before: before as unknown as Record<string, unknown>,
        after: after as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_HOUSEHOLD_FAILED',
      message: 'Failed to update household',
      details: { error: String(error) },
    })
  }
}
