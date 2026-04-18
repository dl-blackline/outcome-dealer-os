import { useState } from 'react'
import { useRouter } from '@/app/router'
import { useAuth } from '@/domains/auth'
import { AppSidebar } from '@/components/shell/AppSidebar'
import { Topbar } from '@/components/shell/Topbar'
import { CommandPalette } from '@/components/shell/CommandPalette'
import { NotificationCenter } from '@/components/shell/NotificationCenter'
import { findMatchingRoute, matchRoute } from '@/app/router/router'
import { checkExecutiveGuard, checkPermissionGuard } from '@/app/routes/guards'

// Pages
import { DashboardPage } from '@/app/pages/DashboardPage'
import { WorkstationPage } from '@/app/pages/WorkstationPage'
import { HouseholdListPage } from '@/app/pages/records/HouseholdListPage'
import { HouseholdRecordPage } from '@/app/pages/records/HouseholdRecordPage'
import { LeadListPage } from '@/app/pages/records/LeadListPage'
import { LeadRecordPage } from '@/app/pages/records/LeadRecordPage'
import { CreditApplicationListPage } from '@/app/pages/records/CreditApplicationListPage'
import { CreditApplicationRecordPage } from '@/app/pages/records/CreditApplicationRecordPage'
import { DealListPage } from '@/app/pages/records/DealListPage'
import { DealRecordPage } from '@/app/pages/records/DealRecordPage'
import { InventoryListPage } from '@/app/pages/records/InventoryListPage'
import { InventoryUnitPage } from '@/app/pages/records/InventoryUnitPage'
import { EventExplorerPage } from '@/app/pages/ops/EventExplorerPage'
import { ApprovalQueuePage } from '@/app/pages/ops/ApprovalQueuePage'
import { AuditExplorerPage } from '@/app/pages/ops/AuditExplorerPage'
import { AssistantOpsPage } from '@/app/pages/ops/AssistantOpsPage'
import { IntelligencePage } from '@/app/pages/ops/IntelligencePage'
import { RolesSettingsPage } from '@/app/pages/settings/RolesSettingsPage'
import { IntegrationsSettingsPage } from '@/app/pages/settings/IntegrationsSettingsPage'
import { InventoryImportPage } from '@/app/pages/settings/InventoryImportPage'
import { CrmImportPage } from '@/app/pages/settings/CrmImportPage'

const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  '/app/dashboard': DashboardPage,
  '/app/workstation': WorkstationPage,
  '/app/records/households': HouseholdListPage,
  '/app/records/households/:id': HouseholdRecordPage,
  '/app/records/leads': LeadListPage,
  '/app/records/leads/:id': LeadRecordPage,
  '/app/records/credit-applications': CreditApplicationListPage,
  '/app/records/credit-applications/:id': CreditApplicationRecordPage,
  '/app/records/deals': DealListPage,
  '/app/records/deals/:id': DealRecordPage,
  '/app/records/inventory': InventoryListPage,
  '/app/records/inventory/:id': InventoryUnitPage,
  '/app/ops/events': EventExplorerPage,
  '/app/ops/approvals': ApprovalQueuePage,
  '/app/ops/audit': AuditExplorerPage,
  '/app/ops/assistant': AssistantOpsPage,
  '/app/ops/intelligence': IntelligencePage,
  '/app/settings/roles': RolesSettingsPage,
  '/app/settings/integrations': IntegrationsSettingsPage,
  '/app/settings/inventory-import': InventoryImportPage,
  '/app/settings/crm-import': CrmImportPage,
}

function resolvePageComponent(currentPath: string): React.ComponentType | null {
  for (const [pattern, Component] of Object.entries(ROUTE_COMPONENTS)) {
    if (matchRoute(pattern, currentPath)) return Component
  }
  return null
}

export function AppShell() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { currentPath, navigate } = useRouter()
  const { status, user, setRole, allowRoleSwitching, mode, signOut } = useAuth()

  const PageComponent = resolvePageComponent(currentPath)
  const routeDefinition = findMatchingRoute(currentPath)

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading secure workspace…</div>
  }

  if (status !== 'authenticated' || !user) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('outcome.auth.returnTo', currentPath)
      if (currentPath !== '/login') navigate('/login')
    }

    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Redirecting to login…</div>
  }

  if (routeDefinition?.requireExecutive || routeDefinition?.requiredPermission) {
    const guardResult = routeDefinition.requireExecutive
      ? checkExecutiveGuard(user)
      : checkPermissionGuard(user, routeDefinition.requiredPermission!)

    if (!guardResult.allowed) {
      if (guardResult.fallbackPath && guardResult.fallbackPath !== currentPath) {
        navigate(guardResult.fallbackPath)
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Redirecting to authorized workspace…
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        currentPath={currentPath}
        currentRole={user.role}
        onNavigate={navigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          currentRole={user.role}
          userName={user.displayName}
          allowRoleSwitching={allowRoleSwitching}
          authMode={mode}
          onRoleChange={setRole}
          onLogout={signOut}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          onNotificationsOpen={() => setNotificationsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-8">
          {PageComponent ? (
            <PageComponent />
          ) : (
            <DashboardPage />
          )}
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      <NotificationCenter
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  )
}
