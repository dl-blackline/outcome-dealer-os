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
import { SoldRecordPage } from '@/app/pages/records/SoldRecordPage'
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
import { KeyControlPage } from '@/app/pages/ops/KeyControlPage'
import { RolesSettingsPage } from '@/app/pages/settings/RolesSettingsPage'
import { IntegrationsSettingsPage } from '@/app/pages/settings/IntegrationsSettingsPage'
import { InventoryImportPage } from '@/app/pages/settings/InventoryImportPage'
import { InventoryManagePage } from '@/app/pages/settings/InventoryManagePage'
import { CrmImportPage } from '@/app/pages/settings/CrmImportPage'
import { PlaybookDashboardPage } from '@/app/pages/playbook/PlaybookDashboardPage'
import { PlaybooksListPage } from '@/app/pages/playbook/PlaybooksListPage'
import { ProjectsListPage } from '@/app/pages/playbook/ProjectsListPage'
import { NotesListPage } from '@/app/pages/playbook/NotesListPage'
import { MeetingsListPage } from '@/app/pages/playbook/MeetingsListPage'
import { DecisionsListPage } from '@/app/pages/playbook/DecisionsListPage'
import { ActionItemsListPage } from '@/app/pages/playbook/ActionItemsListPage'
import { TimelinePage } from '@/app/pages/playbook/TimelinePage'
import { FilesLibraryPage } from '@/app/pages/playbook/FilesLibraryPage'
import { FinanceMatchEnginePage } from '@/app/pages/finance-match/FinanceMatchEnginePage'
import { ProgramLibraryPage } from '@/app/pages/finance-match/ProgramLibraryPage'
import { ProgramReviewPage } from '@/app/pages/finance-match/ProgramReviewPage'
import { LenderProgramDetailPage } from '@/app/pages/finance-match/LenderProgramDetailPage'
import controlCenterMockup from '../../01_control_center.png'
import leadsCommandCenterMockup from '../../02_leads_command_center.png'
import inventoryCommandMockup from '../../03_inventory_command.png'
import customer360Mockup from '../../04_customer_360.png'
import dealDeskMockup from '../../05_deal_desk.png'
import financeCenterMockup from '../../06_finance_center.png'
import calendarExecutionMockup from '../../07_calendar_execution.png'
import analyticsReportsMockup from '../../08_analytics_reports.png'
import aiCopilotMockup from '../../09_ai_copilot.png'
import settingsAdminMockup from '../../10_settings_admin.png'

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
  '/app/records/deals/:id/sold': SoldRecordPage,
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
  '/app/ops/key-control': KeyControlPage,
  '/app/ops/back-office': BackOfficePage,
  '/app/ops/documents': DocumentVaultPage,
  '/app/ops/reports': ReportsPage,
  '/app/settings/roles': RolesSettingsPage,
  '/app/settings/integrations': IntegrationsSettingsPage,
  '/app/settings/inventory-import': InventoryImportPage,
  '/app/settings/inventory-manage': InventoryManagePage,
  '/app/settings/crm-import': CrmImportPage,
  '/app/playbook': PlaybookDashboardPage,
  '/app/playbook/playbooks': PlaybooksListPage,
  '/app/playbook/projects': ProjectsListPage,
  '/app/playbook/notes': NotesListPage,
  '/app/playbook/meetings': MeetingsListPage,
  '/app/playbook/decisions': DecisionsListPage,
  '/app/playbook/action-items': ActionItemsListPage,
  '/app/playbook/timeline': TimelinePage,
  '/app/playbook/files': FilesLibraryPage,
  '/app/finance/match-engine': FinanceMatchEnginePage,
  '/app/finance/program-library': ProgramLibraryPage,
  '/app/finance/program-review/:jobId': ProgramReviewPage,
  '/app/finance/programs/:lenderId': LenderProgramDetailPage,
}

function resolvePageComponent(currentPath: string): React.ComponentType | null {
  for (const [pattern, Component] of Object.entries(ROUTE_COMPONENTS)) {
    if (matchRoute(pattern, currentPath)) return Component
  }
  return null
}

interface MockupVisualContext {
  image: string
  title: string
  subtitle: string
  chip: string
}

