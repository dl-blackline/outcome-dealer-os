/**
 * Approval domain runtime hooks.
 */
import { useState, useCallback } from 'react'
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_APPROVALS, type MockApproval } from '@/lib/mockData'

export function useApprovals(): QueryResult<MockApproval[]> { return useSimulatedQuery(() => MOCK_APPROVALS) }

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
