import {
  House,
  UsersThree,
  ClipboardText,
  Gauge,
  Gear,
  ChartLine,
  ChartBar,
  Wrench,
  CurrencyDollar,
  Kanban,
  UploadSimple,
  Robot,
  Brain,
  Car,
  WarningDiamond,
  Buildings,
  FolderOpen,
  Toolbox,
  Key,
  BookOpen,
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
    label: 'Operating Review',
    href: '/app/ops/operating-review',
    icon: WarningDiamond,
    group: 'operations',
  },
  {
    label: 'Fixed Ops / Recon',
    href: '/app/ops/recon',
    icon: Toolbox,
    group: 'operations',
  },
  {
    label: 'Key Control',
    href: '/app/ops/key-control',
    icon: Key,
    group: 'operations',
  },
  {
    label: 'Back Office',
    href: '/app/ops/back-office',
    icon: Buildings,
    group: 'operations',
  },
  {
    label: 'Document Vault',
    href: '/app/ops/documents',
    icon: FolderOpen,
    group: 'operations',
  },
  {
    label: 'Reports',
    href: '/app/ops/reports',
    icon: ChartBar,
    group: 'operations',
  },
  {
    label: 'Settings',
    href: '/app/settings/roles',
    icon: Gear,
    group: 'settings',
  },
  {
    label: 'Manage Inventory',
    href: '/app/settings/inventory-manage',
    icon: Car,
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
  {
    label: 'Playbook',
    href: '/app/playbook',
    icon: BookOpen,
    group: 'playbook',
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
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-[0.92rem] font-bold tracking-[0.04em] text-sidebar-foreground/90" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Outcome Dealer OS
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 p-4 [scrollbar-gutter:stable]">
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
                  ? 'bg-sidebar-accent text-sidebar-primary ring-1 ring-sidebar-primary/30'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="text-xs text-sidebar-foreground/50">
          Logged in as {currentRole}
        </div>
      </div>
    </div>
  )
}
