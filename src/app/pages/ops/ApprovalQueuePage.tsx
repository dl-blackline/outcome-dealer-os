import { useState, useEffect, useCallback } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_APPROVALS, type MockApproval } from '@/lib/mockData'
import { Shield, CheckCircle, XCircle } from '@phosphor-icons/react'
import { approveRequest, denyRequest } from '@/domains/approvals/approval.service'
import { emitEvent } from '@/domains/events/event.bus'
import { useAuth } from '@/domains/auth/auth.store'

const TABS = ['pending', 'granted', 'denied', 'all'] as const

export function ApprovalQueuePage() {
  const [tab, setTab] = useState<string>('pending')
  const [approvals, setApprovals] = useState<MockApproval[]>(MOCK_APPROVALS)
  const { user } = useAuth()
  const filtered = approvals.filter(a => tab === 'all' || a.status === tab)
  const pendingCount = approvals.filter(a => a.status === 'pending').length

  const handleAction = useCallback(async (id: string, action: 'granted' | 'denied') => {
    // Update local state immediately for responsive UI
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a))

    // Attempt real service call (works when approval exists in KV)
    const resolution = {
      approvalId: id,
      action: action === 'granted' ? 'grant' as const : 'deny' as const,
      userId: user?.id ?? 'unknown',
      userRole: user?.role ?? 'gm',
    }

    const ctx = {
      actorType: 'user' as const,
      actorId: user?.id,
      actorRole: user?.role,
    }

    try {
      if (action === 'granted') {
        await approveRequest(resolution, ctx)
      } else {
        await denyRequest(resolution, ctx)
      }
    } catch (err) {
      // Service call may fail for mock-seeded approvals not in KV — log but don't block UI
      console.warn('[ApprovalQueue] Service call failed (expected for mock data):', err)
    }

    // Emit event through the bus (persists + may generate workstation card)
    await emitEvent({
      eventName: action === 'granted' ? 'approval_granted' : 'approval_denied',
      objectType: 'approval',
      objectId: id,
      payload: { action, resolvedBy: user?.displayName ?? 'Unknown' },
    }, {
      actorType: 'user',
      actorId: user?.id,
      actorRole: user?.role,
    })
  }, [user])

  return (
    <div className="space-y-6">
      <SectionHeader title="Approval Queue" description="Review and resolve pending approvals" action={pendingCount > 0 ? <Badge variant="destructive">{pendingCount} pending</Badge> : undefined} />
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-sm capitalize ${tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground'}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground">No approvals in this category.</CardContent></Card> :
          filtered.map(a => (
            <Card key={a.id} className={a.status === 'pending' ? 'border-yellow-500/20' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="capitalize text-xs">{a.type.replace(/_/g, ' ')}</Badge>
                      <StatusPill variant={a.status === 'pending' ? 'warning' : a.status === 'granted' ? 'success' : 'danger'}>{a.status}</StatusPill>
                    </div>
                    <p className="text-sm">{a.description}</p>
                    <p className="text-xs text-muted-foreground">Requested by {a.requestedBy} • {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => handleAction(a.id, 'granted')}><CheckCircle className="h-4 w-4" /> Approve</Button>
                      <Button size="sm" variant="outline" className="gap-1 text-red-600" onClick={() => handleAction(a.id, 'denied')}><XCircle className="h-4 w-4" /> Deny</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
