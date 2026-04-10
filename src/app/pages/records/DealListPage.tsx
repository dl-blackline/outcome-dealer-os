import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function DealListPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Deals"
        description="Track and manage all deal records"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Deal list view coming soon. This will display all deals with status, amounts, and vehicle details.
        </CardContent>
      </Card>
    </div>
  )
}
