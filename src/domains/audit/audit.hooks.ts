/**
 * Audit domain runtime hooks.
 *
 * Seeds AUDIT_LOG_DATA into the in-memory audit_logs store on first load,
 * then queries through the audit service layer.
 */
import { useState, useEffect } from 'react'
import type { QueryResult } from '@/hooks/useQueryResult'
import { AuditLogRow } from '@/lib/db/supabase'
import { insert, findMany } from '@/lib/db/helpers'

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

/* ── Seed ── */

let seeded = false

async function seedAuditLogsIfNeeded(): Promise<void> {
  if (seeded) return
  seeded = true
  const existing = await findMany<AuditLogRow>('audit_logs')
  if (existing.length > 0) return
  for (const a of AUDIT_LOG_DATA) {
    await insert<AuditLogRow>('audit_logs', {
      user_id: a.userId,
      user_role: a.userRole,
      entity_type: a.entityType,
      entity_id: a.entityId,
      action: a.action,
      source: a.source,
      timestamp: a.timestamp,
    } as Omit<AuditLogRow, 'id' | 'created_at' | 'updated_at'>)
  }
}

void seedAuditLogsIfNeeded()

/* ── Row → AuditLogEntry mapping ── */

function rowToAuditLogEntry(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    userRole: row.user_role ?? 'system',
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    source: row.source ?? 'system',
    timestamp: row.timestamp,
  }
}

/* ── Hooks ── */

export function useAuditLogs(): QueryResult<AuditLogEntry[]> {
  const [data, setData] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    seedAuditLogsIfNeeded().then(async () => {
      const rows = await findMany<AuditLogRow>('audit_logs')
      if (!cancelled) {
        setData(rows.map(rowToAuditLogEntry))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}
