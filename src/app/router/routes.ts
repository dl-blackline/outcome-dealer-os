import type { Permission } from '@/domains/roles/permissions'

export interface RouteDefinition {
  path: string
  label: string
  component: string
  group: 'dashboard' | 'records' | 'operations' | 'settings' | 'workstation' | 'buyer_hub' | 'playbook'
  requiredPermission?: Permission
  requireExecutive?: boolean
}

export const APP_ROUTES: RouteDefinition[] = [
  { path: '/', label: 'Home', component: 'HomePage', group: 'buyer_hub' },
  { path: '/login', label: 'Staff Login', component: 'LoginPage', group: 'buyer_hub' },
  { path: '/app/dashboard', label: 'Dashboard', component: 'DashboardPage', group: 'dashboard' },
  { path: '/app/workstation', label: 'Workstation', component: 'WorkstationPage', group: 'workstation' },
  { path: '/app/records/households', label: 'Households', component: 'HouseholdListPage', group: 'records' },
  { path: '/app/records/households/:id', label: 'Household', component: 'HouseholdRecordPage', group: 'records' },
  { path: '/app/records/leads', label: 'Leads', component: 'LeadListPage', group: 'records' },
  { path: '/app/records/leads/new', label: 'New Lead', component: 'LeadFormPage', group: 'records' },
  { path: '/app/records/leads/:id/edit', label: 'Edit Lead', component: 'LeadFormPage', group: 'records' },
  { path: '/app/records/leads/:id', label: 'Lead', component: 'LeadRecordPage', group: 'records' },
  { path: '/app/records/credit-applications', label: 'Credit Applications', component: 'CreditApplicationListPage', group: 'records' },
  { path: '/app/records/credit-applications/new', label: 'New Credit Application', component: 'CreditAppFormPage', group: 'records' },
  { path: '/app/records/credit-applications/:id', label: 'Credit Application', component: 'CreditApplicationRecordPage', group: 'records' },
  { path: '/app/records/deals', label: 'Deals', component: 'DealListPage', group: 'records' },
  { path: '/app/records/deals/new', label: 'New Deal', component: 'DealFormPage', group: 'records' },
  { path: '/app/records/deals/:id/edit', label: 'Edit Deal', component: 'DealFormPage', group: 'records' },
  { path: '/app/records/deals/:id/sold', label: 'Sold Record', component: 'SoldRecordPage', group: 'records' },
  { path: '/app/records/deals/:id', label: 'Deal', component: 'DealRecordPage', group: 'records' },
  { path: '/app/records/deals/:id/forms', label: 'Deal Forms', component: 'DealFormsPage', group: 'records' },
  { path: '/app/records/inventory', label: 'Inventory', component: 'InventoryListPage', group: 'records' },
  { path: '/app/records/inventory/:id', label: 'Inventory Unit', component: 'InventoryUnitPage', group: 'records' },
  { path: '/app/ops/events', label: 'Events', component: 'EventExplorerPage', group: 'operations' },
  { path: '/app/ops/approvals', label: 'Approvals', component: 'ApprovalQueuePage', group: 'operations' },
  { path: '/app/ops/audit', label: 'Audit', component: 'AuditExplorerPage', group: 'operations' },
  { path: '/app/ops/assistant', label: 'Assistant Ops', component: 'AssistantOpsPage', group: 'operations' },
  { path: '/app/ops/intelligence', label: 'Intelligence', component: 'IntelligencePage', group: 'operations' },
  { path: '/app/ops/operating-review', label: 'Operating Review', component: 'OperatingReviewPage', group: 'operations' },
  { path: '/app/ops/recon', label: 'Fixed Ops / Recon', component: 'ReconPage', group: 'operations' },
  { path: '/app/ops/key-control', label: 'Key Control', component: 'KeyControlPage', group: 'operations' },
  { path: '/app/ops/back-office', label: 'Back Office', component: 'BackOfficePage', group: 'operations' },
  { path: '/app/ops/documents', label: 'Document Vault', component: 'DocumentVaultPage', group: 'operations' },
  { path: '/app/ops/reports', label: 'Reports', component: 'ReportsPage', group: 'operations' },
  { path: '/app/settings/roles', label: 'Roles', component: 'RolesSettingsPage', group: 'settings' },
  { path: '/app/settings/integrations', label: 'Integrations', component: 'IntegrationsSettingsPage', group: 'settings' },
  { path: '/app/settings/inventory-import', label: 'Inventory Import', component: 'InventoryImportPage', group: 'settings' },
  { path: '/app/settings/inventory-manage', label: 'Manage Inventory', component: 'InventoryManagePage', group: 'settings' },
  { path: '/app/settings/crm-import', label: 'CRM Import', component: 'CrmImportPage', group: 'settings' },
  // Playbook & Execution Center
  { path: '/app/playbook', label: 'Playbook', component: 'PlaybookDashboardPage', group: 'playbook' },
  { path: '/app/playbook/playbooks', label: 'Playbooks', component: 'PlaybooksListPage', group: 'playbook' },
  { path: '/app/playbook/projects', label: 'Projects', component: 'ProjectsListPage', group: 'playbook' },
  { path: '/app/playbook/notes', label: 'Notes', component: 'NotesListPage', group: 'playbook' },
  { path: '/app/playbook/meetings', label: 'Meetings', component: 'MeetingsListPage', group: 'playbook' },
  { path: '/app/playbook/decisions', label: 'Decisions', component: 'DecisionsListPage', group: 'playbook' },
  { path: '/app/playbook/action-items', label: 'Action Items', component: 'ActionItemsListPage', group: 'playbook' },
  { path: '/app/playbook/timeline', label: 'Timeline', component: 'TimelinePage', group: 'playbook' },
  { path: '/app/playbook/files', label: 'Files & Library', component: 'FilesLibraryPage', group: 'playbook' },
  // Buyer Hub (customer-facing)
  { path: '/shop', label: 'Shop Inventory', component: 'ShopInventoryPage', group: 'buyer_hub' },
  { path: '/shop/:unitId', label: 'Vehicle Detail', component: 'VehicleDetailPage', group: 'buyer_hub' },
  { path: '/inquiry/:unitId', label: 'Inquire', component: 'InquiryPage', group: 'buyer_hub' },
  { path: '/compare', label: 'Compare', component: 'ComparePage', group: 'buyer_hub' },
  { path: '/favorites', label: 'Favorites', component: 'FavoritesPage', group: 'buyer_hub' },
  { path: '/finance', label: 'Finance', component: 'FinanceHubPage', group: 'buyer_hub' },
  { path: '/finance/apply', label: 'Apply', component: 'QuickAppPage', group: 'buyer_hub' },
  { path: '/trade', label: 'Trade-In', component: 'TradeInPage', group: 'buyer_hub' },
  { path: '/schedule', label: 'Schedule', component: 'SchedulePage', group: 'buyer_hub' },
  { path: '/my-next-steps', label: 'My Next Steps', component: 'NextStepsPage', group: 'buyer_hub' },
  { path: '/wholesale', label: 'Wholesale Inventory', component: 'WholesaleInventoryPage', group: 'buyer_hub' },
  { path: '/wholesale/:unitId', label: 'Wholesale Unit Detail', component: 'WholesaleVehicleDetailPage', group: 'buyer_hub' },
]
