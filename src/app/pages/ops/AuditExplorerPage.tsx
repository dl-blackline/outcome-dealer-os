import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { EntityBadge } from '@/components/core/EntityBadge'
import { Badge } from '@/components/ui/badge'
import { useAuditLogs } from '@/domains/audit/audit.hooks'
import { Scroll, SpinnerGap } from '@phosphor-icons/react'

const ENTITY_VARIANT: Record<string, 'lead' | 'deal' | 'approval'> = { lead: 'lead', deal: 'deal', approval: 'approval' }

export function AuditExplorerPage() {
  const auditLogs = useAuditLogs()
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const entities = ['all', ...new Set(auditLogs.data.map(a => a.entityType))]
  const filtered = auditLogs.data.filter(a => entityFilter === 'all' || a.entityType === entityFilter)

  if (auditLogs.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Audit Log" description="Immutable record of system actions" action={<div className="flex items-center gap-2"><Scroll className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">{auditLogs.data.length} entries</span></div>} />
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
