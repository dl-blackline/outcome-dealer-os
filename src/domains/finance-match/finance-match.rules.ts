import {
  DealStructureInput,
  LenderRule,
  LenderMatchResult,
  MatchResultStatus,
  MatchReason,
  RestructureSuggestion,
  RuleOperator,
  RuleSeverity,
} from './finance-match.types'
import { buildDealCalculations, DealCalculations } from './finance-match.calculations'
import { UUID } from '@/types/common'

// ─── Match Program Input ──────────────────────────────────────────────────────

export interface MatchProgramInput {
  lenderId: UUID
  lenderName: string
  programId: UUID
  programName: string
  programVersionId: UUID
  rules: LenderRule[]
}

// ─── Rule Evaluation ──────────────────────────────────────────────────────────

type ScalarValue = string | number | boolean | null | undefined

function resolveFieldValue(
  field: string,
  input: DealStructureInput,
  calc: DealCalculations
): ScalarValue {
  // Calculated fields first
  const calcMap: Record<string, ScalarValue> = {
    ltv: calc.ltv,
    pti: calc.pti,
    dti: calc.dti,
    ndi: calc.ndi,
    amount_financed: calc.amountFinanced,
    vehicle_age: calc.vehicleAge,
    total_backend: calc.totalBackend,
    credit_tier: calc.creditTier,
  }
  if (field in calcMap) return calcMap[field]

  // Input fields (snake_case mapping)
  const inputMap: Record<string, ScalarValue> = {
    credit_score: input.creditScore,
    monthly_gross_income: input.monthlyGrossIncome,
    vehicle_year: input.vehicleYear,
    vehicle_mileage: input.vehicleMileage,
    vehicle_type: input.vehicleType,
    title_type: input.titleType,
    proposed_term: input.proposedTerm,
    proposed_rate: input.proposedRate,
    state: input.state,
    has_bankruptcy: input.hasBankruptcy,
    has_repossession: input.hasRepossession,
    employment_status: input.employmentStatus,
    months_on_job: input.monthsOnJob,
    sales_price: input.salesPrice,
    cash_down: input.cashDown,
    gap_price: input.gapPrice,
    vsc_price: input.vscPrice,
    maintenance_price: input.maintenancePrice,
    other_backend_price: input.otherBackendPrice,
  }
  if (field in inputMap) return inputMap[field]

  return undefined
}

function applyOperator(
  operator: RuleOperator,
  fieldValue: ScalarValue,
  ruleValue: unknown
): boolean {
  switch (operator) {
    case 'eq':
      return fieldValue === ruleValue
    case 'ne':
      return fieldValue !== ruleValue
    case 'gt':
      return typeof fieldValue === 'number' && typeof ruleValue === 'number'
        ? fieldValue > ruleValue
        : false
    case 'gte':
      return typeof fieldValue === 'number' && typeof ruleValue === 'number'
        ? fieldValue >= ruleValue
        : false
    case 'lt':
      return typeof fieldValue === 'number' && typeof ruleValue === 'number'
        ? fieldValue < ruleValue
        : false
    case 'lte':
      return typeof fieldValue === 'number' && typeof ruleValue === 'number'
        ? fieldValue <= ruleValue
        : false
    case 'in':
      return Array.isArray(ruleValue)
        ? ruleValue.includes(fieldValue)
        : false
    case 'not_in':
      return Array.isArray(ruleValue)
        ? !ruleValue.includes(fieldValue)
        : true
    case 'contains':
      return typeof fieldValue === 'string' && typeof ruleValue === 'string'
        ? fieldValue.includes(ruleValue)
        : false
    case 'not_contains':
      return typeof fieldValue === 'string' && typeof ruleValue === 'string'
        ? !fieldValue.includes(ruleValue)
        : true
    default:
      return false
  }
}

export interface RuleEvaluationResult {
  rule: LenderRule
  passed: boolean
  fieldValue: ScalarValue
}

export function evaluateRule(
  rule: LenderRule,
  input: DealStructureInput,
  calc: DealCalculations
): RuleEvaluationResult {
  const fieldValue = resolveFieldValue(rule.field, input, calc)
  const passed = applyOperator(rule.operator, fieldValue, rule.value)
  return { rule, passed, fieldValue }
}

// ─── Restructure Suggestions ──────────────────────────────────────────────────

