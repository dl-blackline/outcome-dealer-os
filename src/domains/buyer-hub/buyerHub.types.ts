import { UUID } from '@/types/common'

/** Shopping session state for anonymous or identified customers */
export interface CustomerShoppingSession {
  sessionId: string
  customerId?: UUID
  householdId?: UUID
  savedUnitIds: string[]
  compareUnitIds: string[]
  lastActivityAt: string
}

/** Customer-safe status labels projected from internal state */
export type CustomerVisibleStatus =
  | 'inquiry_received'
  | 'awaiting_contact'
  | 'appointment_scheduled'
  | 'appointment_confirmed'
  | 'application_started'
  | 'application_submitted'
  | 'application_under_review'
  | 'trade_info_received'
  | 'next_step_available'

export interface CustomerProgressItem {
  id: string
  type: 'inquiry' | 'appointment' | 'application' | 'trade_in'
  status: CustomerVisibleStatus
  title: string
  description: string
  nextAction?: string
  linkedUnitId?: UUID
  createdAt: string
  updatedAt: string
}

/** Inquiry form submission from buyer hub */
export interface InquirySubmission {
  firstName: string
  lastName: string
  email: string
  phone?: string
  unitId?: UUID
  message?: string
  preferredContact: 'email' | 'phone' | 'sms'
}

/** Quick app submission from buyer hub */
export interface QuickAppSubmission {
  fullLegalName: string
  email: string
  phone: string
  dateOfBirth: string
  ssnRaw: string
  driverLicenseNumber?: string
  currentAddressLine1: string
  currentAddressLine2?: string
  currentCity: string
  currentState: string
  currentZip: string
  housingStatus: 'rent' | 'own' | 'mortgage' | 'family' | 'other'
  housingStatusOther?: string
  monthlyHousingPayment?: number
  residenceYears: number
  residenceMonths: number
  previousResidenceAddressLine1?: string
  previousResidenceAddressLine2?: string
  previousResidenceCity?: string
  previousResidenceState?: string
  previousResidenceZip?: string
  previousHousingStatus?: 'rent' | 'own' | 'mortgage' | 'family' | 'other'
  previousHousingStatusOther?: string
  previousMonthlyHousingPayment?: number
  previousResidenceYears?: number
  previousResidenceMonths?: number
  employerName: string
  occupationTitle: string
  employmentStatus: 'full_time' | 'part_time' | 'self_employed' | 'retired' | 'unemployed' | 'other'
  employmentStatusOther?: string
  grossMonthlyIncome?: number
  annualIncome?: number
  employerYears: number
  employerMonths: number
  previousEmployerName?: string
  previousOccupationTitle?: string
  previousEmployerYears?: number
  previousEmployerMonths?: number
  previousEmployerGrossMonthlyIncome?: number
  previousEmployerAnnualIncome?: number
  creditScoreRange: 'under_550' | '550_599' | '600_649' | '650_699' | '700_749' | '750_plus'
  unitId?: UUID
}

/** Trade-in submission from buyer hub */
export interface TradeInSubmission {
  year: number
  make: string
  model: string
  trim?: string
  mileage: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  vin?: string
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  linkedUnitId?: UUID
}

/** Appointment request from buyer hub */
export interface AppointmentRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  preferredDate: string
  preferredTime: string
  type: 'test_drive' | 'consultation' | 'delivery'
  unitId?: UUID
  notes?: string
}

/** Payment estimate parameters (not final terms) */
export interface PaymentEstimateParams {
  vehiclePrice: number
  downPayment: number
  tradeValue: number
  termMonths: number
  interestRate: number
}

export interface PaymentEstimateResult {
  monthlyPayment: number
  totalCost: number
  disclaimer: string
}

/** Compute a simple payment estimate */
export function computePaymentEstimate(params: PaymentEstimateParams): PaymentEstimateResult {
  const principal = params.vehiclePrice - params.downPayment - params.tradeValue
  const monthlyRate = params.interestRate / 100 / 12
  let monthlyPayment: number
  if (monthlyRate === 0) {
    monthlyPayment = principal / params.termMonths
  } else {
    monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, params.termMonths))) /
      (Math.pow(1 + monthlyRate, params.termMonths) - 1)
  }
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalCost: Math.round(monthlyPayment * params.termMonths * 100) / 100,
    disclaimer:
      'This is an estimate only. Actual terms depend on credit approval, lender conditions, and final deal structure. This is not a binding offer.',
  }
}
