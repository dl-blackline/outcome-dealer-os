import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useAuth } from '@/domains/auth'
import { AppSidebar } from '@/components/shell/AppSidebar'
import { Topbar } from '@/components/shell/Topbar'
import { OperationsFooter } from '@/components/shell/OperationsFooter'
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
import { AICopilotPage } from '@/app/pages/ops/AICopilotPage'
import { IntelligencePage } from '@/app/pages/ops/IntelligencePage'
import { OperatingReviewPage } from '@/app/pages/ops/OperatingReviewPage'
import { ReportsPage } from '@/app/pages/ops/ReportsPage'
import { AnalyticsPage } from '@/app/pages/ops/AnalyticsPage'
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
  '/app/ops/assistant': AICopilotPage,
  '/app/ops/intelligence': IntelligencePage,
  '/app/ops/operating-review': OperatingReviewPage,
  '/app/ops/recon': ReconPage,
  '/app/ops/key-control': KeyControlPage,
  '/app/ops/back-office': BackOfficePage,
  '/app/ops/documents': DocumentVaultPage,
  '/app/ops/reports': ReportsPage,
  '/app/ops/analytics': AnalyticsPage,
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
  title: string
  subtitle: string
  chip: string
}

interface RouteMockupHotspot {
  left: string
  top: string
  width: string
  height: string
  to: string
  title: string
}

interface RouteMockupConfig {
  imageSrc: string
  title: string
  subtitle: string
  hotspots: RouteMockupHotspot[]
  cropLeftPct?: number
}

