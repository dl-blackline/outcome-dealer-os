import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from '@/app/router'

export function InventoryUnitPage() {
  const { params } = useRouter()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Inventory Unit"
        description={`Viewing inventory unit ${params.id ?? ''}`}
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Inventory unit detail view coming soon. Unit ID: {params.id ?? 'unknown'}
        </CardContent>
      </Card>
    </div>
  )
}
