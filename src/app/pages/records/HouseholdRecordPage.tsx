import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from '@/app/router'

export function HouseholdRecordPage() {
  const { params } = useRouter()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Household"
        description={`Viewing household record ${params.id ?? ''}`}
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Household detail view coming soon. Record ID: {params.id ?? 'unknown'}
        </CardContent>
      </Card>
    </div>
  )
}
