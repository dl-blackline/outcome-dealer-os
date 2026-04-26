import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { APP_ROLES, ROLE_LABELS, ROLE_NAV_GROUPS } from '@/domains/roles/roles'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'
import {
  CaretRight, CaretDown, ShieldCheck, Info,
  Gear, UsersThree, Plugs, Target, Bell, Palette, Lock,
} from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
}

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

const NAV_ITEMS = [
  { id: 'general', label: 'General', Icon: Gear },
  { id: 'roles', label: 'Users & Roles', Icon: UsersThree },
  { id: 'integrations', label: 'Integrations', Icon: Plugs },
  { id: 'goals', label: 'Goals', Icon: Target },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'branding', label: 'Branding', Icon: Palette },
  { id: 'security', label: 'Security', Icon: Lock },
]

export function RolesSettingsPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('roles')

  return (
    <div className="ods-page ods-flow-lg">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings &amp; Admin</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          System configuration, roles, integrations, and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left Sub-Nav */}
        <nav className="shrink-0 w-48 space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={activeNav === id ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.2))',
                color: '#a5b4fc',
                boxShadow: '0 0 12px rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.3)',
              } : {
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeNav !== id) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'
              }}
              onMouseLeave={e => {
                if (activeNav !== id) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {activeNav === 'roles' && (
            <>
              {/* Info banner */}
              <div style={{ ...PANEL_STYLE, border: '1px solid rgba(99,102,241,0.2)' }} className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 shrink-0" style={{ color: '#818cf8' }} />
                <div>
                  <p className="text-sm font-medium text-white">Role-Based Access Control</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {APP_ROLES.length} roles defined with separation of duties. Roles determine navigation access, record permissions, and approval authority.
                    Permission assignments are enforced at the routing and service layers.
                  </p>
                </div>
              </div>

              {/* Roles list */}
              <div className="space-y-2">
                {APP_ROLES.map(role => {
                  const perms = ROLE_PERMISSIONS[role]
                  const navGroups = ROLE_NAV_GROUPS[role]
                  const expanded = expandedRole === role
                  return (
                    <div key={role} style={{ ...PANEL_STYLE, ...(expanded ? { border: '1px solid rgba(99,102,241,0.3)' } : {}) }}>
                      <button
                        onClick={() => setExpandedRole(expanded ? null : role)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors rounded-t-xl"
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
                      >
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5" style={{ color: expanded ? '#818cf8' : 'rgba(255,255,255,0.3)' }} />
                          <div>
                            <p className="font-medium text-sm text-white">{ROLE_LABELS[role]}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{ROLE_DESCRIPTIONS[role] ?? role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            {perms.length} permissions
                          </span>
                          {expanded
                            ? <CaretDown className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                            : <CaretRight className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                          }
                        </div>
                      </button>
                      {expanded && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-3 space-y-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Navigation Access
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {navGroups.map(g => (
                                <span
                                  key={g}
                                  className="text-xs px-2 py-0.5 rounded capitalize"
                                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Permissions
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {perms.map(p => (
                                <Badge key={p} variant="outline" className="text-xs">
                                  {p.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {activeNav !== 'roles' && (
            <div style={PANEL_STYLE} className="p-12 flex flex-col items-center justify-center text-center">
              {(() => {
                const item = NAV_ITEMS.find(n => n.id === activeNav)
                if (!item) return null
                const { Icon } = item
                return (
                  <>
                    <Icon className="h-10 w-10 mb-3" style={{ color: 'rgba(99,102,241,0.4)' }} />
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      This section is coming soon.
                    </p>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
