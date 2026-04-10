import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function ApprovalQueuePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Approvals"
        description="Review and resolve pending approval requests"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Approval queue coming soon. This will display pending approvals for trade values, financial outputs, and AI actions.
        </CardContent>
      </Card>
    </div>
  )
}
