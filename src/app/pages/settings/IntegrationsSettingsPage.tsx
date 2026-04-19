import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Badge } from '@/components/ui/badge'
import { useIntegrations } from '@/domains/integrations/integration.hooks'
import { PlugsConnected, ArrowClockwise, Warning, SpinnerGap, Info } from '@phosphor-icons/react'

const STATUS_VARIANT = { healthy: 'success' as const, degraded: 'warning' as const, failed: 'danger' as const, recovering: 'info' as const }

const INTEGRATION_NOTES: Record<string, string> = {
  dms: 'Primary system of record for deal and inventory data. Two-way sync.',
  credit_bureau: 'Pull-only integration for credit checks. No write-back.',
  lender_portal: 'Submit credit apps and receive lender decisions. Status alerts on sync failures.',
  marketing: 'Campaign attribution and lead source tracking. One-way inbound.',
}

export function IntegrationsSettingsPage() {
  const integrations = useIntegrations()

  if (integrations.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Integrations" description="External system connections and sync status" />

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Integration Runtime</p>
            <p className="text-muted-foreground mt-1">
              Integrations are managed through the sync state engine in <code className="text-xs bg-muted px-1 py-0.5 rounded">src/domains/integrations/</code>.
              Sync state, error counts, and backoff are tracked per object.
              Status shown here reflects the most recent sync attempt per integration.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.data.map(int => (
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
              {INTEGRATION_NOTES[int.type] && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">{INTEGRATION_NOTES[int.type]}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Sync Architecture</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Each integration tracks sync state per-object with exponential backoff on failures.</p>
          <p>When an integration enters <StatusPill variant="danger" dot={false} className="text-xs inline">failed</StatusPill> state after 5+ consecutive errors, it triggers a <code className="text-xs bg-muted px-1 py-0.5 rounded">integration_sync_failed</code> event and auto-generates a workstation card for the operations team.</p>
          <p>Recovery triggers an <code className="text-xs bg-muted px-1 py-0.5 rounded">integration_sync_recovered</code> event.</p>
        </CardContent>
      </Card>
    </div>
  )
}
