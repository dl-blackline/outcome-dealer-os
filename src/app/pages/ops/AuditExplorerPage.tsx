import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { EntityBadge } from '@/components/core/EntityBadge'
import { Badge } from '@/components/ui/badge'
import { ScrollText } from '@phosphor-icons/react'

const MOCK_AUDIT_LOGS = [
  { id: 'aud-001', userId: 'user-01', userRole: 'sales_rep', entityType: 'lead', entityId: 'lead-003', action: 'lead_created', source: 'system', timestamp: '2025-01-16T09:15:00Z' },
  { id: 'aud-002', userId: 'user-01', userRole: 'sales_rep', entityType: 'lead', entityId: 'lead-003', action: 'lead_score_updated', source: 'agent', timestamp: '2025-01-16T09:15:30Z' },
  { id: 'aud-003', userId: 'user-02', userRole: 'sales_manager', entityType: 'deal', entityId: 'deal-002', action: 'desk_scenario_created', source: 'user', timestamp: '2025-01-15T11:50:00Z' },
  { id: 'aud-004', userId: 'user-03', userRole: 'fi_manager', entityType: 'approval', entityId: 'app-002', action: 'approval_granted', source: 'user', timestamp: '2025-01-15T16:10:00Z' },
  { id: 'aud-005', userId: 'user-01', userRole: 'sales_rep', entityType: 'deal', entityId: 'deal-001', action: 'deal_signed', source: 'user', timestamp: '2025-01-14T17:30:00Z' },
  { id: 'aud-006', userRole: 'system', entityType: 'deal', entityId: 'deal-001', action: 'deal_funded', source: 'system', timestamp: '2025-01-14T18:45:00Z' },
]

const ENTITY_VARIANT: Record<string, 'lead' | 'deal' | 'approval'> = { lead: 'lead', deal: 'deal', approval: 'approval' }

export function AuditExplorerPage() {
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const entities = ['all', ...new Set(MOCK_AUDIT_LOGS.map(a => a.entityType))]
  const filtered = MOCK_AUDIT_LOGS.filter(a => entityFilter === 'all' || a.entityType === entityFilter)

  return (
    <div className="space-y-6">
      <SectionHeader title="Audit Log" description="Immutable record of system actions" action={<div className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">{MOCK_AUDIT_LOGS.length} entries</span></div>} />
      <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize">
        {entities.map(e => <option key={e} value={e}>{e === 'all' ? 'All entities' : e}</option>)}
      </select>
      <Card><CardContent className="p-0">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Entity</th>
              <th className="px-4 py-3 text-left font-medium">Entity ID</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Source</th>
            </tr></thead>
            <tbody>{filtered.map(log => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-xs capitalize">{log.userRole.replace(/_/g, ' ')}</Badge></td>
                <td className="px-4 py-3"><EntityBadge variant={ENTITY_VARIANT[log.entityType] ?? 'lead'}>{log.entityType}</EntityBadge></td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.entityId}</td>
                <td className="px-4 py-3 text-sm">{log.action.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{log.source}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  )
}
