import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APP_ROLES, ROLE_LABELS } from '@/domains/roles/roles'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'
import { CaretRight, CaretDown, ShieldCheck } from '@phosphor-icons/react'

export function RolesSettingsPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <SectionHeader title="Roles & Permissions" description="View role definitions and permission assignments (read-only)" />
      <div className="space-y-2">
        {APP_ROLES.map(role => {
          const perms = ROLE_PERMISSIONS[role]
          const expanded = expandedRole === role
          return (
            <Card key={role} className={expanded ? 'ring-1 ring-primary/30' : ''}>
              <CardContent className="p-0">
                <button onClick={() => setExpandedRole(expanded ? null : role)} className="flex w-full items-center justify-between p-4 text-left hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div><p className="font-medium">{ROLE_LABELS[role]}</p><p className="text-xs text-muted-foreground">{role}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{perms.length} permissions</Badge>
                    {expanded ? <CaretDown className="h-4 w-4" /> : <CaretRight className="h-4 w-4" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-border px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">{perms.map(p => (
                      <Badge key={p} variant="outline" className="text-xs">{p.replace(/_/g, ' ')}</Badge>
                    ))}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
