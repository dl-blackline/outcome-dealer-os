export const FUNDING_STATUSES = [
  'pending',
  'submitted',
  'approved',
  'funded',
  'declined',
  'unwound',
] as const

export const TITLE_STATUSES = [
  'not_started',
  'pending_payoff',
  'in_process',
  'received',
  'sent_to_dmv',
  'complete',
  'exception',
] as const

export const PAYOFF_STATUSES = [
  'not_needed',
  'requested',
  'confirmed',
  'paid',
  'exception',
] as const

export const REGISTRATION_STATUSES = [
  'pending',
  'submitted',
  'in_process',
  'complete',
  'exception',
] as const

export const ACCOUNTING_STATUSES = ['open', 'posted', 'reconciled', 'exception'] as const
export const BACK_OFFICE_RECORD_STATUSES = ['active', 'complete', 'exception', 'archived'] as const
export const EXCEPTION_TYPES = [
  'funding',
  'title',
  'payoff',
  'accounting',
  'document',
  'compliance',
  'other',
] as const
export const EXCEPTION_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export const EXCEPTION_STATUSES = ['open', 'resolved'] as const

export type FundingStatus = (typeof FUNDING_STATUSES)[number]
export type TitleStatus = (typeof TITLE_STATUSES)[number]
export type PayoffStatus = (typeof PAYOFF_STATUSES)[number]
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]
export type AccountingStatus = (typeof ACCOUNTING_STATUSES)[number]
export type BackOfficeRecordStatus = (typeof BACK_OFFICE_RECORD_STATUSES)[number]
export type ExceptionType = (typeof EXCEPTION_TYPES)[number]
export type ExceptionSeverity = (typeof EXCEPTION_SEVERITIES)[number]
export type ExceptionStatus = (typeof EXCEPTION_STATUSES)[number]

export const FUNDING_STATUS_LABELS: Record<FundingStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  approved: 'Approved',
  funded: 'Funded',
  declined: 'Declined',
  unwound: 'Unwound',
}

export const TITLE_STATUS_LABELS: Record<TitleStatus, string> = {
  not_started: 'Not Started',
  pending_payoff: 'Pending Payoff',
  in_process: 'In Process',
  received: 'Title Received',
  sent_to_dmv: 'Sent to DMV',
  complete: 'Complete',
  exception: 'Exception',
}

export const PAYOFF_STATUS_LABELS: Record<PayoffStatus, string> = {
  not_needed: 'Not Needed',
  requested: 'Requested',
  confirmed: 'Confirmed',
  paid: 'Paid',
  exception: 'Exception',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  in_process: 'In Process',
  complete: 'Complete',
  exception: 'Exception',
}

export const MISSING_DOC_OPTIONS = [
  'Buyer Order',
  'Bill of Sale',
  'Retail Installment Contract',
  'Insurance Card',
  "Driver's License (Front)",
  "Driver's License (Back)",
  'Proof of Income',
  'Proof of Residence',
  'Trade Title',
  'Trade Payoff Authorization',
  'Gap Agreement',
  'VSC Contract',
  'Power of Attorney',
  'Odometer Statement',
  'Spot Delivery Agreement',
  'Credit Application',
  'Privacy Notice',
  'OFAC / Red Flag',
  'Other',
] as const

export interface BackOfficeException {
  id: string
  backOfficeRecordId: string
  type: ExceptionType
  description: string
  severity: ExceptionSeverity
  status: ExceptionStatus
  assignedTo?: string
  resolvedAt?: string
  notes?: string
  createdAt: string
}

export interface BackOfficeDealRecord {
  id: string
  dealNumber?: string
  customerName: string
  vehicle: string
  salesperson?: string
  fiManager?: string
  lender?: string
  saleDate: string
  salePrice?: number
  fundingStatus: FundingStatus
  fundingDate?: string
  fundingAmount?: number
  titleStatus: TitleStatus
  titleReceivedDate?: string
  titleSentDate?: string
  payoffStatus: PayoffStatus
  payoffAmount?: number
  payoffDueDate?: string
  payoffPaidDate?: string
  tradeVehicle?: string
  registrationStatus: RegistrationStatus
  registrationExpiry?: string
  accountingStatus: AccountingStatus
  missingDocs: string[]
  stips: string[]
  stipsCleared: string[]
  officeReviewNotes?: string
  isReadyToFinalize: boolean
  finalizedAt?: string
  finalizedBy?: string
  exceptions: BackOfficeException[]
  status: BackOfficeRecordStatus
  createdAt: string
  updatedAt?: string
}

export interface CreateBackOfficeDealInput {
  dealNumber?: string
  customerName: string
  vehicle: string
  salesperson?: string
  fiManager?: string
  lender?: string
  saleDate: string
  salePrice?: number
  tradeVehicle?: string
  missingDocs?: string[]
  stips?: string[]
}
