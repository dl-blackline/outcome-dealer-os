import { describe, it, expect } from 'vitest'

import { publishEvent } from '@/domains/events/event.publisher'
import { getEventsByEntity } from '@/domains/events/event.service'

describe('Event Publisher', () => {
  it('should publish event with correct payload shape', async () => {
    const result = await publishEvent({
      eventName: 'lead_created',
      objectType: 'lead',
      objectId: 'test-lead-123',
      payload: {
        leadSource: 'website',
        score: 85,
      },
      actorType: 'user',
      actorId: 'user-456',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.eventName).toBe('lead_created')
      expect(result.value.entityType).toBe('lead')
      expect(result.value.entityId).toBe('test-lead-123')
      expect(result.value.payload.leadSource).toBe('website')
      expect(result.value.actorType).toBe('user')
      expect(result.value.actorId).toBe('user-456')
    }
  })

  it('should default to system actor when not specified', async () => {
    const result = await publishEvent({
      eventName: 'unit_frontline_ready',
      objectType: 'inventory',
      objectId: 'inv-789',
      payload: { vin: 'ABC123' },
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.actorType).toBe('system')
    }
  })

  it('should retrieve events by entity', async () => {
    const entityId = 'test-entity-999'

    await publishEvent({
      eventName: 'lead_validated',
      objectType: 'lead',
      objectId: entityId,
      payload: {},
      actorType: 'user',
    })

    const result = await getEventsByEntity('lead', entityId)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0)
      expect(result.value.every((e) => e.entityId === entityId)).toBe(true)
    }
  })
})
