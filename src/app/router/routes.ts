import type { Permission } from '@/domains/roles/permissions'

export interface RouteDefinition {
  path: string
  label: string
  component: string
  group: 'dashboard' | 'records' | 'operations' | 'settings' | 'workstation'
  requiredPermission?: Permission
  requireExecutive?: boolean
}

export const APP_ROUTES: RouteDefinition[] = [
  { path: '/app/dashboard', label: 'Dashboard', component: 'DashboardPage', group: 'dashboard' },
  { path: '/app/workstation', label: 'Workstation', component: 'WorkstationPage', group: 'workstation', requiredPermission: 'manage_tasks' },
  { path: '/app/records/households', label: 'Households', component: 'HouseholdListPage', group: 'records', requiredPermission: 'view_leads' },
  { path: '/app/records/households/:id', label: 'Household', component: 'HouseholdRecordPage', group: 'records', requiredPermission: 'view_leads' },
  { path: '/app/records/leads', label: 'Leads', component: 'LeadListPage', group: 'records', requiredPermission: 'view_leads' },
  { path: '/app/records/leads/:id', label: 'Lead', component: 'LeadRecordPage', group: 'records', requiredPermission: 'view_leads' },
  { path: '/app/records/deals', label: 'Deals', component: 'DealListPage', group: 'records', requiredPermission: 'view_desk_scenarios' },
  { path: '/app/records/deals/:id', label: 'Deal', component: 'DealRecordPage', group: 'records', requiredPermission: 'view_desk_scenarios' },
  { path: '/app/records/inventory', label: 'Inventory', component: 'InventoryListPage', group: 'records', requiredPermission: 'view_trades' },
  { path: '/app/records/inventory/:id', label: 'Inventory Unit', component: 'InventoryUnitPage', group: 'records', requiredPermission: 'view_trades' },
  { path: '/app/ops/events', label: 'Events', component: 'EventExplorerPage', group: 'operations', requiredPermission: 'view_audit_logs' },
  { path: '/app/ops/approvals', label: 'Approvals', component: 'ApprovalQueuePage', group: 'operations', requiredPermission: 'view_approvals' },
  { path: '/app/ops/audit', label: 'Audit', component: 'AuditExplorerPage', group: 'operations', requiredPermission: 'view_audit_logs' },
  { path: '/app/settings/roles', label: 'Roles', component: 'RolesSettingsPage', group: 'settings', requireExecutive: true },
  { path: '/app/settings/integrations', label: 'Integrations', component: 'IntegrationsSettingsPage', group: 'settings', requiredPermission: 'manage_integrations' },
]
