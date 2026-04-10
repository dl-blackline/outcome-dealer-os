import { useState, useCallback } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlugsConnected, ArrowClockwise, Warning, CheckCircle } from '@phosphor-icons/react'

interface Integration {
  id: string
  name: string
  type: string
  status: 'healthy' | 'degraded' | 'failed' | 'recovering'
  lastSync: string
  errorCount: number
  description: string
}

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int-001', name: 'Dealer Management System', type: 'dms', status: 'healthy', lastSync: '2025-01-16T13:00:00Z', errorCount: 0, description: 'Core DMS data sync — inventory, customer records, and deal data' },
  { id: 'int-002', name: 'Credit Bureau API', type: 'credit_bureau', status: 'healthy', lastSync: '2025-01-16T12:45:00Z', errorCount: 0, description: 'Real-time credit pulls and bureau reporting' },
  { id: 'int-003', name: 'Lender Portal', type: 'lender_portal', status: 'degraded', lastSync: '2025-01-16T10:00:00Z', errorCount: 3, description: 'Lender decision submission and funding status' },
  { id: 'int-004', name: 'Marketing Platform', type: 'marketing', status: 'healthy', lastSync: '2025-01-16T08:00:00Z', errorCount: 0, description: 'Campaign attribution and lead source tracking' },
  { id: 'int-005', name: 'Telephony System', type: 'telephony', status: 'healthy', lastSync: '2025-01-16T14:00:00Z', errorCount: 0, description: 'Call recording, transcription, and caller ID enrichment' },
]

const STATUS_VARIANT = { healthy: 'success' as const, degraded: 'warning' as const, failed: 'danger' as const, recovering: 'info' as const }

export function IntegrationsSettingsPage() {
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleSync = useCallback((id: string) => {
    setSyncing(id)
    setTimeout(() => setSyncing(null), 1500)
  }, [])

  const healthyCount = MOCK_INTEGRATIONS.filter(i => i.status === 'healthy').length
  const totalCount = MOCK_INTEGRATIONS.length

  return (
    <div className="space-y-6">
      <SectionHeader title="Integrations" description="External system connections and sync status" />

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">{healthyCount} of {totalCount} integrations healthy</p>
              <p className="text-xs text-muted-foreground">
                {totalCount - healthyCount > 0 ? `${totalCount - healthyCount} requiring attention` : 'All systems operational'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_INTEGRATIONS.map(int => (
          <Card key={int.id} className={int.status !== 'healthy' ? 'border-yellow-500/20' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base"><PlugsConnected className="h-5 w-5" />{int.name}</CardTitle>
                <StatusPill variant={STATUS_VARIANT[int.status]}>{int.status}</StatusPill>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{int.description}</p>
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
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleSync(int.id)}
                disabled={syncing === int.id}
              >
                <ArrowClockwise className={`h-4 w-4 ${syncing === int.id ? 'animate-spin' : ''}`} />
                {syncing === int.id ? 'Syncing…' : 'Sync Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
