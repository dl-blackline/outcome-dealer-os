import { CurrentAppUser } from './auth.types'
import { AppRole } from '@/domains/roles/roles'
import { Permission } from '@/domains/roles/permissions'
import { hasPermission, assertPermission, canApprove, ApprovalType } from '@/domains/roles/policy'

export function getCurrentUserRole(user: CurrentAppUser): AppRole {
  return user.role
}

export function getCurrentUserPermissions(user: CurrentAppUser): Permission[] {
  return user.permissions
}

export function userHasPermission(user: CurrentAppUser, permission: Permission): boolean {
  return hasPermission(user, permission)
}

export function assertUserPermission(user: CurrentAppUser, permission: Permission): void {
  assertPermission(user, permission)
}

export function userCanApprove(user: CurrentAppUser, approvalType: ApprovalType): boolean {
  return canApprove(user, approvalType)
}

export function requirePermission(user: CurrentAppUser | null, permission: Permission): boolean {
  if (!user) {
    return false
  }
  return userHasPermission(user, permission)
}

export function canAccessRoute(user: CurrentAppUser | null, requiredPermission?: Permission): boolean {
  if (!requiredPermission) {
    return !!user
  }
  return requirePermission(user, requiredPermission)
}

export function isExecutiveRole(user: CurrentAppUser): boolean {
  return ['owner', 'gm', 'gsm', 'admin'].includes(user.role)
}

export function isManagerRole(user: CurrentAppUser): boolean {
  return [
    'owner',
    'gm',
    'gsm',
    'used_car_manager',
    'bdc_manager',
    'sales_manager',
    'fi_manager',
    'service_director',
    'recon_manager',
    'marketing_manager',
    'admin',
  ].includes(user.role)
}
