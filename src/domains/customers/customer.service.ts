import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import { CustomerRow } from '@/lib/db/supabase'
import {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  mapCustomerRowToDomain,
} from './customer.types'
import { writeAuditLog } from '@/domains/audit/audit.service'

function validateEmail(email?: string): boolean {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function getCustomerById(id: UUID): Promise<ServiceResult<Customer>> {
  try {
    const row = await findById<CustomerRow>('customers', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Customer not found' })
    }
    return ok(mapCustomerRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_CUSTOMER_FAILED',
      message: 'Failed to get customer',
      details: { error: String(error) },
    })
  }
}

export async function listCustomers(filters?: {
  householdId?: UUID
  lifecycleStage?: string
}): Promise<ServiceResult<Customer[]>> {
  try {
    const rows = await findMany<CustomerRow>('customers', (row) => {
      if (filters?.householdId && row.household_id !== filters.householdId) {
        return false
      }
      if (filters?.lifecycleStage && row.lifecycle_stage !== filters.lifecycleStage) {
        return false
      }
      return true
    })
    return ok(rows.map(mapCustomerRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_CUSTOMERS_FAILED',
      message: 'Failed to list customers',
      details: { error: String(error) },
    })
  }
}

export async function createCustomer(
  input: CreateCustomerInput,
  ctx: ServiceContext
): Promise<ServiceResult<Customer>> {
  try {
    if (input.email && !validateEmail(input.email)) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      })
    }

    if (!input.firstName && !input.lastName && !input.fullName) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'At least one of firstName, lastName, or fullName is required',
      })
    }

    const rowData: Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'> = {
      household_id: input.householdId,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      source: input.source,
      lifecycle_stage: input.lifecycleStage || 'lead',
      current_vehicle_summary: input.currentVehicleSummary,
      preferred_contact_method: input.preferredContactMethod,
      opt_in_sms: input.optInSms || false,
      opt_in_email: input.optInEmail || false,
    }

    const row = await insert<CustomerRow>('customers', rowData)
    const customer = mapCustomerRowToDomain(row)

    await writeAuditLog(
      {
        action: 'customer.create',
        objectType: 'customer',
        objectId: customer.id,
        after: customer as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(customer)
  } catch (error) {
    return fail({
      code: 'CREATE_CUSTOMER_FAILED',
      message: 'Failed to create customer',
      details: { error: String(error) },
    })
  }
}

export async function updateCustomer(
  id: UUID,
  input: UpdateCustomerInput,
  ctx: ServiceContext
): Promise<ServiceResult<Customer>> {
  try {
    if (input.email && !validateEmail(input.email)) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      })
    }

    const existingRow = await findById<CustomerRow>('customers', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Customer not found' })
    }

    const before = mapCustomerRowToDomain(existingRow)

    const updates: Partial<Omit<CustomerRow, 'id' | 'created_at'>> = {}
    if (input.householdId !== undefined) updates.household_id = input.householdId
    if (input.firstName !== undefined) updates.first_name = input.firstName
    if (input.lastName !== undefined) updates.last_name = input.lastName
    if (input.fullName !== undefined) updates.full_name = input.fullName
    if (input.email !== undefined) updates.email = input.email
    if (input.phone !== undefined) updates.phone = input.phone
    if (input.address !== undefined) updates.address = input.address
    if (input.city !== undefined) updates.city = input.city
    if (input.state !== undefined) updates.state = input.state
    if (input.zip !== undefined) updates.zip = input.zip
    if (input.source !== undefined) updates.source = input.source
    if (input.lifecycleStage !== undefined) updates.lifecycle_stage = input.lifecycleStage
    if (input.currentVehicleSummary !== undefined)
      updates.current_vehicle_summary = input.currentVehicleSummary
    if (input.preferredContactMethod !== undefined)
      updates.preferred_contact_method = input.preferredContactMethod
    if (input.optInSms !== undefined) updates.opt_in_sms = input.optInSms
    if (input.optInEmail !== undefined) updates.opt_in_email = input.optInEmail

    const updatedRow = await update<CustomerRow>('customers', id, updates)
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update customer' })
    }

    const after = mapCustomerRowToDomain(updatedRow)

    await writeAuditLog(
      {
        action: 'customer.update',
        objectType: 'customer',
        objectId: id,
        before: before as unknown as Record<string, unknown>,
        after: after as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_CUSTOMER_FAILED',
      message: 'Failed to update customer',
      details: { error: String(error) },
    })
  }
}