function buildRestructureSuggestions(
  evalResults: RuleEvaluationResult[],
  calc: DealCalculations,
  input: DealStructureInput
): RestructureSuggestion[] {
  const suggestions: RestructureSuggestion[] = []

  for (const { rule, passed } of evalResults) {
    if (passed) continue
    if (rule.severity === 'info') continue

    // LTV near-miss suggestion
    if (rule.field === 'ltv' && rule.operator === 'lte' && typeof rule.value === 'number') {
      const targetLtv = rule.value as number
      const additionalDown = calc.cashDownNeededForTargetLtv(targetLtv)
      const currentDown = input.cashDown ?? 0
      suggestions.push({
        type: 'increase_down_payment',
        description: `Reduce amount financed by $${additionalDown.toFixed(0)} (additional $${additionalDown.toFixed(0)} down) to meet ${(targetLtv * 100).toFixed(0)}% LTV requirement`,
        value: currentDown + additionalDown,
        priority: 1,
      })
    }

    // PTI near-miss
    if (rule.field === 'pti' && rule.operator === 'lte' && typeof rule.value === 'number') {
      const maxPay = calc.maxPaymentByPti(rule.value as number)
      suggestions.push({
        type: 'reduce_payment',
        description: `Reduce monthly payment to $${maxPay.toFixed(0)} to meet PTI requirement`,
        value: maxPay,
        priority: 2,
      })
    }

    // Term extension hint
    if (rule.field === 'proposed_term' && rule.operator === 'lte' && typeof rule.value === 'number') {
      suggestions.push({
        type: 'reduce_term',
        description: `Reduce loan term to ${rule.value} months to meet lender maximum`,
        value: rule.value as number,
        priority: 3,
      })
    }

    // Backend product reduction
    if (rule.field === 'total_backend' && rule.operator === 'lte' && typeof rule.value === 'number') {
      suggestions.push({
        type: 'reduce_backend',
        description: `Reduce total backend products to $${(rule.value as number).toFixed(0)} or less`,
        value: rule.value as number,
        priority: 4,
      })
    }
  }

  return suggestions.sort((a, b) => a.priority - b.priority)
}

// ─── Program Match Status ─────────────────────────────────────────────────────

function determineStatus(
  evalResults: RuleEvaluationResult[]
): MatchResultStatus {
  if (evalResults.length === 0) return 'review'

  const hardFails = evalResults.filter(r => !r.passed && r.rule.severity === 'hard_fail')
  if (hardFails.length > 0) return 'fail'

  const warnings = evalResults.filter(r => !r.passed && r.rule.severity === 'warning')
  if (warnings.length > 0) return 'review'

  return 'greenlight'
}

function buildReasons(evalResults: RuleEvaluationResult[]): MatchReason[] {
  return evalResults
    .filter(r => !r.passed)
    .map(r => ({
      type: r.passed ? 'pass' : r.rule.severity === 'hard_fail' ? 'hard_fail' : 'warning',
      severity: r.rule.severity as RuleSeverity,
      message: r.rule.message,
      ruleId: r.rule.id,
      category: r.rule.category,
    }))
}

function calcConfidence(evalResults: RuleEvaluationResult[]): number {
  if (evalResults.length === 0) return 0.5
  const passed = evalResults.filter(r => r.passed).length
  return passed / evalResults.length
}

// ─── Main Match Engine ────────────────────────────────────────────────────────

export interface MatchEngineOutput {
  results: LenderMatchResult[]
  runStats: {
    programsEvaluated: number
    greenlights: number
    reviews: number
    fails: number
  }
}

const STATUS_ORDER: Record<MatchResultStatus, number> = {
  greenlight: 0,
  review: 1,
  backend_only: 2,
  info_needed: 3,
  fail: 4,
}

export function runMatchEngine(
  input: DealStructureInput,
  programs: MatchProgramInput[]
): MatchEngineOutput {
  const calc = buildDealCalculations(input)
  const results: LenderMatchResult[] = []

  for (const program of programs) {
    const activeRules = program.rules.filter(r => r.isActive)
    const evalResults = activeRules.map(rule => evaluateRule(rule, input, calc))

    const status = determineStatus(evalResults)
    const confidence = calcConfidence(evalResults)
    const reasons = buildReasons(evalResults)
    const restructureSuggestions = buildRestructureSuggestions(evalResults, calc, input)

    const passedRules = evalResults.filter(r => r.passed).length
    const failedRules = evalResults.filter(r => !r.passed && r.rule.severity === 'hard_fail').length
    const warningRules = evalResults.filter(r => !r.passed && r.rule.severity === 'warning').length

    results.push({
      id: crypto.randomUUID(),
      matchRunId: '',
      lenderId: program.lenderId,
      programId: program.programId,
      programVersionId: program.programVersionId,
      lenderName: program.lenderName,
      programName: program.programName,
      status,
      confidence,
      reasons,
      restructureSuggestions,
      passedRules,
      failedRules,
      warningRules,
      totalRules: activeRules.length,
      createdAt: new Date().toISOString(),
    })
  }

  // Sort: greenlights (desc confidence), review, backend_only, info_needed, fail
  results.sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (statusDiff !== 0) return statusDiff
    if (a.status === 'greenlight') return b.confidence - a.confidence
    return 0
  })

  const greenlights = results.filter(r => r.status === 'greenlight').length
  const reviews = results.filter(r => r.status === 'review').length
  const fails = results.filter(r => r.status === 'fail').length

  return {
    results,
    runStats: {
      programsEvaluated: programs.length,
      greenlights,
      reviews,
      fails,
    },
  }
}
