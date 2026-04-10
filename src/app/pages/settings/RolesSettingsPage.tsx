import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

export function RolesSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Roles"
        description="Configure roles and permissions"
      />
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Roles settings coming soon. This will allow configuration of role permissions and access levels.
        </CardContent>
      </Card>
    </div>
  )
}
