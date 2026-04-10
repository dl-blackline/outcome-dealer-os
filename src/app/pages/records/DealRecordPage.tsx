import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from '@/app/router'

export function DealRecordPage() {
  const { params } = useRouter()

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Deal"
        description={`Viewing deal record ${params.id ?? ''}`}
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Deal detail view coming soon. Record ID: {params.id ?? 'unknown'}
        </CardContent>
      </Card>
    </div>
  )
}
