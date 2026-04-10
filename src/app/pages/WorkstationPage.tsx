import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function WorkstationPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Workstation"
        description="Your cross-department execution board"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Workstation view coming soon. This is your unified execution board across all departments.
        </CardContent>
      </Card>
    </div>
  )
}
