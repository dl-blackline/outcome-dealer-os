/**
 * Event Bus — Central event processing with auto-card execution.
 *
 * When an event is published, the bus:
 * 1. Persists it via the event publisher
 * 2. Checks auto-card rules for matching event
 * 3. If a rule matches, generates and persists a workstation card
 *
 * This is the runtime execution path from event → workstation card.
 */
import { EventPayload, PublishedEvent } from './event.types'
import { EventName } from './event.constants'
import { publishEvent } from './event.publisher'
import { generateCardFromEvent, createWorkstationCard } from '@/domains/workstation'
import { ServiceResult, ServiceContext } from '@/types/common'

export type EventListener = (event: PublishedEvent) => void

const listeners: EventListener[] = []

export function onEvent(listener: EventListener): () => void {
  listeners.push(listener)
  return () => {
    const idx = listeners.indexOf(listener)
    if (idx >= 0) listeners.splice(idx, 1)
  }
}

function notifyListeners(event: PublishedEvent): void {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch {
      // listeners should not throw, but don't break the bus
    }
  }
}

/**
 * Emit an event through the bus: persist + auto-card + notify listeners.
 */
export async function emitEvent(
  payload: Omit<EventPayload, 'actorType' | 'actorId'> & Partial<Pick<EventPayload, 'actorType' | 'actorId'>>,
  ctx?: ServiceContext
): Promise<ServiceResult<PublishedEvent>> {
  // 1. Persist the event
  const result = await publishEvent(payload, ctx)
  if (!result.ok) return result

  const event = result.value

  // 2. Check auto-card rules
  const cardTemplate = generateCardFromEvent(
    payload.eventName as EventName,
    payload.objectId ?? event.id
  )

  if (cardTemplate) {
    await createWorkstationCard(cardTemplate)
  }

  // 3. Notify in-memory listeners
  notifyListeners(event)

  return result
}
