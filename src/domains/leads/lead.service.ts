import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import { LeadRow } from '@/lib/db/supabase'
import {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  mapLeadRowToDomain,
} from './lead.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { hasPermission } from '@/domains/roles/policy'

export async function getLeadById(id: UUID, ctx: ServiceContext): Promise<ServiceResult<Lead>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_leads')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to view leads' })
      }
    }

    const row = await findById<LeadRow>('leads', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Lead not found' })
    }
    return ok(mapLeadRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_LEAD_FAILED',
      message: 'Failed to get lead',
      details: { error: String(error) },
    })
  }
}

export async function listLeads(
  filters?: {
    customerId?: UUID
    assignedToUserId?: UUID
    status?: string
    soldLostStatus?: string
  },
  ctx?: ServiceContext
): Promise<ServiceResult<Lead[]>> {
  try {
    if (ctx && ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_leads')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to view leads' })
      }
    }

    const rows = await findMany<LeadRow>('leads', (row) => {
      if (filters?.customerId && row.customer_id !== filters.customerId) {
        return false
      }
      if (filters?.assignedToUserId && row.assigned_to_user_id !== filters.assignedToUserId) {
        return false
      }
      if (filters?.status && row.status !== filters.status) {
        return false
      }
      if (filters?.soldLostStatus && row.sold_lost_status !== filters.soldLostStatus) {
        return false
      }
      return true
    })
    return ok(rows.map(mapLeadRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_LEADS_FAILED',
      message: 'Failed to list leads',
      details: { error: String(error) },
    })
  }
}

export async function createLead(
  input: CreateLeadInput,
  ctx: ServiceContext
): Promise<ServiceResult<Lead>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_leads')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to create leads' })
      }
    }

    if (!input.customerId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'customerId is required',
      })
    }

    const rowData: Omit<LeadRow, 'id' | 'created_at' | 'updated_at'> = {
      customer_id: input.customerId,
      household_id: input.householdId,
      lead_source: input.leadSource,
      source_campaign_id: input.sourceCampaignId,
      source_medium: input.sourceMedium,
      source_detail: input.sourceDetail,
      intent_type: input.intentType,
      assigned_to_user_id: input.assignedToUserId,
      assigned_team: input.assignedTeam,
      status: input.status || 'new',
      lead_score: input.leadScore || 0,
      appointment_status: 'none',
      showroom_status: 'none',
      sold_lost_status: 'open',
      lost_reason: undefined,
    }

    const row = await insert<LeadRow>('leads', rowData)
    const lead = mapLeadRowToDomain(row)

    await writeAuditLog(
      {
        action: 'lead.create',
        objectType: 'lead',
        objectId: lead.id,
        after: lead as unknown as Record<string, unknown>,
      },
      ctx
    )

    await publishEvent(
      {
        eventName: 'lead_created',
        objectType: 'lead',
        objectId: lead.id,
        payload: {
          leadId: lead.id,
          customerId: lead.customerId,
          status: lead.status,
          source: lead.leadSource,
        },
      },
      ctx
    )

    return ok(lead)
  } catch (error) {
    return fail({
      code: 'CREATE_LEAD_FAILED',
      message: 'Failed to create lead',
      details: { error: String(error) },
    })
  }
}

export async function updateLead(
  id: UUID,
  input: UpdateLeadInput,
  ctx: ServiceContext
): Promise<ServiceResult<Lead>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_leads')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to update leads' })
      }
      
      if (input.assignedToUserId !== undefined) {
        if (!hasPermission({ role: ctx.actorRole as any }, 'assign_leads')) {
          return fail({
            code: 'PERMISSION_DENIED',
            message: 'Insufficient permissions to assign leads',
          })
        }
      }
    }

    const existingRow = await findById<LeadRow>('leads', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Lead not found' })
    }

    const before = mapLeadRowToDomain(existingRow)

    const updates: Partial<Omit<LeadRow, 'id' | 'created_at'>> = {}
    if (input.leadSource !== undefined) updates.lead_source = input.leadSource
    if (input.sourceCampaignId !== undefined) updates.source_campaign_id = input.sourceCampaignId
    if (input.sourceMedium !== undefined) updates.source_medium = input.sourceMedium
    if (input.sourceDetail !== undefined) updates.source_detail = input.sourceDetail
    if (input.intentType !== undefined) updates.intent_type = input.intentType
    if (input.assignedToUserId !== undefined) updates.assigned_to_user_id = input.assignedToUserId
    if (input.assignedTeam !== undefined) updates.assigned_team = input.assignedTeam
    if (input.status !== undefined) updates.status = input.status
    if (input.leadScore !== undefined) updates.lead_score = input.leadScore
    if (input.appointmentStatus !== undefined) updates.appointment_status = input.appointmentStatus
    if (input.showroomStatus !== undefined) updates.showroom_status = input.showroomStatus
    if (input.soldLostStatus !== undefined) updates.sold_lost_status = input.soldLostStatus
    if (input.lostReason !== undefined) updates.lost_reason = input.lostReason

    const updatedRow = await update<LeadRow>('leads', id, updates)
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update lead' })
    }

    const after = mapLeadRowToDomain(updatedRow)

    await writeAuditLog(
      {
        action: 'lead.update',
        objectType: 'lead',
        objectId: id,
        before: before as unknown as Record<string, unknown>,
        after: after as unknown as Record<string, unknown>,
      },
      ctx
    )

    if (
      before.status !== after.status &&
      (after.status === 'contacted' || after.status === 'qualified')
    ) {
      await publishEvent(
        {
          eventName: 'lead_contacted',
          objectType: 'lead',
          objectId: id,
          payload: {
            leadId: id,
            previousStatus: before.status,
            newStatus: after.status,
          },
        },
        ctx
      )
    }

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_LEAD_FAILED',
      message: 'Failed to update lead',
      details: { error: String(error) },
    })
  }
}
