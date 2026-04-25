import { CreditTier, DealStructureInput } from './finance-match.types'

// ─── Calculated Deal Metrics ──────────────────────────────────────────────────

export interface DealCalculations {
  vehicleAge: number
  amountFinanced: number
  frontEndAdvance: number
  netTradeEquity: number
  ltv: number
  pti: number
  dti: number
  ndi: number
  totalBackend: number
  creditTier: CreditTier

  // Closure helpers
  cashDownNeededForTargetLtv: (targetLtv: number) => number
  maxAmountFinancedByLtv: (maxLtv: number) => number
  maxPaymentByPti: (maxPti: number) => number
}

// ─── Pure Calculations ────────────────────────────────────────────────────────

export function calcVehicleAge(vehicleYear?: number): number {
  const currentYear = new Date().getFullYear()
  if (!vehicleYear) return 0
  return currentYear - vehicleYear
}

export function calcNetTradeEquity(input: DealStructureInput): number {
  const tradeValue = input.tradeValue ?? 0
  const tradePayoff = input.tradePayoff ?? 0
  return tradeValue - tradePayoff
}

export function calcAmountFinanced(input: DealStructureInput): number {
  const salesPrice = input.salesPrice ?? 0
  const taxes = input.taxes ?? 0
  const titleLicenseFees = input.titleLicenseFees ?? 0
  const docFee = input.docFee ?? 0
  const cashDown = input.cashDown ?? 0
  const tradePayoff = input.tradePayoff ?? 0
  const tradeEquity = input.tradeEquity ?? calcNetTradeEquity(input)
  const gapPrice = input.gapPrice ?? 0
  const vscPrice = input.vscPrice ?? 0
  const maintenancePrice = input.maintenancePrice ?? 0
  const otherBackendPrice = input.otherBackendPrice ?? 0

  return (
    salesPrice +
    taxes +
    titleLicenseFees +
    docFee -
    cashDown +
    (tradePayoff - tradeEquity) +
    gapPrice +
    vscPrice +
    maintenancePrice +
    otherBackendPrice
  )
}

export function calcFrontEndAdvance(input: DealStructureInput): number {
  const salesPrice = input.salesPrice ?? 0
  const taxes = input.taxes ?? 0
  const titleLicenseFees = input.titleLicenseFees ?? 0
  const docFee = input.docFee ?? 0
  const cashDown = input.cashDown ?? 0
  const netTradeEquity = calcNetTradeEquity(input)

  return salesPrice + taxes + titleLicenseFees + docFee - cashDown + netTradeEquity
}

export function calcLtv(input: DealStructureInput): number {
  const amountFinanced = calcAmountFinanced(input)
  const bookValue = input.bookValue ?? input.retailValue ?? 0
  if (bookValue === 0) return 0
  return amountFinanced / bookValue
}

export function calcPti(input: DealStructureInput): number {
  const monthlyGrossIncome = input.monthlyGrossIncome ?? 0
  if (monthlyGrossIncome === 0) return 0
  return (input.proposedMonthlyPayment ?? 0) / monthlyGrossIncome
}

export function calcDti(input: DealStructureInput): number {
  const monthlyGrossIncome = input.monthlyGrossIncome ?? 0
  if (monthlyGrossIncome === 0) return 0
  const existingDebt = input.existingMonthlyDebt ?? 0
  const payment = input.proposedMonthlyPayment ?? 0
  return (existingDebt + payment) / monthlyGrossIncome
}

export function calcNdi(input: DealStructureInput): number {
  const monthlyGrossIncome = input.monthlyGrossIncome ?? 0
  const monthlyRentMortgage = input.monthlyRentMortgage ?? 0
  const existingMonthlyDebt = input.existingMonthlyDebt ?? 0
  const proposedMonthlyPayment = input.proposedMonthlyPayment ?? 0
  return monthlyGrossIncome - monthlyRentMortgage - existingMonthlyDebt - proposedMonthlyPayment
}

export function calcTotalBackend(input: DealStructureInput): number {
  return (
    (input.gapPrice ?? 0) +
    (input.vscPrice ?? 0) +
    (input.maintenancePrice ?? 0) +
    (input.otherBackendPrice ?? 0)
  )
}

export function normalizeCreditTier(score?: number): CreditTier {
  if (!score) return 'F'
  if (score >= 750) return 'A'
  if (score >= 700) return 'B'
  if (score >= 650) return 'C'
  if (score >= 600) return 'D'
  if (score >= 550) return 'E'
  return 'F'
}

/**
 * Standard amortization payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
 * where P = principal, r = monthly rate, n = term in months
 */
export function estimatePayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0
  if (annualRate <= 0) return principal / termMonths

  const monthlyRate = annualRate / 12 / 100
  const factor = Math.pow(1 + monthlyRate, termMonths)
  return (principal * monthlyRate * factor) / (factor - 1)
}

// ─── Main Calculation Aggregator ──────────────────────────────────────────────

export function buildDealCalculations(input: DealStructureInput): DealCalculations {
  const amountFinanced = calcAmountFinanced(input)
  const bookValue = input.bookValue ?? input.retailValue ?? 0
  const ltv = calcLtv(input)
  const monthlyGrossIncome = input.monthlyGrossIncome ?? 0

  const cashDownNeededForTargetLtv = (targetLtv: number): number => {
    const targetAmount = targetLtv * bookValue
    const needed = amountFinanced - targetAmount
    return Math.max(0, needed)
  }

  const maxAmountFinancedByLtv = (maxLtv: number): number => {
    return maxLtv * bookValue
  }

  const maxPaymentByPti = (maxPti: number): number => {
    return maxPti * monthlyGrossIncome
  }

  return {
    vehicleAge: calcVehicleAge(input.vehicleYear),
    amountFinanced,
    frontEndAdvance: calcFrontEndAdvance(input),
    netTradeEquity: calcNetTradeEquity(input),
    ltv,
    pti: calcPti(input),
    dti: calcDti(input),
    ndi: calcNdi(input),
    totalBackend: calcTotalBackend(input),
    creditTier: normalizeCreditTier(input.creditScore),
    cashDownNeededForTargetLtv,
    maxAmountFinancedByLtv,
    maxPaymentByPti,
  }
}
