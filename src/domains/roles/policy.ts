import { AppRole } from './roles'
import { Permission, ROLE_PERMISSIONS } from './permissions'

export interface PolicyUserLike {
  role: AppRole
}

export class PermissionError extends Error {
  constructor(
    public permission: Permission,
    public user: PolicyUserLike
  ) {
    super(
      `Permission denied: user with role "${user.role}" lacks permission "${permission}"`
    )
    this.name = 'PermissionError'
  }
}

export function hasPermission(user: PolicyUserLike, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role]
  return userPermissions.includes(permission)
}

export function assertPermission(user: PolicyUserLike, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new PermissionError(permission, user)
  }
}

export type ApprovalType =
  | 'trade_value_change'
  | 'financial_output_change'
  | 'ai_action_review'
  | 'generic'

const APPROVAL_TYPE_PERMISSIONS: Record<
  Exclude<ApprovalType, 'generic'>,
  Permission
> = {
  trade_value_change: 'approve_trade_values',
  financial_output_change: 'approve_financial_outputs',
  ai_action_review: 'approve_ai_actions',
}

export function canApprove(user: PolicyUserLike, approvalType: ApprovalType): boolean {
  if (approvalType === 'generic') {
    return hasPermission(user, 'resolve_approvals')
  }

  const requiredPermission = APPROVAL_TYPE_PERMISSIONS[approvalType]
  return hasPermission(user, requiredPermission)
}
