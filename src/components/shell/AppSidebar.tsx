import {
  House,
  UsersThree,
  ClipboardText,
  Gauge,
  Gear,
  ChartLine,
  Wrench,
  CurrencyDollar,
  Kanban,
  UploadSimple,
  Robot,
  Brain,
} from '@phosphor-icons/react'
import { AppRole, ROLE_NAV_GROUPS, type NavGroup } from '@/domains/roles/roles'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  group: NavGroup
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: House,
    group: 'dashboard',
  },
  {
    label: 'Workstation',
    href: '/app/workstation',
    icon: Kanban,
    group: 'workstation',
  },
  {
    label: 'Households',
    href: '/app/records/households',
    icon: UsersThree,
    group: 'records',
  },
  {
    label: 'Leads',
    href: '/app/records/leads',
    icon: ClipboardText,
    group: 'records',
  },
  {
    label: 'Credit Apps',
    href: '/app/records/credit-applications',
    icon: ClipboardText,
    group: 'records',
  },
  {
    label: 'Deals',
    href: '/app/records/deals',
    icon: CurrencyDollar,
    group: 'records',
  },
  {
    label: 'Inventory',
    href: '/app/records/inventory',
    icon: Gauge,
    group: 'records',
  },
  {
    label: 'Events',
    href: '/app/ops/events',
    icon: ChartLine,
    group: 'operations',
  },
  {
    label: 'Approvals',
    href: '/app/ops/approvals',
    icon: ClipboardText,
    group: 'operations',
  },
  {
    label: 'Audit',
    href: '/app/ops/audit',
    icon: Wrench,
    group: 'operations',
  },
  {
    label: 'Assistant Ops',
    href: '/app/ops/assistant',
    icon: Robot,
    group: 'operations',
  },
  {
    label: 'Intelligence',
    href: '/app/ops/intelligence',
    icon: Brain,
    group: 'operations',
  },
  {
    label: 'Settings',
    href: '/app/settings/roles',
    icon: Gear,
    group: 'settings',
  },
  {
    label: 'Inventory Import',
    href: '/app/settings/inventory-import',
    icon: UploadSimple,
    group: 'settings',
  },
  {
    label: 'CRM Import',
    href: '/app/settings/crm-import',
    icon: UploadSimple,
    group: 'settings',
  },
]

interface AppSidebarProps {
  currentPath: string
  currentRole: AppRole
  onNavigate: (path: string) => void
}

export function AppSidebar({ currentPath, currentRole, onNavigate }: AppSidebarProps) {
  const allowedGroups = ROLE_NAV_GROUPS[currentRole]
  const visibleItems = NAV_ITEMS.filter((item) => allowedGroups.includes(item.group))

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Outcome Dealer OS
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')
          
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          Logged in as {currentRole}
        </div>
      </div>
    </div>
  )
}