function getRouteMockupConfig(currentPath: string): RouteMockupConfig | null {
  if (currentPath.startsWith('/app/dashboard')) {
    return {
      imageSrc: '/01_control_center.png',
      title: 'Control Center',
      subtitle: 'Mockup mode with live navigation overlays.',
      cropLeftPct: 22,
      hotspots: [
        { left: '19%', top: '7.2%', width: '60%', height: '8.5%', to: '/app/records/deals', title: 'Open Deals' },
        { left: '50.5%', top: '17.1%', width: '25.5%', height: '28.2%', to: '/app/records/leads', title: 'Open Leads' },
        { left: '19%', top: '47.2%', width: '40%', height: '17.8%', to: '/app/records/inventory', title: 'Open Inventory' },
        { left: '60%', top: '47.2%', width: '16%', height: '17.8%', to: '/app/workstation', title: 'Open Workstation' },
      ],
    }
  }

  if (currentPath.startsWith('/app/workstation')) {
    return {
      imageSrc: '/01_control_center.png',
      title: 'Workstation Command',
      subtitle: 'Mockup mode with live navigation overlays.',
      cropLeftPct: 22,
      hotspots: [
        { left: '18%', top: '14%', width: '60%', height: '10%', to: '/app/workstation', title: 'Open Workstation Live Page' },
        { left: '50.5%', top: '17.1%', width: '25.5%', height: '28.2%', to: '/app/records/leads', title: 'Open Leads' },
        { left: '19%', top: '47.2%', width: '40%', height: '17.8%', to: '/app/records/inventory', title: 'Open Inventory' },
      ],
    }
  }

  if (currentPath.startsWith('/app/records/inventory')) {
    return {
      imageSrc: '/01_site_mockups/sleek_car_dealership_inventory_page_design.png',
      title: 'Inventory Command',
      subtitle: 'Mockup mode with live navigation overlays.',
      hotspots: [
        { left: '8%', top: '16%', width: '84%', height: '70%', to: '/app/records/inventory', title: 'Open Inventory Live Page' },
      ],
    }
  }

  if (currentPath.startsWith('/app/records/leads')) {
    return {
      imageSrc: '/01_site_mockups/sleek_muscle_car_dealer_website_ui.png',
      title: 'Leads Command Center',
      subtitle: 'Mockup mode with live navigation overlays.',
      hotspots: [
        { left: '8%', top: '16%', width: '84%', height: '70%', to: '/app/records/leads', title: 'Open Leads Live Page' },
      ],
    }
  }

  if (currentPath.startsWith('/app/records/deals')) {
    return {
      imageSrc: '/01_site_mockups/fast_easy_car_approvals_at_night.png',
      title: 'Deal Desk Command',
      subtitle: 'Mockup mode with live navigation overlays.',
      hotspots: [
        { left: '8%', top: '16%', width: '84%', height: '70%', to: '/app/records/deals', title: 'Open Deals Live Page' },
        { left: '57%', top: '20%', width: '20%', height: '18%', to: '/app/records/credit-applications', title: 'Open Credit Applications' },
      ],
    }
  }

  if (currentPath.startsWith('/app/records/households')) {
    return {
      imageSrc: '/01_site_mockups/sleek_performance_car_dealership_homepage_mockup.png',
      title: 'Customer Command Center',
      subtitle: 'Mockup mode with live navigation overlays.',
      hotspots: [
        { left: '8%', top: '16%', width: '84%', height: '70%', to: '/app/records/households', title: 'Open Customers Live Page' },
        { left: '62%', top: '56%', width: '16%', height: '10%', to: '/app/records/leads', title: 'Open Leads' },
      ],
    }
  }

  if (currentPath.startsWith('/app/records/credit-applications') || currentPath.startsWith('/app/finance')) {
    return {
      imageSrc: '/01_site_mockups/fast_easy_car_approvals_at_night.png',
      title: 'Finance Command',
      subtitle: 'Mockup mode with live navigation overlays.',
      hotspots: [
        { left: '8%', top: '16%', width: '84%', height: '70%', to: '/app/records/credit-applications', title: 'Open Credit Applications Live Page' },
        { left: '66%', top: '21%', width: '16%', height: '12%', to: '/app/finance/match-engine', title: 'Open Match Engine' },
      ],
    }
  }

  if (currentPath.startsWith('/app/ops') || currentPath.startsWith('/app/settings') || currentPath.startsWith('/app/playbook')) {
    return {
      imageSrc: '/01_site_mockups/powerful_branding_for_a_premium_car_dealership.png',
      title: 'Operations Command',
      subtitle: 'Mockup mode with live navigation overlays.',
      hotspots: [
        { left: '8%', top: '16%', width: '84%', height: '70%', to: currentPath, title: 'Open Live Page' },
        { left: '62%', top: '56%', width: '16%', height: '10%', to: '/app/ops/events', title: 'Open Events' },
      ],
    }
  }

  if (currentPath.startsWith('/app')) {
    return {
      imageSrc: '/01_control_center.png',
      title: 'Dealer Command Surface',
      subtitle: 'Mockup mode with live navigation overlays.',
      cropLeftPct: 22,
      hotspots: [
        { left: '18%', top: '14%', width: '60%', height: '10%', to: '/app/dashboard', title: 'Open Control Center' },
        { left: '50.5%', top: '17.1%', width: '25.5%', height: '28.2%', to: '/app/records/leads', title: 'Open Leads' },
        { left: '19%', top: '47.2%', width: '40%', height: '17.8%', to: '/app/records/inventory', title: 'Open Inventory' },
        { left: '60%', top: '47.2%', width: '16%', height: '17.8%', to: '/app/workstation', title: 'Open Workstation' },
      ],
    }
  }

  return null
}

