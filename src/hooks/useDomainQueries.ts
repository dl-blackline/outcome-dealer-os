/**
 * Canonical frontend data layer — domain query hooks.
 *
 * Each hook returns { data, loading, error } and consults the adapter layer,
 * which currently resolves to mock data. When real APIs exist, only the
 * adapter files change — pages and hooks stay untouched.
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { MOCK_LEADS, MOCK_DEALS, MOCK_INVENTORY, MOCK_APPROVALS, MOCK_EVENTS, MOCK_SERVICE_EVENTS, MOCK_TASKS, type MockLead, type MockDeal, type MockInventoryUnit, type MockApproval, type MockEvent, type MockServiceEvent, type MockTask } from '@/lib/mockData'
import { MOCK_WORKSTATION_CARDS, type WorkstationCard, type WorkstationColumnId } from '@/domains/workstation'
import type { OperatingSignal } from '@/domains/events/operatingSignal'

/* ─── Generic query result type ─── */
export interface QueryResult<T> {
  data: T
  loading: boolean
  error: string | null
}

function useSimulatedQuery<T>(resolver: () => T): QueryResult<T> {
  const [loading, setLoading] = useState(true)
  const data = useMemo(resolver, [])
  useEffect(() => { const t = setTimeout(() => setLoading(false), 80); return () => clearTimeout(t) }, [])
  return { data, loading, error: null }
}

/* ─── Household mock ─── */
export interface HouseholdSummary {
  id: string
  name: string
  primaryContact: string
  lifetimeValue: number
  loyaltyScore: number
  members: number
  preferredContact?: string
  createdAt: string
}

const HOUSEHOLD_DATA: HouseholdSummary[] = [
  { id: 'hh-001', name: 'Mitchell Family', primaryContact: 'Sarah Mitchell', lifetimeValue: 38900, loyaltyScore: 72, preferredContact: 'email', members: 2, createdAt: '2024-11-01T10:00:00Z' },
  { id: 'hh-002', name: 'Johnson Family', primaryContact: 'Marcus Johnson', lifetimeValue: 105200, loyaltyScore: 91, preferredContact: 'phone', members: 3, createdAt: '2024-06-15T14:00:00Z' },
  { id: 'hh-003', name: 'Rodriguez Family', primaryContact: 'Elena Rodriguez', lifetimeValue: 0, loyaltyScore: 15, preferredContact: 'sms', members: 1, createdAt: '2025-01-16T09:15:00Z' },
  { id: 'hh-004', name: 'Thompson Family', primaryContact: 'David Thompson', lifetimeValue: 67800, loyaltyScore: 85, preferredContact: 'phone', members: 2, createdAt: '2023-03-20T08:30:00Z' },
]

export function useHouseholds(): QueryResult<HouseholdSummary[]> { return useSimulatedQuery(() => HOUSEHOLD_DATA) }
export function useHousehold(id: string): QueryResult<HouseholdSummary | null> {
  return useSimulatedQuery(() => HOUSEHOLD_DATA.find(h => h.id === id) ?? null)
}

/* ─── Leads ─── */
export function useLeads(): QueryResult<MockLead[]> { return useSimulatedQuery(() => MOCK_LEADS) }
export function useLead(id: string): QueryResult<MockLead | null> { return useSimulatedQuery(() => MOCK_LEADS.find(l => l.id === id) ?? null) }

/* ─── Deals ─── */
export function useDeals(): QueryResult<MockDeal[]> { return useSimulatedQuery(() => MOCK_DEALS) }
export function useDeal(id: string): QueryResult<MockDeal | null> { return useSimulatedQuery(() => MOCK_DEALS.find(d => d.id === id) ?? null) }

/* ─── Inventory ─── */
export function useInventory(): QueryResult<MockInventoryUnit[]> { return useSimulatedQuery(() => MOCK_INVENTORY) }
export function useInventoryUnit(id: string): QueryResult<MockInventoryUnit | null> { return useSimulatedQuery(() => MOCK_INVENTORY.find(u => u.id === id) ?? null) }

/* ─── Tasks ─── */
export function useTasks(): QueryResult<MockTask[]> { return useSimulatedQuery(() => MOCK_TASKS) }

/* ─── Approvals ─── */
export function useApprovals(): QueryResult<MockApproval[]> { return useSimulatedQuery(() => MOCK_APPROVALS) }

/* ─── Approval Mutations ─── */
export interface ApprovalMutations {
  approvals: MockApproval[]
  approveItem: (id: string, notes?: string) => void
  denyItem: (id: string, notes?: string) => void
}

export function useApprovalMutations(): ApprovalMutations {
  const [approvals, setApprovals] = useState<MockApproval[]>(MOCK_APPROVALS)

  const approveItem = useCallback((id: string, notes?: string) => {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'granted' as const, resolvedBy: 'Current User (Manager)', resolvedAt: new Date().toISOString(), resolutionNotes: notes } : a
    ))
    console.info(`[ApprovalMutation] Approved ${id}${notes ? ` — "${notes}"` : ''}`)
  }, [])

  const denyItem = useCallback((id: string, notes?: string) => {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'denied' as const, resolvedBy: 'Current User (Manager)', resolvedAt: new Date().toISOString(), resolutionNotes: notes } : a
    ))
    console.info(`[ApprovalMutation] Denied ${id}${notes ? ` — "${notes}"` : ''}`)
  }, [])

  return { approvals, approveItem, denyItem }
}

