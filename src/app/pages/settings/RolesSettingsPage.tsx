import { useState } from 'react'
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
        <nav
          className="shrink-0 w-52 rounded-xl p-2 space-y-0.5"
          style={{ ...PANEL_STYLE, alignSelf: 'flex-start' }}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest px-3 pt-2 pb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Settings
          </p>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeNav === id
            return (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all text-left rounded-lg relative overflow-hidden"
                style={isActive ? {
                  background: 'linear-gradient(90deg, rgba(227,24,55,0.15) 0%, rgba(227,24,55,0.05) 100%)',
                  color: '#fff',
                  borderLeft: '2px solid #e31837',
                  paddingLeft: '10px',
                } : {
                  color: 'rgba(255,255,255,0.4)',
                  borderLeft: '2px solid transparent',
                  paddingLeft: '10px',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'
                }}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: isActive ? '#e31837' : 'inherit' }}
                />
                {label}
              </button>
            )
          })}
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
                                 <span
                                   key={p}
                                   className="text-[0.67rem] px-2 py-0.5 rounded font-medium"
                                   style={{ background: 'rgba(44,105,255,0.12)', color: '#93c5fd', border: '1px solid rgba(44,105,255,0.2)' }}
                                 >
                                   {p.replace(/_/g, ' ')}
                                 </span>
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

          {activeNav === 'general' && (
            <div className="space-y-4">
              <div style={PANEL_STYLE} className="p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Dealership Information</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Dealership Name', placeholder: 'National Car Mart', type: 'text' },
                    { label: 'DBA / Trade Name', placeholder: 'NCM Auto Group', type: 'text' },
                    { label: 'Dealer License #', placeholder: 'DL-2024-00193', type: 'text' },
                    { label: 'Website URL', placeholder: 'https://nationalcarmart.com', type: 'url' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full rounded-lg px-3 py-2.5 text-sm text-white/80 outline-none transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div style={PANEL_STYLE} className="p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Regional Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Timezone', options: ['America/Chicago', 'America/New_York', 'America/Los_Angeles', 'America/Denver'] },
                    { label: 'Currency', options: ['USD — US Dollar', 'CAD — Canadian Dollar', 'EUR — Euro'] },
                    { label: 'Date Format', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                    { label: 'Distance Unit', options: ['Miles', 'Kilometers'] },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.label}</label>
                      <select
                        className="w-full rounded-lg px-3 py-2.5 text-sm text-white/70 outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                  style={{ background: 'linear-gradient(135deg, #e31837, #a01228)' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeNav === 'notifications' && (
            <div style={PANEL_STYLE} className="p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Notification Preferences</h3>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Configure when and how you receive system alerts</p>
              <div className="space-y-1">
                {[
                  { label: 'New lead assigned', desc: 'Notify when a lead is routed to you', on: true },
                  { label: 'Deal approved / declined', desc: 'Updates on deal desk decisions', on: true },
                  { label: 'Aged unit alerts', desc: 'Units approaching 30, 45, 60 day thresholds', on: true },
                  { label: 'Appointment reminders', desc: '1 hour before scheduled appointments', on: false },
                  { label: 'Finance deal funded', desc: 'Confirmation when lender funds a deal', on: true },
                  { label: 'Daily digest', desc: 'Morning summary of previous day performance', on: false },
                  { label: 'AI Copilot suggestions', desc: 'Proactive AI recommendations for your pipeline', on: true },
                  { label: 'System maintenance', desc: 'Scheduled downtime and update notices', on: false },
                ].map(n => (
                  <div
                    key={n.label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div>
                      <p className="text-sm font-medium text-white/80">{n.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{n.desc}</p>
                    </div>
                    <button
                      className="relative h-6 w-11 rounded-full transition-colors shrink-0"
                      style={{ background: n.on ? '#e31837' : 'rgba(255,255,255,0.12)' }}
                    >
                      <span
                        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                        style={{ left: n.on ? '22px' : '2px' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav !== 'roles' && activeNav !== 'general' && activeNav !== 'notifications' && (
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
