/**
 * Audit domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'

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
