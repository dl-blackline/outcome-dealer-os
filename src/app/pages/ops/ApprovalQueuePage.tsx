import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApprovalMutations } from '@/domains/approvals/approval.hooks'
import { Shield, CheckCircle, XCircle, SpinnerGap, User } from '@phosphor-icons/react'

const TABS = ['pending', 'granted', 'denied', 'all'] as const

export function ApprovalQueuePage() {
  const [tab, setTab] = useState<string>('pending')
  const { approvals, approveItem, denyItem } = useApprovalMutations()
  const [notesMap, setNotesMap] = useState<Record<string, string>>({})
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null)
  const filtered = approvals.filter(a => tab === 'all' || a.status === tab)
  const pendingCount = approvals.filter(a => a.status === 'pending').length

  const handleAction = (id: string, action: 'approve' | 'deny') => {
    const notes = notesMap[id]?.trim() || undefined
    if (action === 'approve') {
      approveItem(id, notes)
    } else {
      denyItem(id, notes)
    }
    setShowNotesFor(null)
    setNotesMap(prev => { const next = { ...prev }; delete next[id]; return next })
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Approval Queue" description="Review and resolve pending approvals" action={pendingCount > 0 ? <Badge variant="destructive">{pendingCount} pending</Badge> : undefined} />
      <div className="ods-toolbar w-fit gap-0 overflow-hidden rounded-lg p-0">
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
                    {a.resolvedBy && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>Resolved by {a.resolvedBy}{a.resolvedAt ? ` • ${new Date(a.resolvedAt).toLocaleString()}` : ''}</span>
                      </div>
                    )}
                    {a.resolutionNotes && (
                      <p className="text-xs text-muted-foreground italic mt-1">"{a.resolutionNotes}"</p>
                    )}
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1 text-green-600" onClick={() => showNotesFor === a.id ? handleAction(a.id, 'approve') : setShowNotesFor(a.id)}>
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-red-600" onClick={() => showNotesFor === a.id ? handleAction(a.id, 'deny') : setShowNotesFor(a.id)}>
                          <XCircle className="h-4 w-4" /> Deny
                        </Button>
                      </div>
                      {showNotesFor === a.id && (
                        <input
                          autoFocus
                          type="text"
                          placeholder="Resolution notes (optional)…"
                          value={notesMap[a.id] ?? ''}
                          onChange={e => setNotesMap(prev => ({ ...prev, [a.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Escape') setShowNotesFor(null) }}
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs placeholder:text-muted-foreground"
                        />
                      )}
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
