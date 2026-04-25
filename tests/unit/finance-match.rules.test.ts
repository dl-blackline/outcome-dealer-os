import { describe, it, expect } from 'vitest'
import { evaluateRule, runMatchEngine } from '@/domains/finance-match/finance-match.rules'
import { buildDealCalculations } from '@/domains/finance-match/finance-match.calculations'
import type { LenderRule } from '@/domains/finance-match/finance-match.types'

const baseRule: LenderRule = {
  id: 'test-rule-id',
  programVersionId: 'ver-1',
  ruleName: 'Min Credit Score',
  category: 'credit_score',
  field: 'credit_score',
  operator: 'gte',
  value: 620,
  severity: 'hard_fail',
  message: 'Credit score must be at least 620',
  isActive: true,
  isAiGenerated: false,
  needsReview: false,
  sortOrder: 1,
  createdAt: new Date().toISOString(),
}

describe('evaluateRule', () => {
  it('passes when credit score meets minimum', () => {
    const input = { creditScore: 680 }
    const calc = buildDealCalculations(input)
    const result = evaluateRule(baseRule, input, calc)
    expect(result.passed).toBe(true)
  })

  it('fails when credit score is below minimum', () => {
    const input = { creditScore: 580 }
    const calc = buildDealCalculations(input)
    const result = evaluateRule(baseRule, input, calc)
    expect(result.passed).toBe(false)
  })

  it('evaluates lte operator', () => {
    const ltvRule: LenderRule = {
      ...baseRule,
      field: 'ltv',
      operator: 'lte',
      value: 1.2,
      category: 'ltv',
    }
    const input = { salesPrice: 20000, cashDown: 2000, bookValue: 20000 }
    const calc = buildDealCalculations(input)
    const result = evaluateRule(ltvRule, input, calc)
    expect(result.passed).toBe(true)
  })

  it('evaluates equals operator', () => {
    const stateRule: LenderRule = {
      ...baseRule,
      field: 'state',
      operator: 'eq',
      value: 'OH',
      category: 'state_territory',
    }
    const input = { state: 'OH' }
    const calc = buildDealCalculations(input)
    expect(evaluateRule(stateRule, input, calc).passed).toBe(true)

    const input2 = { state: 'TX' }
    const calc2 = buildDealCalculations(input2)
    expect(evaluateRule(stateRule, input2, calc2).passed).toBe(false)
  })

  it('evaluates ne operator', () => {
    const titleRule: LenderRule = {
      ...baseRule,
      field: 'title_type',
      operator: 'ne',
      value: 'salvage',
      category: 'title_type',
    }
    const input = { titleType: 'clean' as const }
    const calc = buildDealCalculations(input)
    expect(evaluateRule(titleRule, input, calc).passed).toBe(true)

    const input2 = { titleType: 'salvage' as const }
    const calc2 = buildDealCalculations(input2)
    expect(evaluateRule(titleRule, input2, calc2).passed).toBe(false)
  })

  it('evaluates in operator', () => {
    const rule: LenderRule = {
      ...baseRule,
      field: 'state',
      operator: 'in',
      value: ['OH', 'MI', 'IN'],
      category: 'state_territory',
    }
    const input = { state: 'OH' }
    const calc = buildDealCalculations(input)
    expect(evaluateRule(rule, input, calc).passed).toBe(true)

    const input2 = { state: 'TX' }
    const calc2 = buildDealCalculations(input2)
    expect(evaluateRule(rule, input2, calc2).passed).toBe(false)
  })

  it('evaluates not_in operator', () => {
    const rule: LenderRule = {
      ...baseRule,
      field: 'state',
      operator: 'not_in',
      value: ['NY', 'CA'],
      category: 'state_territory',
    }
    const input = { state: 'OH' }
    const calc = buildDealCalculations(input)
    expect(evaluateRule(rule, input, calc).passed).toBe(true)

    const input2 = { state: 'NY' }
    const calc2 = buildDealCalculations(input2)
    expect(evaluateRule(rule, input2, calc2).passed).toBe(false)
  })

  it('evaluates boolean eq rule for bankruptcy', () => {
    const rule: LenderRule = {
      ...baseRule,
      field: 'has_bankruptcy',
      operator: 'eq',
      value: false,
      category: 'bankruptcy',
    }
    const input = { hasBankruptcy: false }
    const calc = buildDealCalculations(input)
    expect(evaluateRule(rule, input, calc).passed).toBe(true)

    const input2 = { hasBankruptcy: true }
    const calc2 = buildDealCalculations(input2)
    expect(evaluateRule(rule, input2, calc2).passed).toBe(false)
  })
})

describe('runMatchEngine', () => {
  const programs = [
    {
      lenderId: 'lender-1',
      lenderName: 'Test Lender',
      programId: 'program-1',
      programName: 'Standard Program',
      programVersionId: 'ver-1',
      rules: [
        {
          ...baseRule,
          id: 'rule-credit',
          field: 'credit_score',
          operator: 'gte' as const,
          value: 620,
        },
        {
          ...baseRule,
          id: 'rule-ltv',
          field: 'ltv',
          operator: 'lte' as const,
          value: 1.3,
          category: 'ltv' as const,
        },
      ],
    },
  ]

  it('returns greenlight for qualifying deal', () => {
    const input = {
      creditScore: 720,
      salesPrice: 18000,
      cashDown: 2000,
      bookValue: 20000,
    }
    const output = runMatchEngine(input, programs)
    expect(output.results).toHaveLength(1)
    expect(output.results[0].status).toBe('greenlight')
    expect(output.results[0].passedRules).toBe(2)
    expect(output.results[0].failedRules).toBe(0)
  })

  it('returns fail for disqualifying credit', () => {
    const input = {
      creditScore: 580,
      salesPrice: 18000,
      cashDown: 2000,
      bookValue: 20000,
    }
    const output = runMatchEngine(input, programs)
    expect(output.results[0].status).toBe('fail')
    expect(output.results[0].failedRules).toBeGreaterThan(0)
  })

  it('returns empty results for no programs', () => {
    const output = runMatchEngine({}, [])
    expect(output.results).toHaveLength(0)
  })

  it('confidence is between 0 and 1', () => {
    const input = { creditScore: 720, salesPrice: 20000, cashDown: 2000, bookValue: 20000 }
    const output = runMatchEngine(input, programs)
    const confidence = output.results[0].confidence
    expect(confidence).toBeGreaterThanOrEqual(0)
    expect(confidence).toBeLessThanOrEqual(1)
  })
})
