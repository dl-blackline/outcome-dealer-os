import { describe, it, expect } from 'vitest'
import {
  calcVehicleAge,
  calcNetTradeEquity,
  calcAmountFinanced,
  calcLtv,
  calcPti,
  calcDti,
  calcNdi,
  calcTotalBackend,
  normalizeCreditTier,
  estimatePayment,
  buildDealCalculations,
} from '@/domains/finance-match/finance-match.calculations'

describe('calcVehicleAge', () => {
  it('returns age based on current year', () => {
    const currentYear = new Date().getFullYear()
    expect(calcVehicleAge(currentYear)).toBe(0)
    expect(calcVehicleAge(currentYear - 5)).toBe(5)
  })

  it('returns 0 for undefined year', () => {
    expect(calcVehicleAge(undefined)).toBe(0)
  })
})

describe('calcNetTradeEquity', () => {
  it('returns net equity (value minus payoff)', () => {
    expect(calcNetTradeEquity({ tradeValue: 10000, tradePayoff: 7000 })).toBe(3000)
  })

  it('returns negative equity when payoff exceeds value', () => {
    expect(calcNetTradeEquity({ tradeValue: 5000, tradePayoff: 8000 })).toBe(-3000)
  })

  it('handles undefined inputs', () => {
    expect(calcNetTradeEquity({})).toBe(0)
    expect(calcNetTradeEquity({ tradeValue: 10000 })).toBe(10000)
  })
})

describe('calcAmountFinanced', () => {
  it('computes financed amount correctly', () => {
    const input = {
      salesPrice: 20000,
      taxes: 1500,
      titleLicenseFees: 350,
      docFee: 500,
      gapPrice: 800,
      cashDown: 1000,
      tradeValue: 5000,
      tradePayoff: 4000,
    }
    const result = calcAmountFinanced(input)
    // salesPrice + taxes + fees + docFee + backend - cashDown - netTradeEquity
    expect(result).toBeGreaterThan(0)
  })

  it('returns 0 when sales price is not set', () => {
    expect(calcAmountFinanced({})).toBe(0)
  })
})

describe('calcLtv', () => {
  it('returns LTV ratio', () => {
    const input = { salesPrice: 20000, bookValue: 20000, cashDown: 2000 }
    const ltv = calcLtv(input)
    expect(ltv).toBeGreaterThan(0)
    expect(ltv).toBeLessThanOrEqual(1.2)
  })

  it('returns 0 when book value is not set', () => {
    expect(calcLtv({ salesPrice: 20000 })).toBe(0)
  })
})

describe('calcPti', () => {
  it('returns PTI ratio', () => {
    const input = { proposedMonthlyPayment: 500, monthlyGrossIncome: 5000 }
    expect(calcPti(input)).toBeCloseTo(0.1)
  })

  it('returns 0 when income is undefined or zero', () => {
    expect(calcPti({ proposedMonthlyPayment: 500 })).toBe(0)
  })
})

describe('calcDti', () => {
  it('returns DTI ratio including payment and existing debt', () => {
    const input = {
      proposedMonthlyPayment: 500,
      existingMonthlyDebt: 300,
      monthlyGrossIncome: 5000,
    }
    expect(calcDti(input)).toBeCloseTo(0.16)
  })

  it('handles missing inputs gracefully', () => {
    expect(calcDti({})).toBe(0)
  })
})

describe('calcNdi', () => {
  it('returns net disposable income', () => {
    const input = {
      monthlyGrossIncome: 5000,
      proposedMonthlyPayment: 500,
      monthlyRentMortgage: 1200,
      existingMonthlyDebt: 300,
    }
    const ndi = calcNdi(input)
    expect(ndi).toBe(5000 - 500 - 1200 - 300)
  })

  it('handles undefined inputs', () => {
    expect(calcNdi({ monthlyGrossIncome: 5000 })).toBe(5000)
  })
})

describe('calcTotalBackend', () => {
  it('sums all backend products', () => {
    const input = { gapPrice: 800, vscPrice: 1500, maintenancePrice: 400, otherBackendPrice: 200 }
    expect(calcTotalBackend(input)).toBe(2900)
  })

  it('returns 0 for all undefined', () => {
    expect(calcTotalBackend({})).toBe(0)
  })
})

describe('normalizeCreditTier', () => {
  it('classifies credit scores correctly', () => {
    expect(normalizeCreditTier(780)).toBe('A')
    expect(normalizeCreditTier(720)).toBe('B')
    expect(normalizeCreditTier(670)).toBe('C')
    expect(normalizeCreditTier(620)).toBe('D')
    expect(normalizeCreditTier(555)).toBe('E')
    expect(normalizeCreditTier(500)).toBe('F')
  })

  it('handles undefined', () => {
    expect(normalizeCreditTier(undefined)).toBe('F')
  })
})

describe('estimatePayment', () => {
  it('returns monthly payment for simple loan (rate as percent)', () => {
    // annualRate is passed as percent e.g. 6.9 means 6.9%
    const payment = estimatePayment(20000, 6.9, 72)
    expect(payment).toBeGreaterThan(300)
    expect(payment).toBeLessThan(450)
  })

  it('returns principal / term for zero-rate loan', () => {
    const payment = estimatePayment(12000, 0, 60)
    expect(payment).toBeCloseTo(200)
  })
})

describe('buildDealCalculations', () => {
  it('returns all calculated fields', () => {
    const input = {
      creditScore: 720,
      monthlyGrossIncome: 5000,
      salesPrice: 20000,
      cashDown: 2000,
      bookValue: 18000,
      proposedMonthlyPayment: 450,
      proposedTerm: 72,
      proposedRate: 6.9,
    }
    const calc = buildDealCalculations(input)
    expect(calc.ltv).toBeGreaterThan(0)
    expect(calc.pti).toBeGreaterThan(0)
    expect(calc.amountFinanced).toBeGreaterThan(0)
    expect(calc.creditTier).toBe('B')
  })

  it('handles empty input without throwing', () => {
    const calc = buildDealCalculations({})
    expect(calc.ltv).toBe(0)
    expect(calc.pti).toBe(0)
    expect(calc.amountFinanced).toBe(0)
    expect(calc.creditTier).toBe('F')
  })
})

