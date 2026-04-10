/**
 * Reusable governance UI components for Outcome Dealer OS.
 * Used across record pages, workstation cards, and ops surfaces.
 */
import { StatusPill } from '@/components/core/StatusPill'
import { EntityBadge } from '@/components/core/EntityBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, User, Robot, Gear, Warning } from '@phosphor-icons/react'

/* ─── Approval Status Badge ─── */
export function ApprovalStatusBadge({ status }: { status: 'pending' | 'granted' | 'denied' }) {
  const variant = status === 'pending' ? 'warning' as const : status === 'granted' ? 'success' as const : 'danger' as const
  return <StatusPill variant={variant}>{status}</StatusPill>
}

/* ─── Requires Review Flag ─── */
export function RequiresReviewFlag({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600">
      <Shield className="h-3.5 w-3.5" weight="fill" /> Requires Review
    </div>
  )
}

/* ─── Approval Summary Card ─── */
export function ApprovalSummaryCard({
  approvals,
}: {
  approvals: Array<{ id: string; type: string; description: string; status: 'pending' | 'granted' | 'denied'; requestedBy: string; createdAt: string }>
}) {
  if (approvals.length === 0) return null
  const pending = approvals.filter(a => a.status === 'pending').length
  return (
    <Card className={pending > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-yellow-500" />
          Approvals {pending > 0 && <Badge variant="destructive" className="text-xs">{pending} pending</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {approvals.map(a => (
            <div key={a.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
              <div>
                <p className="text-sm">{a.description}</p>
                <p className="text-xs text-muted-foreground">{a.requestedBy} • {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
              <ApprovalStatusBadge status={a.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Audit Row Component ─── */
export function AuditRow({
  log,
}: {
  log: { timestamp: string; userRole: string; entityType: string; entityId: string; action: string; source: string }
}) {
  const entityVariant: Record<string, 'lead' | 'deal' | 'approval'> = { lead: 'lead', deal: 'deal', approval: 'approval' }
  return (
    <div className="flex items-center gap-4 py-2 text-sm border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground whitespace-nowrap w-36">{new Date(log.timestamp).toLocaleString()}</span>
      <Badge variant="outline" className="text-xs capitalize">{log.userRole.replace(/_/g, ' ')}</Badge>
      <EntityBadge variant={entityVariant[log.entityType] ?? 'lead'}>{log.entityType}</EntityBadge>
      <span className="font-mono text-xs text-muted-foreground">{log.entityId}</span>
      <span className="text-sm">{log.action.replace(/_/g, ' ')}</span>
      <Badge variant="secondary" className="text-xs ml-auto">{log.source}</Badge>
    </div>
  )
}

/* ─── Event Row Component ─── */
export function EventRow({
  event,
}: {
  event: { id: string; eventName: string; entityType: string; entityId: string; actorType: 'user' | 'agent' | 'system'; timestamp: string }
}) {
  const ActorIcon = event.actorType === 'user' ? User : event.actorType === 'agent' ? Robot : Gear
  const entityVariant: Record<string, 'lead' | 'deal' | 'inventory' | 'approval'> = { lead: 'lead', deal: 'deal', inventory: 'inventory', approval: 'approval' }
  return (
    <div className="flex items-center gap-4 py-2 text-sm border-b border-border last:border-0 hover:bg-accent/10 transition-colors">
      <span className="text-xs text-muted-foreground whitespace-nowrap w-36">{new Date(event.timestamp).toLocaleString()}</span>
      <StatusPill variant="info" dot={false} className="whitespace-nowrap">{event.eventName.replace(/_/g, ' ')}</StatusPill>
      <EntityBadge variant={entityVariant[event.entityType] ?? 'lead'}>{event.entityType}</EntityBadge>
      <span className="font-mono text-xs text-muted-foreground">{event.entityId}</span>
      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"><ActorIcon className="h-3.5 w-3.5" />{event.actorType}</div>
    </div>
  )
}

/* ─── Entity Event Timeline ─── */
export function EntityEventTimeline({
  events,
  title = 'Activity Timeline',
}: {
  events: Array<{ id: string; eventName: string; entityType: string; entityId: string; actorType: 'user' | 'agent' | 'system'; timestamp: string }>
  title?: string
}) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No events recorded.</p></CardContent>
      </Card>
    )
  }

  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-0">
          {sorted.map(evt => <EventRow key={evt.id} event={evt} />)}
        </div>
      </CardContent>
    </Card>
  )
}
