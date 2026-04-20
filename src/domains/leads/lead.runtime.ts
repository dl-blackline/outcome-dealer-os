/**
 * Lead domain KV-backed runtime service.
 *
 * Uses table 'leads_rt' (separate from the formal 'leads' table used by lead.service.ts)
 * so that the runtime mock schema does not conflict with the typed DB schema.
 *
 * All mutations fire the intelligence pipeline asynchronously to keep the
 * response fast.
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db, DbRow } from '@/lib/db/supabase'
import { type MockLead } from '@/lib/mockData'

const TABLE = 'leads_rt'

interface MockLeadRow extends DbRow {
  customer_name: string
  first_name?: string
  last_name?: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source: string
  score: number
  status: string
  household_id?: string
  assigned_to?: string
  notes?: string
  interested_vehicle?: string
}

function rowToLead(row: MockLeadRow): MockLead {
  return {
    id: row.id,
    householdId: row.household_id || undefined,
    customerName: row.customer_name,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    source: row.source,
    score: row.score,
    status: row.status as MockLead['status'],
    assignedTo: row.assigned_to,
    notes: row.notes,
    interestedVehicle: row.interested_vehicle,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface CreateLeadInput {
  firstName?: string
  lastName?: string
  customerName?: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source?: string
  status?: MockLead['status']
  score?: number
  assignedTo?: string
  notes?: string
  interestedVehicle?: string
}

export type UpdateLeadInput = Partial<CreateLeadInput>

export async function listLeads(): Promise<ServiceResult<MockLead[]>> {
  try {
    const rows = await db.findMany<MockLeadRow>(TABLE)
    const sorted = rows.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return ok(sorted.map(rowToLead))
  } catch (error) {
    return fail({ code: 'LIST_LEADS_FAILED', message: 'Failed to list leads', details: { error: String(error) } })
  }
}

export async function getLead(id: UUID): Promise<ServiceResult<MockLead | null>> {
  try {
    const row = await db.findById<MockLeadRow>(TABLE, id)
    return ok(row ? rowToLead(row) : null)
  } catch (error) {
    return fail({ code: 'GET_LEAD_FAILED', message: 'Failed to get lead', details: { error: String(error) } })
  }
}

export async function createLead(input: CreateLeadInput): Promise<ServiceResult<MockLead>> {
  try {
    const firstName = input.firstName?.trim() || ''
    const lastName = input.lastName?.trim() || ''
    const customerName = input.customerName?.trim() ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      input.email.trim()

    if (!input.email.trim()) {
      return fail({ code: 'VALIDATION_ERROR', message: 'Email is required' })
    }

    const row = await db.insert<MockLeadRow>(TABLE, {
      customer_name: customerName,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || '',
      address: input.address?.trim() || undefined,
      city: input.city?.trim() || undefined,
      state: input.state?.trim() || undefined,
      zip: input.zip?.trim() || undefined,
      source: input.source?.trim() || 'manual',
      score: input.score ?? 50,
      status: input.status || 'new',
      household_id: undefined,
      assigned_to: input.assignedTo?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      interested_vehicle: input.interestedVehicle?.trim() || undefined,
    })

    return ok(rowToLead(row))
  } catch (error) {
    return fail({ code: 'CREATE_LEAD_FAILED', message: 'Failed to create lead', details: { error: String(error) } })
  }
}

export async function updateLead(id: UUID, input: UpdateLeadInput): Promise<ServiceResult<MockLead>> {
  try {
    const existing = await db.findById<MockLeadRow>(TABLE, id)
    if (!existing) return fail({ code: 'NOT_FOUND', message: 'Lead not found' })

    const updates: Partial<Omit<MockLeadRow, 'id' | 'created_at'>> = {}

    if (input.firstName !== undefined) updates.first_name = input.firstName.trim() || undefined
    if (input.lastName !== undefined) updates.last_name = input.lastName.trim() || undefined
    if (input.email !== undefined) updates.email = input.email.trim().toLowerCase()
    if (input.phone !== undefined) updates.phone = input.phone.trim()
    if (input.address !== undefined) updates.address = input.address.trim() || undefined
    if (input.city !== undefined) updates.city = input.city.trim() || undefined
    if (input.state !== undefined) updates.state = input.state.trim() || undefined
    if (input.zip !== undefined) updates.zip = input.zip.trim() || undefined
    if (input.source !== undefined) updates.source = input.source.trim()
    if (input.score !== undefined) updates.score = input.score
    if (input.status !== undefined) updates.status = input.status
    if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo.trim() || undefined
    if (input.notes !== undefined) updates.notes = input.notes.trim() || undefined
    if (input.interestedVehicle !== undefined) updates.interested_vehicle = input.interestedVehicle.trim() || undefined

    // Recompute customer_name when first/last name changes
    const newFirst = input.firstName !== undefined ? input.firstName.trim() : (existing.first_name || '')
    const newLast = input.lastName !== undefined ? input.lastName.trim() : (existing.last_name || '')
    if (input.firstName !== undefined || input.lastName !== undefined) {
      updates.customer_name = [newFirst, newLast].filter(Boolean).join(' ') || existing.customer_name
    }
    if (input.customerName !== undefined) {
      updates.customer_name = input.customerName.trim() || existing.customer_name
    }

    const updated = await db.update<MockLeadRow>(TABLE, id, updates)
    if (!updated) return fail({ code: 'UPDATE_FAILED', message: 'Failed to update lead' })

    return ok(rowToLead(updated))
  } catch (error) {
    return fail({ code: 'UPDATE_LEAD_FAILED', message: 'Failed to update lead', details: { error: String(error) } })
  }
}

export async function deleteLead(id: UUID): Promise<ServiceResult<boolean>> {
  try {
    const deleted = await db.deleteById(TABLE, id)
    if (!deleted) return fail({ code: 'NOT_FOUND', message: 'Lead not found' })
    return ok(true)
  } catch (error) {
    return fail({ code: 'DELETE_LEAD_FAILED', message: 'Failed to delete lead', details: { error: String(error) } })
  }
}
