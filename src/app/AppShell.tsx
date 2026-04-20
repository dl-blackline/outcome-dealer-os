import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useAuth } from '@/domains/auth'
import { AppSidebar } from '@/components/shell/AppSidebar'
import { Topbar } from '@/components/shell/Topbar'
import { CommandPalette } from '@/components/shell/CommandPalette'
import { NotificationCenter } from '@/components/shell/NotificationCenter'
import { RouteNotFound } from '@/components/shell/RouteNotFound'
import { findMatchingRoute, matchRoute } from '@/app/router/router'
import { checkExecutiveGuard, checkPermissionGuard } from '@/app/routes/guards'
import { useTheme } from '@/domains/theme'

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
import { DealFormsPage } from '@/app/pages/records/DealFormsPage'
import { DealFormPage } from '@/app/pages/records/DealFormPage'
import { LeadFormPage } from '@/app/pages/records/LeadFormPage'
import { CreditAppFormPage } from '@/app/pages/records/CreditAppFormPage'
import { InventoryListPage } from '@/app/pages/records/InventoryListPage'
import { InventoryUnitPage } from '@/app/pages/records/InventoryUnitPage'
import { EventExplorerPage } from '@/app/pages/ops/EventExplorerPage'
import { ApprovalQueuePage } from '@/app/pages/ops/ApprovalQueuePage'
import { AuditExplorerPage } from '@/app/pages/ops/AuditExplorerPage'
import { AssistantOpsPage } from '@/app/pages/ops/AssistantOpsPage'
import { IntelligencePage } from '@/app/pages/ops/IntelligencePage'
import { OperatingReviewPage } from '@/app/pages/ops/OperatingReviewPage'
import { ReportsPage } from '@/app/pages/ops/ReportsPage'
import { ReconPage } from '@/app/pages/ops/ReconPage'
import { BackOfficePage } from '@/app/pages/ops/BackOfficePage'
import { DocumentVaultPage } from '@/app/pages/ops/DocumentVaultPage'
import { RolesSettingsPage } from '@/app/pages/settings/RolesSettingsPage'
import { IntegrationsSettingsPage } from '@/app/pages/settings/IntegrationsSettingsPage'
import { InventoryImportPage } from '@/app/pages/settings/InventoryImportPage'
import { InventoryManagePage } from '@/app/pages/settings/InventoryManagePage'
import { CrmImportPage } from '@/app/pages/settings/CrmImportPage'

const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  '/app/dashboard': DashboardPage,
  '/app/workstation': WorkstationPage,
  '/app/records/households': HouseholdListPage,
  '/app/records/households/:id': HouseholdRecordPage,
  '/app/records/leads': LeadListPage,
  '/app/records/leads/new': LeadFormPage,
  '/app/records/leads/:id/edit': LeadFormPage,
  '/app/records/leads/:id': LeadRecordPage,
  '/app/records/credit-applications': CreditApplicationListPage,
  '/app/records/credit-applications/new': CreditAppFormPage,
  '/app/records/credit-applications/:id': CreditApplicationRecordPage,
  '/app/records/deals': DealListPage,
  '/app/records/deals/new': DealFormPage,
  '/app/records/deals/:id/edit': DealFormPage,
  '/app/records/deals/:id': DealRecordPage,
  '/app/records/deals/:id/forms': DealFormsPage,
  '/app/records/inventory': InventoryListPage,
  '/app/records/inventory/:id': InventoryUnitPage,
  '/app/ops/events': EventExplorerPage,
  '/app/ops/approvals': ApprovalQueuePage,
  '/app/ops/audit': AuditExplorerPage,
  '/app/ops/assistant': AssistantOpsPage,
  '/app/ops/intelligence': IntelligencePage,
  '/app/ops/operating-review': OperatingReviewPage,
  '/app/ops/recon': ReconPage,
  '/app/ops/back-office': BackOfficePage,
  '/app/ops/documents': DocumentVaultPage,
  '/app/ops/reports': ReportsPage,
  '/app/settings/roles': RolesSettingsPage,
  '/app/settings/integrations': IntegrationsSettingsPage,
  '/app/settings/inventory-import': InventoryImportPage,
  '/app/settings/inventory-manage': InventoryManagePage,
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
  const { theme, toggleTheme } = useTheme()

  const PageComponent = resolvePageComponent(currentPath)
  const routeDefinition = findMatchingRoute(currentPath)
  const isKnownAppRoute = currentPath.startsWith('/app') && Boolean(routeDefinition)

  const guardResult = useMemo(() => {
    if (!user || !routeDefinition) return null
    if (routeDefinition.requireExecutive) return checkExecutiveGuard(user)
    if (routeDefinition.requiredPermission) return checkPermissionGuard(user, routeDefinition.requiredPermission)
    return null
  }, [routeDefinition, user])

  const shouldRedirectToLogin = status !== 'loading' && (status !== 'authenticated' || !user)

  useEffect(() => {
    if (!shouldRedirectToLogin || typeof window === 'undefined') return
    window.sessionStorage.setItem('outcome.auth.returnTo', currentPath)
    if (currentPath !== '/login') navigate('/login')
  }, [currentPath, navigate, shouldRedirectToLogin])

  useEffect(() => {
    if (!guardResult || guardResult.allowed) return
    if (guardResult.fallbackPath && guardResult.fallbackPath !== currentPath) {
      navigate(guardResult.fallbackPath)
    }
  }, [currentPath, guardResult, navigate])

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading secure workspace…</div>
  }

  if (shouldRedirectToLogin) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Redirecting to login…</div>
  }

  const currentUser = user!

  if (guardResult && !guardResult.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Redirecting to authorized workspace…
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        currentPath={currentPath}
        currentRole={currentUser.role}
        onNavigate={navigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          currentRole={currentUser.role}
          userName={currentUser.displayName}
          allowRoleSwitching={allowRoleSwitching}
          authMode={mode}
          onRoleChange={setRole}
          onLogout={signOut}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          onNotificationsOpen={() => setNotificationsOpen(true)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        <main className="ods-shell-main flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] px-3 pb-20 pt-4 sm:px-6 sm:pb-24 sm:pt-6 lg:px-8 lg:pb-28 lg:pt-8 xl:px-10">
          {PageComponent ? (
            <PageComponent />
          ) : isKnownAppRoute ? (
            <RouteNotFound
              title="Workspace Page Not Found"
              message="This internal route could not be resolved. It may have moved or the link is invalid."
              actionLabel="Go to Dashboard"
              onAction={() => navigate('/app/dashboard')}
            />
          ) : (
            <RouteNotFound
              title="Unknown Internal Route"
              message="This path is outside registered internal routes."
              actionLabel="Go to Dashboard"
              onAction={() => navigate('/app/dashboard')}
            />
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
