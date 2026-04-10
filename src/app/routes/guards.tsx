import { ReactNode } from 'react'
import { CurrentAppUser } from '@/domains/auth/auth.types'
import { Permission } from '@/domains/roles/permissions'
import { canAccessRoute, isExecutiveRole } from '@/domains/auth/auth.permissions'

export interface RouteGuardResult {
  allowed: boolean
  reason?: string
  fallbackPath?: string
}

export function checkAuthGuard(user: CurrentAppUser | null): RouteGuardResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'User is not authenticated',
      fallbackPath: '/login',
    }
  }
  return { allowed: true }
}

export function checkPermissionGuard(
  user: CurrentAppUser | null,
  permission: Permission
): RouteGuardResult {
  const authCheck = checkAuthGuard(user)
  if (!authCheck.allowed) {
    return authCheck
  }

  if (!canAccessRoute(user, permission)) {
    return {
      allowed: false,
      reason: `User lacks required permission: ${permission}`,
      fallbackPath: '/app/dashboard',
    }
  }

  return { allowed: true }
}

export function checkExecutiveGuard(user: CurrentAppUser | null): RouteGuardResult {
  const authCheck = checkAuthGuard(user)
  if (!authCheck.allowed) {
    return authCheck
  }

  if (!user || !isExecutiveRole(user)) {
    return {
      allowed: false,
      reason: 'User is not an executive',
      fallbackPath: '/app/dashboard',
    }
  }

  return { allowed: true }
}

export interface GuardedRouteProps {
  user: CurrentAppUser | null
  children: ReactNode
  requiredPermission?: Permission
  requireExecutive?: boolean
  fallback?: ReactNode
  onAccessDenied?: (result: RouteGuardResult) => void
}

export function GuardedRoute({
  user,
  children,
  requiredPermission,
  requireExecutive,
  fallback,
  onAccessDenied,
}: GuardedRouteProps) {
  let guardResult: RouteGuardResult

  if (requireExecutive) {
    guardResult = checkExecutiveGuard(user)
  } else if (requiredPermission) {
    guardResult = checkPermissionGuard(user, requiredPermission)
  } else {
    guardResult = checkAuthGuard(user)
  }

  if (!guardResult.allowed) {
    if (onAccessDenied) {
      onAccessDenied(guardResult)
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

export function createRouteGuard(
  requiredPermission?: Permission,
  requireExecutive?: boolean
): (user: CurrentAppUser | null) => RouteGuardResult {
  return (user: CurrentAppUser | null) => {
    if (requireExecutive) {
      return checkExecutiveGuard(user)
    }
    if (requiredPermission) {
      return checkPermissionGuard(user, requiredPermission)
    }
    return checkAuthGuard(user)
  }
}
