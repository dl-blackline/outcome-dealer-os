import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function EventExplorerPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Events"
        description="Explore system events and activity streams"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Event explorer coming soon. This will show a timeline of all system events with filtering and search.
        </CardContent>
      </Card>
    </div>
  )
}