/* ─── Events ─── */
export function useEvents(): QueryResult<MockEvent[]> { return useSimulatedQuery(() => MOCK_EVENTS) }
export function useEntityEvents(entityId: string): QueryResult<MockEvent[]> { return useSimulatedQuery(() => MOCK_EVENTS.filter(e => e.entityId === entityId)) }

/* ─── Service Events ─── */
export function useServiceEvents(): QueryResult<MockServiceEvent[]> { return useSimulatedQuery(() => MOCK_SERVICE_EVENTS) }

/* ─── Audit Logs ─── */
export interface AuditLogEntry {
  id: string
  userId?: string
  userRole: string
  entityType: string
  entityId: string
  action: string
  source: string
  timestamp: string
}

const AUDIT_LOG_DATA: AuditLogEntry[] = [
  { id: 'aud-001', userId: 'user-01', userRole: 'sales_rep', entityType: 'lead', entityId: 'lead-003', action: 'lead_created', source: 'system', timestamp: '2025-01-16T09:15:00Z' },
  { id: 'aud-002', userId: 'user-01', userRole: 'sales_rep', entityType: 'lead', entityId: 'lead-003', action: 'lead_score_updated', source: 'agent', timestamp: '2025-01-16T09:15:30Z' },
  { id: 'aud-003', userId: 'user-02', userRole: 'sales_manager', entityType: 'deal', entityId: 'deal-002', action: 'desk_scenario_created', source: 'user', timestamp: '2025-01-15T11:50:00Z' },
  { id: 'aud-004', userId: 'user-03', userRole: 'fi_manager', entityType: 'approval', entityId: 'app-002', action: 'approval_granted', source: 'user', timestamp: '2025-01-15T16:10:00Z' },
  { id: 'aud-005', userId: 'user-01', userRole: 'sales_rep', entityType: 'deal', entityId: 'deal-001', action: 'deal_signed', source: 'user', timestamp: '2025-01-14T17:30:00Z' },
  { id: 'aud-006', userRole: 'system', entityType: 'deal', entityId: 'deal-001', action: 'deal_funded', source: 'system', timestamp: '2025-01-14T18:45:00Z' },
]

export function useAuditLogs(): QueryResult<AuditLogEntry[]> { return useSimulatedQuery(() => AUDIT_LOG_DATA) }

/* ─── Integrations ─── */
export interface IntegrationStatus {
  id: string
  name: string
  type: string
  status: 'healthy' | 'degraded' | 'failed' | 'recovering'
  lastSync: string
  errorCount: number
}

const INTEGRATION_DATA: IntegrationStatus[] = [
  { id: 'int-001', name: 'Dealer Management System', type: 'dms', status: 'healthy', lastSync: '2025-01-16T13:00:00Z', errorCount: 0 },
  { id: 'int-002', name: 'Credit Bureau API', type: 'credit_bureau', status: 'healthy', lastSync: '2025-01-16T12:45:00Z', errorCount: 0 },
  { id: 'int-003', name: 'Lender Portal', type: 'lender_portal', status: 'degraded', lastSync: '2025-01-16T10:00:00Z', errorCount: 3 },
  { id: 'int-004', name: 'Marketing Platform', type: 'marketing', status: 'healthy', lastSync: '2025-01-16T08:00:00Z', errorCount: 0 },
]

export function useIntegrations(): QueryResult<IntegrationStatus[]> { return useSimulatedQuery(() => INTEGRATION_DATA) }

/* ─── Workstation ─── */
export function useWorkstationCards(): QueryResult<WorkstationCard[]> { return useSimulatedQuery(() => MOCK_WORKSTATION_CARDS) }

/* ─── Workstation Mutations ─── */
export interface WorkstationMutations {
  cards: WorkstationCard[]
  moveCard: (cardId: string, toCol: WorkstationColumnId) => void
  createCard: (partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => void
  completeCard: (cardId: string) => void
  reopenCard: (cardId: string) => void
}

export function useWorkstationMutations(): WorkstationMutations {
  const [cards, setCards] = useState<WorkstationCard[]>(MOCK_WORKSTATION_CARDS)

  const moveCard = useCallback((cardId: string, toCol: WorkstationColumnId) => {
    setCards(prev => prev.map(c =>
      c.id === cardId
        ? { ...c, columnId: toCol, status: toCol === 'done' ? 'completed' as const : (c as WorkstationCard & { status?: string }).status === 'completed' ? 'reopened' as const : (c as WorkstationCard & { status?: string }).status ?? 'active', updatedAt: new Date().toISOString() }
        : c
    ))
  }, [])

  const createCard = useCallback((partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const card: WorkstationCard = { ...partial, id: `wc-${Date.now()}`, createdAt: now, updatedAt: now }
    setCards(prev => [card, ...prev])
  }, [])

  const completeCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: 'done' as WorkstationColumnId, status: 'completed' as const, updatedAt: new Date().toISOString() } : c
    ))
  }, [])

  const reopenCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: 'inbox' as WorkstationColumnId, status: 'reopened' as const, updatedAt: new Date().toISOString() } : c
    ))
  }, [])

  return { cards, moveCard, createCard, completeCard, reopenCard }
}

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
