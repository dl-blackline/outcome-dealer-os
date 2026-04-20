/**
 * Event domain runtime hooks.
 *
 * Queries the in-memory event_bus store through the event service layer.
 */
import { useState, useEffect } from 'react'
import type { QueryResult } from '@/hooks/useQueryResult'
import { useSimulatedQuery } from '@/hooks/useQueryResult'
import { type MockEvent, type MockServiceEvent } from '@/lib/mockData'
import { EventBusRow } from '@/lib/db/supabase'
import { findMany } from '@/lib/db/helpers'
import type { OperatingSignal } from '@/domains/events/operatingSignal'

/* ── Row → MockEvent mapping ── */

function rowToMockEvent(row: EventBusRow): MockEvent {
  return {
    id: row.id,
    eventName: row.event_name as MockEvent['eventName'],
    entityType: row.entity_type ?? '',
    entityId: row.entity_id ?? '',
    actorType: row.actor_type,
    timestamp: row.timestamp,
  }
}

/* ── Hooks ── */

export function useEvents(): QueryResult<MockEvent[]> {
  const [data, setData] = useState<MockEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    findMany<EventBusRow>('event_bus').then((rows) => {
      if (!cancelled) {
        setData(rows.map(rowToMockEvent))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}

export function useEntityEvents(entityId: string): QueryResult<MockEvent[]> {
  const [data, setData] = useState<MockEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    findMany<EventBusRow>('event_bus', r => r.entity_id === entityId).then((rows) => {
      if (!cancelled) {
        setData(rows.map(rowToMockEvent))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [entityId])

  return { data, loading, error: null }
}

const NO_SERVICE_EVENTS: MockServiceEvent[] = []
export function useServiceEvents(): QueryResult<MockServiceEvent[]> { return useSimulatedQuery(() => NO_SERVICE_EVENTS) }

/* ─── Operating Signals ─── */
const WARNING_EVENTS = ['appointment_no_show', 'funding_missing_item', 'lender_declined', 'integration_sync_failed', 'unit_hit_aging_threshold', 'approval_denied', 'service_customer_declined_work', 'wholesale_recommended']
const SUCCESS_EVENTS = ['deal_funded', 'approval_granted', 'vehicle_delivered', 'deal_signed', 'unit_frontline_ready', 'integration_sync_recovered', 'lead_converted']
const CRITICAL_EVENTS = ['integration_sync_failed', 'lender_declined']

function classifySeverity(eventName: string): OperatingSignal['severity'] {
  if (CRITICAL_EVENTS.includes(eventName)) return 'critical'
  if (WARNING_EVENTS.includes(eventName)) return 'warning'
  if (SUCCESS_EVENTS.includes(eventName)) return 'success'
  return 'info'
}

export function useOperatingSignals(): QueryResult<OperatingSignal[]> {
  const [data, setData] = useState<OperatingSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    findMany<EventBusRow>('event_bus').then((rows) => {
      if (!cancelled) {
        setData(rows.map(r => ({
          id: r.id,
          type: 'event' as const,
          severity: classifySeverity(r.event_name),
          title: r.event_name.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
          description: `${r.actor_type} action on ${r.entity_type ?? 'system'}${r.entity_id ? ` (${r.entity_id})` : ''}`,
          entityType: r.entity_type,
          entityId: r.entity_id,
          timestamp: r.timestamp,
          read: false,
        })))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}
