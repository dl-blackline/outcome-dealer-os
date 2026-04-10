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

export type NavGroup = 'dashboard' | 'records' | 'operations' | 'settings'

export const ROLE_NAV_GROUPS: Record<AppRole, NavGroup[]> = {
  owner: ['dashboard', 'records', 'operations', 'settings'],
  gm: ['dashboard', 'records', 'operations', 'settings'],
  gsm: ['dashboard', 'records', 'operations', 'settings'],
  used_car_manager: ['dashboard', 'records', 'operations'],
  bdc_manager: ['dashboard', 'records', 'operations'],
  sales_manager: ['dashboard', 'records', 'operations'],
  sales_rep: ['dashboard', 'records'],
  fi_manager: ['dashboard', 'records', 'operations'],
  service_director: ['dashboard', 'records', 'operations'],
  service_advisor: ['dashboard', 'records'],
  recon_manager: ['dashboard', 'records', 'operations'],
  marketing_manager: ['dashboard', 'records', 'operations'],
  admin: ['dashboard', 'records', 'operations', 'settings'],
}