function getMockupVisualContext(currentPath: string): MockupVisualContext | null {
  if (currentPath === '/app/dashboard' || currentPath === '/app/workstation') {
    return {
      image: controlCenterMockup,
      title: 'Control Center',
      subtitle: 'Executive operations snapshot and real-time command view.',
      chip: '01 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/leads')) {
    return {
      image: leadsCommandCenterMockup,
      title: 'Leads Command Center',
      subtitle: 'Pipeline velocity, ownership, and priority lead flow.',
      chip: '02 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/inventory')) {
    return {
      image: inventoryCommandMockup,
      title: 'Inventory Command',
      subtitle: 'Turn-rate visibility with frontline and recon alignment.',
      chip: '03 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/households')) {
    return {
      image: customer360Mockup,
      title: 'Customer 360',
      subtitle: 'Household behavior, relationship depth, and lifetime value.',
      chip: '04 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/deals')) {
    return {
      image: dealDeskMockup,
      title: 'Deal Desk',
      subtitle: 'Desk flow, approvals, and deal progression at a glance.',
      chip: '05 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/credit-applications')) {
    return {
      image: financeCenterMockup,
      title: 'Finance Applications',
      subtitle: 'Credit intake, lender readiness, and structured funding workflow.',
      chip: '06 Reference',
    }
  }

  if (currentPath.startsWith('/app/finance')) {
    return {
      image: financeCenterMockup,
      title: 'Finance Center',
      subtitle: 'Program matching, lender readiness, and risk-aware structuring.',
      chip: '06 Reference',
    }
  }

  if (currentPath.startsWith('/app/ops/events') || currentPath.startsWith('/app/playbook/timeline')) {
    return {
      image: calendarExecutionMockup,
      title: 'Calendar Execution',
      subtitle: 'Execution cadence, milestones, and cross-team timing signals.',
      chip: '07 Reference',
    }
  }

  if (
    currentPath.startsWith('/app/ops/approvals') ||
    currentPath.startsWith('/app/ops/audit') ||
    currentPath.startsWith('/app/ops/recon') ||
    currentPath.startsWith('/app/ops/key-control') ||
    currentPath.startsWith('/app/ops/back-office') ||
    currentPath.startsWith('/app/ops/documents') ||
    currentPath.startsWith('/app/ops/operating-review')
  ) {
    return {
      image: controlCenterMockup,
      title: 'Operations Command',
      subtitle: 'Approval, compliance, and execution controls synchronized in one operational plane.',
      chip: '01 Reference',
    }
  }

  if (currentPath.startsWith('/app/ops/reports') || currentPath.startsWith('/app/ops/intelligence')) {
    return {
      image: analyticsReportsMockup,
      title: 'Analytics Reports',
      subtitle: 'KPI trends, conversion intelligence, and performance drill-downs.',
      chip: '08 Reference',
    }
  }

  if (currentPath.startsWith('/app/ops/assistant')) {
    return {
      image: aiCopilotMockup,
      title: 'AI Copilot',
      subtitle: 'Operational copiloting, diagnostics, and decision support.',
      chip: '09 Reference',
    }
  }

  if (currentPath.startsWith('/app/settings')) {
    return {
      image: settingsAdminMockup,
      title: 'Settings Admin',
      subtitle: 'Role governance, integrations, and system configuration control.',
      chip: '10 Reference',
    }
  }

  if (currentPath.startsWith('/app/playbook')) {
    return {
      image: calendarExecutionMockup,
      title: 'Execution Playbook',
      subtitle: 'Project cadence, decisions, and timeline execution anchored to weekly operating rhythm.',
      chip: '07 Reference',
    }
  }

  if (currentPath.startsWith('/app')) {
    return {
      image: controlCenterMockup,
      title: 'Dealer Command Surface',
      subtitle: 'Unified control plane for sales, ops, and finance execution.',
      chip: '01 Reference',
    }
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
  const mockupVisual = getMockupVisualContext(currentPath)

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
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" style={{ background: '#07080d' }}>Loading secure workspace…</div>
  }

  if (shouldRedirectToLogin) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" style={{ background: '#07080d' }}>Redirecting to login…</div>
  }

  const currentUser = user!

  if (guardResult && !guardResult.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" style={{ background: '#07080d' }}>
        Redirecting to authorized workspace…
      </div>
    )
  }

  return (
    <div className="flex h-screen" style={{ background: 'linear-gradient(180deg, #07080d 0%, #060810 100%)' }}>
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

        <main
          className="ods-shell-main flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] px-3 pb-20 pt-4 sm:px-6 sm:pb-24 sm:pt-6 lg:px-8 lg:pb-28 lg:pt-8 xl:px-10"
          style={
            mockupVisual
              ? {
                  backgroundImage: `radial-gradient(circle at 18% 10%, rgba(59, 130, 246, 0.12), transparent 44%), radial-gradient(circle at 82% 2%, rgba(220, 38, 38, 0.1), transparent 42%)`,
                }
              : undefined
          }
        >
          {mockupVisual && (
            <section className="mb-4 overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_80px_rgba(2,8,23,0.38)]">
              <div
                style={{
                  position: 'relative',
                  minHeight: '180px',
                  backgroundImage: `linear-gradient(112deg, rgba(2, 8, 23, 0.9), rgba(15, 23, 42, 0.72)), url(${mockupVisual.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.86) 100%)' }} />
                <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6">
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100">
                    {mockupVisual.chip}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold uppercase tracking-[0.08em] text-slate-50 sm:text-3xl">
                    {mockupVisual.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-200/90 sm:text-[15px]">
                    {mockupVisual.subtitle}
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className={mockupVisual ? 'rounded-2xl border border-white/10 bg-background/88 p-2 backdrop-blur-md sm:p-3' : undefined}>
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
          </div>
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
