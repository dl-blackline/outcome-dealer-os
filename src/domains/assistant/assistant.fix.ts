import { useState, useEffect, useCallback } from 'react'
import type { AssistantFixProposal, CodePatchProposal, AssistantActionId } from './assistant.types'
import { AssistantFixProposalRow } from '@/lib/db/supabase'
import { insert, update, findMany } from '@/lib/db/helpers'
import { requestApproval } from '@/domains/approvals/approval.service'
import type { ServiceContext } from '@/types/common'

/* ─── Row ↔ Domain mappers ─────────────────────────────────────────────── */

function rowToProposal(row: AssistantFixProposalRow): AssistantFixProposal {
  return {
    id: row.id,
    actionId: row.action_id as AssistantActionId,
    issueSummary: row.issue_summary,
    patchProposals: row.patch_proposals as unknown as CodePatchProposal[],
    status: row.status,
    approvalId: row.approval_id,
    createdAt: row.created_at,
  }
}

/* ─── Service functions ─────────────────────────────────────────────────── */

/**
 * Persist a new fix proposal as a draft and, if patchProposals is non-empty,
 * immediately request manager approval (ai_action_review type).
 */
export async function submitFixProposal(
  actionId: AssistantActionId,
  issueSummary: string,
  patchProposals: CodePatchProposal[],
  ctx: ServiceContext,
): Promise<AssistantFixProposal> {
  // Save to DB — let the store auto-generate id/created_at/updated_at
  const rowPayload: Omit<AssistantFixProposalRow, 'id' | 'created_at' | 'updated_at'> = {
    action_id: actionId,
    issue_summary: issueSummary,
    patch_proposals: patchProposals as Record<string, unknown>[],
    status: 'draft',
  }
  const row = await insert<AssistantFixProposalRow>('assistant_fix_proposals', rowPayload)

  let approvalId: string | undefined

  if (patchProposals.length > 0) {
    const approvalResult = await requestApproval(
      {
        type: 'ai_action_review',
        requestedByAgent: 'assistant-ops-console',
        linkedEntityType: 'assistant_fix_proposal',
        linkedEntityId: row.id,
        description: `Review ${patchProposals.length} patch proposal(s) for: ${issueSummary}`,
        metadata: {
          patchCount: patchProposals.length,
          files: patchProposals.map(p => p.file),
        },
      },
      ctx,
    )

    if (approvalResult.ok) {
      approvalId = approvalResult.value.id
      await update<AssistantFixProposalRow>('assistant_fix_proposals', row.id, {
        status: 'pending_approval',
        approval_id: approvalId,
      })
    }
  }

  return {
    id: row.id,
    actionId,
    issueSummary,
    patchProposals,
    status: approvalId ? 'pending_approval' : 'draft',
    approvalId,
    createdAt: row.created_at,
  }
}

/**
 * Update the status of a fix proposal after approval resolution.
 * Called by the approval resolution flow or by a manager action.
 */
export async function updateFixProposalStatus(
  id: string,
  status: AssistantFixProposal['status'],
): Promise<void> {
  await update<AssistantFixProposalRow>('assistant_fix_proposals', id, { status })
}

/* ─── React hook ────────────────────────────────────────────────────────── */

/**
 * Reactive hook that reads all assistant fix proposals from the in-memory DB.
 * Re-queries whenever `refreshKey` changes (pass an incrementing counter after mutations).
 */
export function useFixProposals(refreshKey = 0): {
  proposals: AssistantFixProposal[]
  loading: boolean
  reload: () => void
} {
  const [proposals, setProposals] = useState<AssistantFixProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [internalKey, setInternalKey] = useState(0)

  const reload = useCallback(() => setInternalKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    findMany<AssistantFixProposalRow>('assistant_fix_proposals')
      .then(rows => {
        if (!cancelled) {
          setProposals(
            rows
              .map(rowToProposal)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          )
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [refreshKey, internalKey])

  return { proposals, loading, reload }
}
