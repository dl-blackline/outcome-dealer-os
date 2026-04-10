import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APP_ROLES, ROLE_LABELS } from '@/domains/roles/roles'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'
import { useAuth } from '@/domains/auth/auth.store'
import { CaretRight, CaretDown, ShieldCheck, Star } from '@phosphor-icons/react'

export function RolesSettingsPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const { user } = useAuth()
  const currentRole = user?.role

  return (
    <div className="space-y-6">
      <SectionHeader title="Roles & Permissions" description="View role definitions and permission assignments" />

      {currentRole && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Current Role: <strong>{ROLE_LABELS[currentRole]}</strong></p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_PERMISSIONS[currentRole].length} permissions assigned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {APP_ROLES.map(role => {
          const perms = ROLE_PERMISSIONS[role]
          const expanded = expandedRole === role
          const isCurrentRole = role === currentRole
          return (
            <Card key={role} className={expanded ? 'ring-1 ring-primary/30' : isCurrentRole ? 'ring-1 ring-primary/20' : ''}>
              <CardContent className="p-0">
                <button onClick={() => setExpandedRole(expanded ? null : role)} className="flex w-full items-center justify-between p-4 text-left hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`h-5 w-5 ${isCurrentRole ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">
                        {ROLE_LABELS[role]}
                        {isCurrentRole && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
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

      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Role assignments are managed by the system administrator. Contact your GM or admin to request role changes.
        </CardContent>
      </Card>
    </div>
  )
}
