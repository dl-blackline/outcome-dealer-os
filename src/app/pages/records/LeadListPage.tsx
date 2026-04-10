import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function LeadListPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leads"
        description="Track and manage all lead records"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Lead list view coming soon. This will display all leads with scoring, status, and assignment details.
        </CardContent>
      </Card>
    </div>
  )
}
