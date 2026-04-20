/**
 * Approval domain runtime hooks.
 *
 * Queries the approval store through the approval service layer.
 */
import { useState, useEffect, useCallback } from 'react'
import type { QueryResult } from '@/hooks/useQueryResult'
import { type MockApproval } from '@/lib/mockData'
import { ApprovalRow } from '@/lib/db/supabase'
import { findMany, update } from '@/lib/db/helpers'
import { publishEvent } from '@/domains/events/event.publisher'
import { writeAuditLog } from '@/domains/audit/audit.service'

/* ── Row → MockApproval mapping ── */

function rowToMockApproval(row: ApprovalRow): MockApproval {
  return {
    id: row.id,
    type: row.type as MockApproval['type'],
    requestedBy: row.requested_by_agent ?? row.requested_by_role ?? 'System',
    description: row.description,
    status: row.status,
    resolvedBy: row.approved_by_role,
    resolvedAt: row.resolved_at,
    resolutionNotes: row.resolution_notes,
    createdAt: row.created_at,
  }
}

/* ── Hooks ── */

export function useApprovals(): QueryResult<MockApproval[]> {
  const [data, setData] = useState<MockApproval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    findMany<ApprovalRow>('approvals').then((rows) => {
      if (!cancelled) {
        setData(rows.map(rowToMockApproval))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}

export interface ApprovalMutations {
  approvals: MockApproval[]
  approveItem: (id: string, notes?: string) => void
  denyItem: (id: string, notes?: string) => void
}

export function useApprovalMutations(): ApprovalMutations {
  const [approvals, setApprovals] = useState<MockApproval[]>([])

  const refresh = useCallback(async () => {
    const rows = await findMany<ApprovalRow>('approvals')
    setApprovals(rows.map(rowToMockApproval))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const ctx = { actorType: 'user' as const, actorId: 'user-mgr-01', actorRole: 'sales_manager', source: 'approval_queue' }

  const approveItem = useCallback((id: string, notes?: string) => {
    void (async () => {
      const now = new Date().toISOString()
      await update<ApprovalRow>('approvals', id, {
        status: 'granted',
        approved_by_user_id: ctx.actorId,
        approved_by_role: 'Current User (Manager)',
        resolved_at: now,
        resolution_notes: notes,
      })
      await publishEvent({ eventName: 'approval_granted', objectType: 'approval', objectId: id, payload: { notes } }, ctx)
      await writeAuditLog({ action: 'approval_granted', objectType: 'approval', objectId: id, before: { status: 'pending' }, after: { status: 'granted' } }, ctx)
      await refresh()
      console.info(`[ApprovalMutation] Approved ${id}${notes ? ` — "${notes}"` : ''}`)
    })()
  }, [refresh])

  const denyItem = useCallback((id: string, notes?: string) => {
    void (async () => {
      const now = new Date().toISOString()
      await update<ApprovalRow>('approvals', id, {
        status: 'denied',
        approved_by_user_id: ctx.actorId,
        approved_by_role: 'Current User (Manager)',
        resolved_at: now,
        resolution_notes: notes,
      })
      await publishEvent({ eventName: 'approval_denied', objectType: 'approval', objectId: id, payload: { notes } }, ctx)
      await writeAuditLog({ action: 'approval_denied', objectType: 'approval', objectId: id, before: { status: 'pending' }, after: { status: 'denied' } }, ctx)
      await refresh()
      console.info(`[ApprovalMutation] Denied ${id}${notes ? ` — "${notes}"` : ''}`)
    })()
  }, [refresh])

  return { approvals, approveItem, denyItem }
}
