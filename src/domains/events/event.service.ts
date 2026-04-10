import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { EventBusRow } from '@/lib/db/supabase'
import { findMany, update } from '@/lib/db/helpers'
import { PublishedEvent } from './event.types'

export async function getEventsByEntity(
  entityType: string,
  entityId: UUID
): Promise<ServiceResult<PublishedEvent[]>> {
  try {
    const rows = await findMany<EventBusRow>(
      'event_bus',
      (row) => row.entity_type === entityType && row.entity_id === entityId
    )

    const events: PublishedEvent[] = rows.map((row) => ({
      id: row.id,
      eventName: row.event_name as any,
      eventId: row.event_id,
      timestamp: row.timestamp,
      actorType: row.actor_type,
      actorId: row.actor_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload,
      traceId: row.trace_id,
      status: row.status,
      createdAt: row.created_at,
    }))

    return ok(events)
  } catch (error) {
    return fail({
      code: 'GET_EVENTS_FAILED',
      message: 'Failed to get events',
      details: { error: String(error) },
    })
  }
}

export async function markEventProcessed(eventId: UUID): Promise<ServiceResult<void>> {
  try {
    await update<EventBusRow>('event_bus', eventId, { status: 'processed' })
    return ok(undefined)
  } catch (error) {
    return fail({
      code: 'MARK_EVENT_FAILED',
      message: 'Failed to mark event as processed',
      details: { error: String(error) },
    })
  }
}

export async function markEventFailed(eventId: UUID): Promise<ServiceResult<void>> {
  try {
    await update<EventBusRow>('event_bus', eventId, { status: 'failed' })
    return ok(undefined)
  } catch (error) {
    return fail({
      code: 'MARK_EVENT_FAILED',
      message: 'Failed to mark event as failed',
      details: { error: String(error) },
    })
  }
}
