import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function HouseholdListPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Households"
        description="View and manage all household records"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Household list view coming soon. This will display all household records with search and filters.
        </CardContent>
      </Card>
    </div>
  )
}
