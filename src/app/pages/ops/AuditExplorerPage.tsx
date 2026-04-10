import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function AuditExplorerPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Audit"
        description="Browse the complete audit log"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Audit explorer coming soon. This will provide a searchable audit trail of all system actions.
        </CardContent>
      </Card>
    </div>
  )
}
