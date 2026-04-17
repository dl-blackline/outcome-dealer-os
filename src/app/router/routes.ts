import type { Permission } from '@/domains/roles/permissions'

export interface RouteDefinition {
  path: string
  label: string
  component: string
  group: 'dashboard' | 'records' | 'operations' | 'settings' | 'workstation' | 'buyer_hub'
  requiredPermission?: Permission
  requireExecutive?: boolean
}

export const APP_ROUTES: RouteDefinition[] = [
  { path: '/app/dashboard', label: 'Dashboard', component: 'DashboardPage', group: 'dashboard' },
  { path: '/app/workstation', label: 'Workstation', component: 'WorkstationPage', group: 'workstation' },
  { path: '/app/records/households', label: 'Households', component: 'HouseholdListPage', group: 'records' },
  { path: '/app/records/households/:id', label: 'Household', component: 'HouseholdRecordPage', group: 'records' },
  { path: '/app/records/leads', label: 'Leads', component: 'LeadListPage', group: 'records' },
  { path: '/app/records/leads/:id', label: 'Lead', component: 'LeadRecordPage', group: 'records' },
  { path: '/app/records/deals', label: 'Deals', component: 'DealListPage', group: 'records' },
  { path: '/app/records/deals/:id', label: 'Deal', component: 'DealRecordPage', group: 'records' },
  { path: '/app/records/inventory', label: 'Inventory', component: 'InventoryListPage', group: 'records' },
  { path: '/app/records/inventory/:id', label: 'Inventory Unit', component: 'InventoryUnitPage', group: 'records' },
  { path: '/app/ops/events', label: 'Events', component: 'EventExplorerPage', group: 'operations' },
  { path: '/app/ops/approvals', label: 'Approvals', component: 'ApprovalQueuePage', group: 'operations' },
  { path: '/app/ops/audit', label: 'Audit', component: 'AuditExplorerPage', group: 'operations' },
  { path: '/app/ops/assistant', label: 'Assistant Ops', component: 'AssistantOpsPage', group: 'operations' },
  { path: '/app/settings/roles', label: 'Roles', component: 'RolesSettingsPage', group: 'settings' },
  { path: '/app/settings/integrations', label: 'Integrations', component: 'IntegrationsSettingsPage', group: 'settings' },
  { path: '/app/settings/inventory-import', label: 'Inventory Import', component: 'InventoryImportPage', group: 'settings' },
  { path: '/app/settings/crm-import', label: 'CRM Import', component: 'CrmImportPage', group: 'settings' },
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
]
