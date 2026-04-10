import { ServiceResult, ok, fail, ServiceContext } from '@/types/common'
import { EventPayload, PublishedEvent } from './event.types'
import { EventBusRow } from '@/lib/db/supabase'
import { insert } from '@/lib/db/helpers'

export async function publishEvent(
  payload: Omit<EventPayload, 'actorType' | 'actorId'> & Partial<Pick<EventPayload, 'actorType' | 'actorId'>>,
  ctx?: ServiceContext
): Promise<ServiceResult<PublishedEvent>> {
  try {
    const now = new Date().toISOString()
    const eventId = crypto.randomUUID()

    const actorType = payload.actorType || ctx?.actorType || 'system'
    const actorId = payload.actorId || ctx?.actorId

    const eventRow: Omit<EventBusRow, 'id' | 'created_at' | 'updated_at'> = {
      event_name: payload.eventName,
      event_id: eventId,
      timestamp: now,
      actor_type: actorType,
      actor_id: actorId,
      entity_type: payload.objectType,
      entity_id: payload.objectId,
      payload: payload.payload,
      trace_id: payload.traceId,
      status: 'pending',
    }

    const savedRow = await insert<EventBusRow>('event_bus', eventRow)

    const result: PublishedEvent = {
      id: savedRow.id,
      eventName: savedRow.event_name as any,
      eventId: savedRow.event_id,
      timestamp: savedRow.timestamp,
      actorType: savedRow.actor_type,
      actorId: savedRow.actor_id,
      entityType: savedRow.entity_type,
      entityId: savedRow.entity_id,
      payload: savedRow.payload,
      traceId: savedRow.trace_id,
      status: savedRow.status,
      createdAt: savedRow.created_at,
    }

    return ok(result)
  } catch (error) {
    return fail({
      code: 'EVENT_PUBLISH_FAILED',
      message: 'Failed to publish event',
      details: { error: String(error) },
    })
  }
}
