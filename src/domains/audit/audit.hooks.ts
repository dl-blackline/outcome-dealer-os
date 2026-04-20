/**
 * Audit domain runtime hooks.
 *
 * Queries the in-memory audit_logs store through the audit service layer.
 */
import { useState, useEffect } from 'react'
import type { QueryResult } from '@/hooks/useQueryResult'
import { AuditLogRow } from '@/lib/db/supabase'
import { findMany } from '@/lib/db/helpers'

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
    findMany<AuditLogRow>('audit_logs').then((rows) => {
      if (!cancelled) {
        setData(rows.map(rowToAuditLogEntry))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}
