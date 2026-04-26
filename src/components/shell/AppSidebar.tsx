import {
  House,
  UsersThree,
  ClipboardText,
  Gauge,
  Gear,
  ChartBar,
  Wrench,
  CurrencyDollar,
  Kanban,
  UploadSimple,
  Robot,
  Brain,
  Car,
  FolderOpen,
  BookOpen,
  Intersect,
  CalendarBlank,
  CheckSquare,
  TrendUp,
  Buildings,
  Key,
  Toolbox,
  WarningDiamond,
  ChartLine,
} from '@phosphor-icons/react'
import { AppRole, ROLE_NAV_GROUPS, type NavGroup } from '@/domains/roles/roles'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; weight?: string }>
  group: NavGroup
  badge?: number
  badgeColor?: 'red' | 'blue' | 'orange' | 'green'
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Control Center', href: '/app/dashboard', icon: House, group: 'dashboard' },
  { label: 'Workstation', href: '/app/workstation', icon: Kanban, group: 'workstation' },
  { label: 'Leads', href: '/app/records/leads', icon: ClipboardText, group: 'records', badge: 12, badgeColor: 'red' },
  { label: 'Customers', href: '/app/records/households', icon: UsersThree, group: 'records' },
  { label: 'Inventory', href: '/app/records/inventory', icon: Car, group: 'records', badge: 147, badgeColor: 'blue' },
  { label: 'Deals', href: '/app/records/deals', icon: CurrencyDollar, group: 'records', badge: 8, badgeColor: 'orange' },
  { label: 'Finance', href: '/app/finance/match-engine', icon: Intersect, group: 'finance' },
  { label: 'Calendar', href: '/app/ops/events', icon: CalendarBlank, group: 'operations' },
  { label: 'Tasks', href: '/app/workstation', icon: CheckSquare, group: 'workstation', badge: 5, badgeColor: 'orange' },
  { label: 'Reports', href: '/app/ops/reports', icon: ChartBar, group: 'operations' },
  { label: 'AI Copilot', href: '/app/ops/assistant', icon: Robot, group: 'operations' },
  { label: 'Settings', href: '/app/settings/roles', icon: Gear, group: 'settings' },
  { label: 'Credit Apps', href: '/app/records/credit-applications', icon: ClipboardText, group: 'records' },
  { label: 'Approvals', href: '/app/ops/approvals', icon: ClipboardText, group: 'operations' },
  { label: 'Intelligence', href: '/app/ops/intelligence', icon: Brain, group: 'operations' },
  { label: 'Operating Review', href: '/app/ops/operating-review', icon: WarningDiamond, group: 'operations' },
  { label: 'Recon / Fixed Ops', href: '/app/ops/recon', icon: Toolbox, group: 'operations' },
  { label: 'Key Control', href: '/app/ops/key-control', icon: Key, group: 'operations' },
  { label: 'Back Office', href: '/app/ops/back-office', icon: Buildings, group: 'operations' },
  { label: 'Document Vault', href: '/app/ops/documents', icon: FolderOpen, group: 'operations' },
  { label: 'Audit', href: '/app/ops/audit', icon: Wrench, group: 'operations' },
  { label: 'Manage Inventory', href: '/app/settings/inventory-manage', icon: Gauge, group: 'settings' },
  { label: 'Inventory Import', href: '/app/settings/inventory-import', icon: UploadSimple, group: 'settings' },
  { label: 'CRM Import', href: '/app/settings/crm-import', icon: UploadSimple, group: 'settings' },
  { label: 'Playbook', href: '/app/playbook', icon: BookOpen, group: 'playbook' },
  { label: 'Program Library', href: '/app/finance/program-library', icon: BookOpen, group: 'finance' },
]

const PRIMARY_NAV = [
  '/app/dashboard',
  '/app/workstation',
  '/app/records/leads',
  '/app/records/households',
  '/app/records/inventory',
  '/app/records/deals',
  '/app/finance/match-engine',
  '/app/ops/events',
  '/app/ops/reports',
  '/app/ops/assistant',
  '/app/settings/roles',
]

const BADGE_STYLES: Record<string, string> = {
  red: 'bg-red-600 text-white',
  blue: 'bg-blue-600 text-white',
  orange: 'bg-orange-500 text-white',
  green: 'bg-emerald-600 text-white',
}

interface AppSidebarProps {
  currentPath: string
  currentRole: AppRole
  onNavigate: (path: string) => void
}

export function AppSidebar({ currentPath, currentRole, onNavigate }: AppSidebarProps) {
  const allowedGroups = ROLE_NAV_GROUPS[currentRole]
  const visibleItems = NAV_ITEMS.filter((item) => allowedGroups.includes(item.group))
  const primaryItems = visibleItems.filter(i => PRIMARY_NAV.includes(i.href))
  const secondaryItems = visibleItems.filter(i => !PRIMARY_NAV.includes(i.href))

  return (
    <div
      className="flex h-screen w-60 flex-col"
      style={{
        background: 'linear-gradient(180deg, #0a0c14 0%, #070910 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-14 items-center px-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #c01818, #e83232)',
              boxShadow: '0 0 12px rgba(223,36,36,0.5)',
            }}
          >
            <span className="text-white text-xs font-black tracking-tight">OS</span>
          </div>
          <div>
            <div className="text-[0.78rem] font-bold tracking-wide text-white/90 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              OUTCOME
            </div>
            <div className="text-[0.62rem] font-semibold tracking-[0.12em] text-white/40 uppercase leading-tight">
              Dealer OS
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/10">
        {primaryItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href || (item.href !== '/app/dashboard' && currentPath.startsWith(item.href + '/'))

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-all duration-200 relative',
                isActive
                  ? 'ods-active-nav text-red-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/4'
              )}
              style={isActive ? {
                background: 'linear-gradient(90deg, rgba(223,36,36,0.18) 0%, rgba(223,36,36,0.04) 100%)',
                borderLeft: '2px solid #df2424',
                boxShadow: 'inset 0 0 20px rgba(223,36,36,0.06)',
                paddingLeft: '10px',
              } : { paddingLeft: '12px' }}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-red-400' : 'text-white/40')} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && (
                <span className={cn(
                  'flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[0.6rem] font-bold tabular-nums',
                  item.badgeColor ? BADGE_STYLES[item.badgeColor] : 'bg-white/15 text-white/70'
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        {secondaryItems.length > 0 && (
          <>
            <div className="mx-3 my-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            {secondaryItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-[0.78rem] font-medium transition-all duration-200',
                    isActive
                      ? 'text-red-400'
                      : 'text-white/35 hover:text-white/60 hover:bg-white/4'
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(90deg, rgba(223,36,36,0.15) 0%, transparent 100%)',
                    borderLeft: '2px solid #df2424',
                    paddingLeft: '10px',
                  } : { paddingLeft: '12px' }}
                >
                  <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-red-400' : 'text-white/30')} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom brand/status card */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="rounded-lg p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(223,36,36,0.12) 0%, rgba(44,105,255,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[0.68rem] font-semibold text-white/60 uppercase tracking-wide">System Live</span>
          </div>
          <div className="text-[0.72rem] text-white/40 leading-relaxed">
            National Car Mart<br />
            <span className="capitalize">{currentRole}</span> · All systems operational
          </div>
        </div>
      </div>
    </div>
  )
}

