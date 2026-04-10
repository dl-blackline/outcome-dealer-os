import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Badge } from '@/components/ui/badge'
import { PlugsConnected, ArrowClockwise, Warning } from '@phosphor-icons/react'

const MOCK_INTEGRATIONS = [
  { id: 'int-001', name: 'Dealer Management System', type: 'dms', status: 'healthy' as const, lastSync: '2025-01-16T13:00:00Z', errorCount: 0 },
  { id: 'int-002', name: 'Credit Bureau API', type: 'credit_bureau', status: 'healthy' as const, lastSync: '2025-01-16T12:45:00Z', errorCount: 0 },
  { id: 'int-003', name: 'Lender Portal', type: 'lender_portal', status: 'degraded' as const, lastSync: '2025-01-16T10:00:00Z', errorCount: 3 },
  { id: 'int-004', name: 'Marketing Platform', type: 'marketing', status: 'healthy' as const, lastSync: '2025-01-16T08:00:00Z', errorCount: 0 },
]

const STATUS_VARIANT = { healthy: 'success' as const, degraded: 'warning' as const, failed: 'danger' as const, recovering: 'info' as const }

export function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Integrations" description="External system connections and sync status" />
      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_INTEGRATIONS.map(int => (
          <Card key={int.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base"><PlugsConnected className="h-5 w-5" />{int.name}</CardTitle>
                <StatusPill variant={STATUS_VARIANT[int.status]}>{int.status}</StatusPill>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize text-xs">{int.type.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="flex items-center gap-1 text-xs"><ArrowClockwise className="h-3.5 w-3.5" />{new Date(int.lastSync).toLocaleString()}</span>
              </div>
              {int.errorCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-amber-600"><Warning className="h-4 w-4" />{int.errorCount} errors in last 24h</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
