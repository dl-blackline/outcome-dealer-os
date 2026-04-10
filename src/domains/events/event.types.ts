import { UUID, ActorType } from '@/types/common'
import { EventName } from './event.constants'

export interface EventPayload {
  eventName: EventName
  objectType?: string
  objectId?: UUID
  payload: Record<string, unknown>
  actorType: ActorType
  actorId?: UUID
  source?: string
  traceId?: UUID
}

export interface PublishedEvent {
  id: UUID
  eventName: EventName
  eventId: UUID
  timestamp: string
  actorType: ActorType
  actorId?: UUID
  entityType?: string
  entityId?: UUID
  payload: Record<string, unknown>
  traceId?: UUID
  status: 'pending' | 'processed' | 'failed'
  createdAt: string
}
