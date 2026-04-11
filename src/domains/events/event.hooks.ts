/**
 * Event domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_EVENTS, MOCK_SERVICE_EVENTS, type MockEvent, type MockServiceEvent } from '@/lib/mockData'
import type { OperatingSignal } from '@/domains/events/operatingSignal'

export function useEvents(): QueryResult<MockEvent[]> { return useSimulatedQuery(() => MOCK_EVENTS) }
export function useEntityEvents(entityId: string): QueryResult<MockEvent[]> { return useSimulatedQuery(() => MOCK_EVENTS.filter(e => e.entityId === entityId)) }
export function useServiceEvents(): QueryResult<MockServiceEvent[]> { return useSimulatedQuery(() => MOCK_SERVICE_EVENTS) }

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
  return useSimulatedQuery(() =>
    MOCK_EVENTS.map(e => ({
      id: e.id,
      type: 'event' as const,
      severity: classifySeverity(e.eventName),
      title: e.eventName.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
      description: `${e.actorType} action on ${e.entityType ?? 'system'}${e.entityId ? ` (${e.entityId})` : ''}`,
      entityType: e.entityType,
      entityId: e.entityId,
      timestamp: e.timestamp,
      read: false,
    }))
  )
}
