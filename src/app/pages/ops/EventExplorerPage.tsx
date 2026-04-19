import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { StatusPill } from '@/components/core/StatusPill'
import { EntityBadge } from '@/components/core/EntityBadge'
import { Card, CardContent } from '@/components/ui/card'
import { useEvents } from '@/domains/events/event.hooks'
import { Lightning, User, Robot, Gear, SpinnerGap } from '@phosphor-icons/react'

const ACTOR_ICON = { user: User, agent: Robot, system: Gear }
const ENTITY_VARIANT: Record<string, 'lead' | 'deal' | 'inventory' | 'approval'> = { lead: 'lead', deal: 'deal', inventory: 'inventory', approval: 'approval' }

const WARNING_EVENTS = ['appointment_no_show', 'funding_missing_item', 'lender_declined', 'integration_sync_failed', 'unit_hit_aging_threshold', 'wholesale_recommended', 'service_customer_declined_work']
const SUCCESS_EVENTS = ['deal_funded', 'approval_granted', 'vehicle_delivered', 'deal_signed', 'unit_frontline_ready', 'integration_sync_recovered']

function eventSeverityVariant(eventName: string): 'warning' | 'success' | 'info' {
  if (WARNING_EVENTS.includes(eventName)) return 'warning'
  if (SUCCESS_EVENTS.includes(eventName)) return 'success'
  return 'info'
}

export function EventExplorerPage() {
  const events = useEvents()
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [actorFilter, setActorFilter] = useState<string>('all')
  const entities = ['all', ...new Set(events.data.map(e => e.entityType))]
  const actors = ['all', 'user', 'agent', 'system']
  const sorted = [...events.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const filtered = sorted.filter(e => (entityFilter === 'all' || e.entityType === entityFilter) && (actorFilter === 'all' || e.actorType === actorFilter))

  if (events.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader title="Event Stream" description="Real-time event log for the operating system" action={<div className="flex items-center gap-2"><Lightning className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">{events.data.length} events</span></div>} />
      <div className="flex items-center gap-3">
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize">
          {entities.map(e => <option key={e} value={e}>{e === 'all' ? 'All entities' : e}</option>)}
        </select>
        <select value={actorFilter} onChange={e => setActorFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize">
          {actors.map(a => <option key={a} value={a}>{a === 'all' ? 'All actors' : a}</option>)}
        </select>
      </div>
      <Card><CardContent className="p-0">
        <div className="divide-y divide-border">
          {filtered.map(evt => {
            const ActorIcon = ACTOR_ICON[evt.actorType] ?? Gear
            const severity = eventSeverityVariant(evt.eventName)
            return (
              <div key={evt.id} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/20 transition-colors">
                <span className="text-xs text-muted-foreground whitespace-nowrap w-36">{new Date(evt.timestamp).toLocaleString()}</span>
                <StatusPill variant={severity} dot={false} className="whitespace-nowrap">{evt.eventName.replace(/_/g, ' ')}</StatusPill>
                <EntityBadge variant={ENTITY_VARIANT[evt.entityType] ?? 'lead'}>{evt.entityType}</EntityBadge>
                <span className="font-mono text-xs text-muted-foreground">{evt.entityId}</span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"><ActorIcon className="h-3.5 w-3.5" />{evt.actorType}</div>
              </div>
            )
          })}
        </div>
      </CardContent></Card>
    </div>
  )
}
