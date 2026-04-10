export const APP_ROLES = [
  'owner',
  'gm',
  'gsm',
  'used_car_manager',
  'bdc_manager',
  'sales_manager',
  'sales_rep',
  'fi_manager',
  'service_director',
  'service_advisor',
  'recon_manager',
  'marketing_manager',
  'admin',
] as const

export type AppRole = typeof APP_ROLES[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: 'Owner',
  gm: 'General Manager',
  gsm: 'General Sales Manager',
  used_car_manager: 'Used Car Manager',
  bdc_manager: 'BDC Manager',
  sales_manager: 'Sales Manager',
  sales_rep: 'Sales Representative',
  fi_manager: 'F&I Manager',
  service_director: 'Service Director',
  service_advisor: 'Service Advisor',
  recon_manager: 'Recon Manager',
  marketing_manager: 'Marketing Manager',
  admin: 'Administrator',
}

export type NavGroup = 'dashboard' | 'records' | 'operations' | 'settings' | 'workstation'

export const ROLE_NAV_GROUPS: Record<AppRole, NavGroup[]> = {
  owner: ['dashboard', 'workstation', 'records', 'operations', 'settings'],
  gm: ['dashboard', 'workstation', 'records', 'operations', 'settings'],
  gsm: ['dashboard', 'workstation', 'records', 'operations', 'settings'],
  used_car_manager: ['dashboard', 'workstation', 'records', 'operations'],
  bdc_manager: ['dashboard', 'workstation', 'records', 'operations'],
  sales_manager: ['dashboard', 'workstation', 'records', 'operations'],
  sales_rep: ['dashboard', 'workstation', 'records'],
  fi_manager: ['dashboard', 'workstation', 'records', 'operations'],
  service_director: ['dashboard', 'workstation', 'records', 'operations'],
  service_advisor: ['dashboard', 'workstation', 'records'],
  recon_manager: ['dashboard', 'workstation', 'records', 'operations'],
  marketing_manager: ['dashboard', 'workstation', 'records', 'operations'],
  admin: ['dashboard', 'workstation', 'records', 'operations', 'settings'],
}
