import { ApprovalType, canApprove, PolicyUserLike } from '@/domains/roles/policy'
import { AppRole } from '@/domains/roles/roles'

export interface ApprovalPolicyDecision {
  requiresApproval: boolean
  approvalType?: ApprovalType
  reason?: string
  eligibleRoles: AppRole[]
}

export function evaluateTradeValueChange(
  user: PolicyUserLike,
  oldValue: number,
  newValue: number
): ApprovalPolicyDecision {
  const difference = Math.abs(newValue - oldValue)
  const percentChange = difference / oldValue

  if (percentChange > 0.1 || difference > 500) {
    return {
      requiresApproval: true,
      approvalType: 'trade_value_change',
      reason: 'Trade value changed by more than 10% or $500',
      eligibleRoles: ['gsm', 'gm', 'sales_manager', 'used_car_manager', 'owner'],
    }
  }

  return {
    requiresApproval: false,
    eligibleRoles: [],
  }
}

export function evaluateFinancialOutputChange(
  user: PolicyUserLike,
  oldGrossProfit: number,
  newGrossProfit: number
): ApprovalPolicyDecision {
  const difference = oldGrossProfit - newGrossProfit
  const percentChange = Math.abs(difference / oldGrossProfit)

  if (difference > 200 || percentChange > 0.15) {
    return {
      requiresApproval: true,
      approvalType: 'financial_output_change',
      reason: 'Gross profit reduced by more than $200 or 15%',
      eligibleRoles: ['gsm', 'gm', 'sales_manager', 'fi_manager', 'owner'],
    }
  }

  return {
    requiresApproval: false,
    eligibleRoles: [],
  }
}

export function evaluateAIActionReview(
  confidenceScore: number,
  actionType: string
): ApprovalPolicyDecision {
  if (confidenceScore < 0.75) {
    return {
      requiresApproval: true,
      approvalType: 'ai_action_review',
      reason: `AI action "${actionType}" has low confidence (${confidenceScore})`,
      eligibleRoles: ['gsm', 'gm', 'fi_manager', 'owner'],
    }
  }

  return {
    requiresApproval: false,
    eligibleRoles: [],
  }
}

export function canUserApprove(user: PolicyUserLike, approvalType: ApprovalType): boolean {
  return canApprove(user, approvalType)
}

export function getEligibleApprovers(approvalType: ApprovalType): AppRole[] {
  switch (approvalType) {
    case 'trade_value_change':
      return ['gsm', 'gm', 'sales_manager', 'used_car_manager', 'owner']
    case 'financial_output_change':
      return ['gsm', 'gm', 'sales_manager', 'fi_manager', 'owner']
    case 'ai_action_review':
      return ['gsm', 'gm', 'fi_manager', 'owner']
    case 'generic':
      return ['gsm', 'gm', 'owner']
    default:
      return ['gm', 'owner']
  }
}
