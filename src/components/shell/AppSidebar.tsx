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
  { label: 'Leads', href: '/app/records/leads', icon: ClipboardText, group: 'records' },
  { label: 'Customers', href: '/app/records/households', icon: UsersThree, group: 'records' },
  { label: 'Inventory', href: '/app/records/inventory', icon: Car, group: 'records' },
  { label: 'Deals', href: '/app/records/deals', icon: CurrencyDollar, group: 'records' },
  { label: 'Finance', href: '/app/finance/match-engine', icon: Intersect, group: 'finance' },
  { label: 'Calendar', href: '/app/ops/events', icon: CalendarBlank, group: 'operations' },
  { label: 'Tasks', href: '/app/playbook/action-items', icon: CheckSquare, group: 'playbook' },
  { label: 'Analytics', href: '/app/ops/analytics', icon: ChartBar, group: 'operations' },
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
  '/app/ops/analytics',
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
        background: 'linear-gradient(180deg, #060709 0%, #07090C 100%)',
        borderRight: '1px solid rgba(192,195,199,0.07)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* Logo — National Car Mart */}
      <div
        className="flex h-16 items-center px-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(192,195,199,0.08)' }}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Shield emblem */}
          <div
            className="h-9 w-9 rounded flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1B1E23 0%, #0B0D10 100%)',
              border: '1px solid rgba(227,27,55,0.4)',
              boxShadow: '0 0 16px rgba(227,27,55,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Stars row */}
            <div className="absolute top-1 left-0 right-0 flex justify-center gap-0.5">
              {[0,1,2].map(i => (
                <div key={i} className="text-[5px] text-white/60">★</div>
              ))}
            </div>
            {/* NCM text */}
            <div className="flex flex-col items-center leading-none mt-1">
              <span className="text-[0.55rem] font-black tracking-widest text-white">NCM</span>
            </div>
            {/* Bottom stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg, #1E3A8A, #E31B37)' }} />
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-[0.72rem] font-bold tracking-[0.06em] text-white leading-tight truncate"
              style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif' }}
            >
              NATIONAL CAR MART
            </div>
            <div className="text-[0.58rem] font-semibold tracking-[0.14em] uppercase leading-tight mt-0.5" style={{ color: '#E31B37' }}>
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
              key={`${item.href}:${item.label}`}
              type="button"
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-[0.82rem] font-medium transition-all duration-150 relative',
                isActive
                  ? 'ods-active-nav text-white'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/4'
              )}
              style={isActive ? {
                background: 'linear-gradient(90deg, rgba(227,27,55,0.22) 0%, rgba(227,27,55,0.06) 100%)',
                borderLeft: '2px solid #E31B37',
                boxShadow: 'inset 0 0 20px rgba(227,27,55,0.06)',
                paddingLeft: '10px',
              } : { paddingLeft: '12px' }}
            >
              <Icon
                className={cn('h-4 w-4 shrink-0', isActive ? '' : 'text-white/35')}
                style={isActive ? { color: '#E31B37' } : {}}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge != null && (
                <span className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6rem] font-bold tabular-nums',
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
            <div className="mx-3 my-2.5" style={{ borderTop: '1px solid rgba(192,195,199,0.08)' }} />
            {secondaryItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
              return (
                <button
                  key={`${item.href}:${item.label}`}
                  type="button"
                  onClick={() => onNavigate(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-[0.78rem] font-medium transition-all duration-150',
                    isActive
                      ? 'text-white'
                      : 'text-white/30 hover:text-white/55 hover:bg-white/4'
                  )}
                  style={isActive ? {
                    background: 'linear-gradient(90deg, rgba(227,27,55,0.18) 0%, transparent 100%)',
                    borderLeft: '2px solid #E31B37',
                    paddingLeft: '10px',
                  } : { paddingLeft: '12px' }}
                >
                  <Icon
                    className={cn('h-3.5 w-3.5 shrink-0', isActive ? '' : 'text-white/25')}
                    style={isActive ? { color: '#E31B37' } : {}}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              )
            })}
          </>
        )}
      </nav>

      {/* Bottom brand/status card */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid rgba(192,195,199,0.08)' }}>
        <div
          className="rounded-md p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(227,27,55,0.10) 0%, rgba(30,58,138,0.08) 100%)',
            border: '1px solid rgba(192,195,199,0.09)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
            <span className="text-[0.65rem] font-semibold text-white/50 uppercase tracking-widest">Live</span>
          </div>
          <div className="text-[0.68rem] text-white/35 leading-relaxed">
            National Car Mart<br />
            <span className="capitalize text-white/45">{currentRole}</span> · Live data mode
          </div>
        </div>
      </div>
    </div>
  )
}
