import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { ReferenceHero } from '@/components/core/ReferenceHero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APP_ROLES, ROLE_LABELS, ROLE_NAV_GROUPS } from '@/domains/roles/roles'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'
import { CaretRight, CaretDown, ShieldCheck, Info } from '@phosphor-icons/react'
import { MOCKUP_REFERENCES } from '@/app/mockupReferences'

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'Full operational visibility and control. Access to all settings, approvals, and business intelligence.',
  gm: 'Manages all departments. Full access to records, operations, and settings.',
  gsm: 'Oversees sales floor operations. Manages sales team, deal approvals, and pipeline.',
  used_car_manager: 'Manages pre-owned inventory, trade appraisals, and aging strategy.',
  bdc_manager: 'Manages business development center. Lead routing and appointment scheduling.',
  sales_manager: 'Desk deals, approve trade values and pricing. Manages sales team workflow.',
  sales_rep: 'Works leads and deals. Limited to own records and workstation.',
  fi_manager: 'Manages F&I products, lending submissions, and financial approvals.',
  service_director: 'Oversees service department. Access to service records and recon management.',
  service_advisor: 'Customer-facing service role. Manages service appointments and work orders.',
  recon_manager: 'Manages vehicle reconditioning workflow and vendor coordination.',
  marketing_manager: 'Manages marketing campaigns, lead source attribution, and prospect engagement.',
  admin: 'System administrator. Full access to settings, roles, and integrations.',
}

export function RolesSettingsPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Roles & Permissions" description="View role definitions and permission assignments" />
      <ReferenceHero reference={MOCKUP_REFERENCES.settingsAdmin} />

      <section className="rounded-2xl border border-white/15 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-4 shadow-[0_22px_70px_rgba(2,6,23,0.42)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-blue-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Configured Roles</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{APP_ROLES.length}</p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Total Permissions</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{Object.values(ROLE_PERMISSIONS).reduce((sum, list) => sum + list.length, 0)}</p>
          </div>
          <div className="rounded-xl border border-violet-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Navigation Groups</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{new Set(Object.values(ROLE_NAV_GROUPS).flat()).size}</p>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Expanded Role</p>
            <p className="mt-1 text-lg font-bold uppercase tracking-[0.08em] text-slate-50">{expandedRole ? ROLE_LABELS[expandedRole as keyof typeof ROLE_LABELS] : 'None'}</p>
          </div>
        </div>
      </section>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Role-Based Access Control</p>
            <p className="text-muted-foreground mt-1">
              {APP_ROLES.length} roles defined with separation of duties. Roles determine navigation access, record permissions, and approval authority.
              Permission assignments are enforced at the routing and service layers.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {APP_ROLES.map(role => {
          const perms = ROLE_PERMISSIONS[role]
          const navGroups = ROLE_NAV_GROUPS[role]
          const expanded = expandedRole === role
          return (
            <Card key={role} className={expanded ? 'ring-1 ring-primary/30' : ''}>
              <CardContent className="p-0">
                <button onClick={() => setExpandedRole(expanded ? null : role)} className="flex w-full items-center justify-between p-4 text-left hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ROLE_LABELS[role]}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role] ?? role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{perms.length} permissions</Badge>
                    {expanded ? <CaretDown className="h-4 w-4" /> : <CaretRight className="h-4 w-4" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-border px-4 py-3 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Navigation Access</p>
                      <div className="flex flex-wrap gap-1.5">
                        {navGroups.map(g => (
                          <Badge key={g} variant="outline" className="text-xs capitalize">{g}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Permissions</p>
                      <div className="flex flex-wrap gap-1.5">{perms.map(p => (
                        <Badge key={p} variant="outline" className="text-xs">{p.replace(/_/g, ' ')}</Badge>
                      ))}</div>
                    </div>
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
