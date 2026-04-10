import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert } from '@/lib/db/helpers'
import { CommunicationEventRow } from '@/lib/db/supabase'
import {
  CommunicationEvent,
  CreateCommunicationEventInput,
  mapCommunicationEventRowToDomain,
} from './communication.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { hasPermission } from '@/domains/roles/policy'

export async function getCommunicationEventById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<CommunicationEvent>> {
  try {
    const row = await findById<CommunicationEventRow>('communication_events', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Communication event not found' })
    }
    return ok(mapCommunicationEventRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_COMMUNICATION_EVENT_FAILED',
      message: 'Failed to get communication event',
      details: { error: String(error) },
    })
  }
}

export async function listCommunicationEvents(filters?: {
  leadId?: UUID
  customerId?: UUID
  channel?: string
}): Promise<ServiceResult<CommunicationEvent[]>> {
  try {
    const rows = await findMany<CommunicationEventRow>('communication_events', (row) => {
      if (filters?.leadId && row.lead_id !== filters.leadId) {
        return false
      }
      if (filters?.customerId && row.customer_id !== filters.customerId) {
        return false
      }
      if (filters?.channel && row.channel !== filters.channel) {
        return false
      }
      return true
    })
    return ok(rows.map(mapCommunicationEventRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_COMMUNICATION_EVENTS_FAILED',
      message: 'Failed to list communication events',
      details: { error: String(error) },
    })
  }
}

export async function createCommunicationEvent(
  input: CreateCommunicationEventInput,
  ctx: ServiceContext
): Promise<ServiceResult<CommunicationEvent>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_leads')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to create communication events',
        })
      }
    }

    if (!input.customerId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'customerId is required',
      })
    }

    const rowData: Omit<CommunicationEventRow, 'id' | 'created_at' | 'updated_at'> = {
      lead_id: input.leadId,
      customer_id: input.customerId,
      channel: input.channel,
      direction: input.direction,
      subject: input.subject,
      body: input.body,
      transcript: input.transcript,
      summary: input.summary,
      ai_generated: input.aiGenerated || false,
      ai_confidence: input.aiConfidence,
      consent_checked: input.consentChecked || false,
      sent_by_user_id: input.sentByUserId,
      sent_by_agent: input.sentByAgent,
    }

    const row = await insert<CommunicationEventRow>('communication_events', rowData)
    const communicationEvent = mapCommunicationEventRowToDomain(row)

    await writeAuditLog(
      {
        action: 'communication_event.create',
        objectType: 'communication_event',
        objectId: communicationEvent.id,
        after: communicationEvent as unknown as Record<string, unknown>,
        confidenceScore: input.aiGenerated ? input.aiConfidence : undefined,
        requiresReview: input.aiGenerated && (input.aiConfidence || 0) < 0.8,
      },
      ctx
    )

    if (input.leadId && input.direction === 'outbound') {
      await publishEvent(
        {
          eventName: 'lead_contacted',
          objectType: 'lead',
          objectId: input.leadId,
          payload: {
            leadId: input.leadId,
            channel: input.channel,
            direction: input.direction,
          },
        },
        ctx
      )
    }

    return ok(communicationEvent)
  } catch (error) {
    return fail({
      code: 'CREATE_COMMUNICATION_EVENT_FAILED',
      message: 'Failed to create communication event',
      details: { error: String(error) },
    })
  }
}
