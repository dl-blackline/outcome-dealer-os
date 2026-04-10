import {
  evaluateTradeValueChange,
  evaluateFinancialOutputChange,
  evaluateAIActionReview,
  canUserApprove,
} from '@/domains/approvals/approval.policy'

describe('Approval Policy', () => {
  it('should require approval for trade value change > 10%', () => {
    const decision = evaluateTradeValueChange({ role: 'sales_rep' }, 5000, 5600)

    expect(decision.requiresApproval).toBe(true)
    expect(decision.approvalType).toBe('trade_value_change')
    expect(decision.eligibleRoles).toContain('sales_manager')
  })

  it('should not require approval for small trade value change', () => {
    const decision = evaluateTradeValueChange({ role: 'sales_rep' }, 5000, 5400)

    expect(decision.requiresApproval).toBe(false)
  })

  it('should require approval for financial output reduction > 15%', () => {
    const decision = evaluateFinancialOutputChange({ role: 'sales_rep' }, 2000, 1600)

    expect(decision.requiresApproval).toBe(true)
    expect(decision.approvalType).toBe('financial_output_change')
    expect(decision.eligibleRoles).toContain('gsm')
  })

  it('should require approval for AI actions with low confidence', () => {
    const decision = evaluateAIActionReview(0.68, 'lead_score_assignment')

    expect(decision.requiresApproval).toBe(true)
    expect(decision.approvalType).toBe('ai_action_review')
    expect(decision.eligibleRoles).toContain('gm')
  })

  it('should not require approval for high confidence AI actions', () => {
    const decision = evaluateAIActionReview(0.89, 'email_composition')

    expect(decision.requiresApproval).toBe(false)
  })

  it('should allow GSM to approve trade value changes', () => {
    const canApprove = canUserApprove({ role: 'gsm' }, 'trade_value_change')

    expect(canApprove).toBe(true)
  })

  it('should not allow sales_rep to approve financial outputs', () => {
    const canApprove = canUserApprove({ role: 'sales_rep' }, 'financial_output_change')

    expect(canApprove).toBe(false)
  })
})
