import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Integrations"
        description="Manage third-party integrations and sync status"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Integrations settings coming soon. This will show connected systems, sync status, and configuration.
        </CardContent>
      </Card>
    </div>
  )
}