function getMockupVisualContext(currentPath: string): MockupVisualContext | null {
  if (currentPath === '/app/dashboard' || currentPath === '/app/workstation') {
    return {
      title: 'Control Center',
      subtitle: 'Executive operations snapshot and real-time command view.',
      chip: '01 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/leads')) {
    return {
      title: 'Leads Command Center',
      subtitle: 'Pipeline velocity, ownership, and priority lead flow.',
      chip: '02 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/inventory')) {
    return {
      title: 'Inventory Command',
      subtitle: 'Turn-rate visibility with frontline and recon alignment.',
      chip: '03 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/households')) {
    return {
      title: 'Customer 360',
      subtitle: 'Household behavior, relationship depth, and lifetime value.',
      chip: '04 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/deals')) {
    return {
      title: 'Deal Desk',
      subtitle: 'Desk flow, approvals, and deal progression at a glance.',
      chip: '05 Reference',
    }
  }

  if (currentPath.startsWith('/app/records/credit-applications')) {
    return {
      title: 'Finance Applications',
      subtitle: 'Credit intake, lender readiness, and structured funding workflow.',
      chip: '06 Reference',
    }
  }

  if (currentPath.startsWith('/app/finance')) {
    return {
      title: 'Finance Center',
      subtitle: 'Program matching, lender readiness, and risk-aware structuring.',
      chip: '06 Reference',
    }
  }

  if (currentPath.startsWith('/app/ops/events') || currentPath.startsWith('/app/playbook/timeline')) {
    return {
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
      title: 'Operations Command',
      subtitle: 'Approval, compliance, and execution controls synchronized in one operational plane.',
      chip: '01 Reference',
    }
  }

  if (currentPath.startsWith('/app/ops/reports') || currentPath.startsWith('/app/ops/intelligence')) {
    return {
      title: 'Analytics Reports',
      subtitle: 'KPI trends, conversion intelligence, and performance drill-downs.',
      chip: '08 Reference',
    }
  }

  if (currentPath.startsWith('/app/ops/assistant')) {
    return {
      title: 'AI Copilot',
      subtitle: 'Operational copiloting, diagnostics, and decision support.',
      chip: '09 Reference',
    }
  }

  if (currentPath.startsWith('/app/settings')) {
    return {
      title: 'Settings Admin',
      subtitle: 'Role governance, integrations, and system configuration control.',
      chip: '10 Reference',
    }
  }

  if (currentPath.startsWith('/app/playbook')) {
    return {
      title: 'Execution Playbook',
      subtitle: 'Project cadence, decisions, and timeline execution anchored to weekly operating rhythm.',
      chip: '07 Reference',
    }
  }

  if (currentPath.startsWith('/app')) {
    return {
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
  const showReferenceBanner = false

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
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" style={{ background: '#080A0D' }}>Loading secure workspace…</div>
  }

  if (shouldRedirectToLogin) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" style={{ background: '#080A0D' }}>Redirecting to login…</div>
  }

  const currentUser = user!

  if (guardResult && !guardResult.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" style={{ background: '#080A0D' }}>
        Redirecting to authorized workspace…
      </div>
    )
  }

  return (
    <div className="flex h-screen" style={{ background: '#080A0D' }}>
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
          className="ods-shell-main flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] px-4 pb-20 pt-5 sm:px-6 sm:pb-24 sm:pt-6 lg:px-8 lg:pb-28 lg:pt-7 xl:px-10"
          style={{
            backgroundImage: `radial-gradient(ellipse at 15% 0%, rgba(227, 27, 55, 0.07), transparent 50%), radial-gradient(ellipse at 85% 0%, rgba(30, 58, 138, 0.07), transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.4), transparent 60%)`,
          }}
        >
          {showReferenceBanner && (
            <section className="mb-5 overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_80px_rgba(2,8,23,0.38)]">
              <div
                style={{
                  position: 'relative',
                  minHeight: '180px',
                  backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(227,27,55,0.28), transparent 40%), radial-gradient(circle at 82% 6%, rgba(30,58,138,0.22), transparent 38%), linear-gradient(112deg, rgba(8, 10, 13, 0.95), rgba(15, 18, 21, 0.90))',
                }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(180deg, rgba(8,10,13,0.15) 0%, rgba(8,10,13,0.85) 100%)' }} />
                <div className="absolute left-[-4%] top-[26%] h-px w-[54%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(227,27,55,0.65) 44%, transparent 100%)' }} />
                <div className="absolute left-[-2%] top-[37%] h-px w-[58%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(30,58,138,0.5) 42%, transparent 100%)' }} />
                <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: '#C0C3C7' }}>
                    {mockupVisual.chip}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold uppercase tracking-[0.08em] text-white sm:text-3xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif' }}>
                    {mockupVisual.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm sm:text-[15px]" style={{ color: 'rgba(192,195,199,0.75)' }}>
                    {mockupVisual.subtitle}
                  </p>
                </div>
              </div>
            </section>
          )}

          <div>
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
        <OperationsFooter />
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
