import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function InventoryListPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Inventory"
        description="Browse and manage vehicle inventory"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Inventory list view coming soon. This will display all inventory units with aging, pricing, and status.
        </CardContent>
      </Card>
    </div>
  )
}
