import { UUID } from '@/types/common'

export const CREDIT_SCORE_RANGES = [
  'under_550',
  '550_599',
  '600_649',
  '650_699',
  '700_749',
  '750_plus',
] as const

export type CreditScoreRange = typeof CREDIT_SCORE_RANGES[number]

export const HOUSING_STATUSES = ['rent', 'own', 'mortgage', 'family', 'other'] as const
export type HousingStatus = typeof HOUSING_STATUSES[number]

export const EMPLOYMENT_STATUSES = ['full_time', 'part_time', 'self_employed', 'retired', 'unemployed', 'other'] as const
export type EmploymentStatus = typeof EMPLOYMENT_STATUSES[number]

export const REQUIRED_DOCUMENT_TYPES = [
  'proof_of_income',
  'proof_of_residency',
  'references',
  'proof_of_insurance',
  'driver_license',
  'primary_proof_of_income',
  'primary_proof_of_residency',
  'co_applicant_proof_of_income',
  'co_applicant_proof_of_residency',
] as const

export type RequiredDocumentType = typeof REQUIRED_DOCUMENT_TYPES[number]
export type CreditApplicationType = 'individual' | 'joint'

export interface DurationAtAddressOrEmployer {
  years: number
  months: number
}

export interface ResidenceInfo {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  zip: string
  housingStatus: HousingStatus
  housingStatusOther?: string
  monthlyHousingPayment?: number
  timeAtResidence: DurationAtAddressOrEmployer
}

export interface EmploymentInfo {
  employerName: string
  occupationTitle: string
  employmentStatus: EmploymentStatus
  employmentStatusOther?: string
  grossMonthlyIncome?: number
  annualIncome?: number
  timeAtEmployer: DurationAtAddressOrEmployer
}

export interface ApplicantIdentity {
  fullLegalName: string
  dateOfBirth?: string
  phone: string
  email: string
  driverLicenseNumber?: string
  ssnLast4: string
  ssnTokenRef: string
}

export interface CreditApplicantProfile {
  identity: ApplicantIdentity
  currentResidence: ResidenceInfo
  previousResidence?: ResidenceInfo
  currentEmployment: EmploymentInfo
  previousEmployment?: EmploymentInfo
  creditScoreRange: CreditScoreRange
}

export interface FinanceCreditApplicationRow {
  id: UUID
  lead_id?: UUID
  customer_id?: UUID
  quick_app_submission_id?: UUID
  application_type?: CreditApplicationType
  primary_applicant_json?: CreditApplicantProfile
  co_applicant_json?: CreditApplicantProfile
  applicant_json?: ApplicantIdentity
  current_residence_json?: ResidenceInfo
  previous_residence_json?: ResidenceInfo
  current_employment_json?: EmploymentInfo
  previous_employment_json?: EmploymentInfo
  credit_score_range: CreditScoreRange
  required_documents: RequiredDocumentType[]
  uploaded_documents: RequiredDocumentType[]
  application_status: 'submitted' | 'documents_pending' | 'under_review' | 'ready_for_review'
  completeness_status: 'incomplete' | 'docs_missing' | 'ready'
  missing_documents: RequiredDocumentType[]
  created_at: string
  updated_at?: string
}

export interface FinanceCreditApplication {
  id: UUID
  leadId?: UUID
  customerId?: UUID
  quickAppSubmissionId?: UUID
  applicationType: CreditApplicationType
  primaryApplicant: CreditApplicantProfile
  coApplicant?: CreditApplicantProfile
  applicant: ApplicantIdentity
  currentResidence: ResidenceInfo
  previousResidence?: ResidenceInfo
  currentEmployment: EmploymentInfo
  previousEmployment?: EmploymentInfo
  creditScoreRange: CreditScoreRange
  requiredDocuments: RequiredDocumentType[]
  uploadedDocuments: RequiredDocumentType[]
  applicationStatus: 'submitted' | 'documents_pending' | 'under_review' | 'ready_for_review'
  completenessStatus: 'incomplete' | 'docs_missing' | 'ready'
  missingDocuments: RequiredDocumentType[]
  createdAt: string
  updatedAt?: string
}

export interface FinanceApplicationDocumentRow {
  id: UUID
  application_id: UUID
  lead_id?: UUID
  customer_id?: UUID
  document_type: RequiredDocumentType
  file_name: string
  mime_type: string
  file_size_bytes: number
  storage_ref: string
  uploaded_by_actor_type: 'user' | 'agent' | 'system'
  upload_status: 'uploaded' | 'rejected'
  rejection_reason?: string
  created_at: string
  updated_at?: string
}

export interface FinanceApplicationDocument {
  id: UUID
  applicationId: UUID
  leadId?: UUID
  customerId?: UUID
  documentType: RequiredDocumentType
  fileName: string
  mimeType: string
  fileSizeBytes: number
  storageRef: string
  uploadedByActorType: 'user' | 'agent' | 'system'
  uploadStatus: 'uploaded' | 'rejected'
  rejectionReason?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateFinanceApplicationInput {
  leadId?: UUID
  customerId?: UUID
  quickAppSubmissionId?: UUID
  applicationType: CreditApplicationType
  primaryApplicant: {
    identity: {
      fullLegalName: string
      dateOfBirth?: string
      phone: string
      email: string
      driverLicenseNumber?: string
      ssnRaw: string
    }
    currentResidence: ResidenceInfo
    previousResidence?: ResidenceInfo
    currentEmployment: EmploymentInfo
    previousEmployment?: EmploymentInfo
    creditScoreRange: CreditScoreRange
  }
  coApplicant?: {
    identity: {
      fullLegalName: string
      dateOfBirth?: string
      phone: string
      email: string
      driverLicenseNumber?: string
      ssnRaw: string
    }
    currentResidence: ResidenceInfo
    previousResidence?: ResidenceInfo
    currentEmployment: EmploymentInfo
    previousEmployment?: EmploymentInfo
    creditScoreRange: CreditScoreRange
  }
}

export interface UploadFinanceDocumentInput {
  applicationId: UUID
  leadId?: UUID
  customerId?: UUID
  documentType: RequiredDocumentType
  fileName: string
  mimeType: string
  fileSizeBytes: number
  uploadedByActorType: 'user' | 'agent' | 'system'
}

export function mapFinanceCreditApplicationRowToDomain(row: FinanceCreditApplicationRow): FinanceCreditApplication {
  const legacyIdentity = row.applicant_json
  const legacyCurrentResidence = row.current_residence_json
  const legacyCurrentEmployment = row.current_employment_json

  const primaryApplicant: CreditApplicantProfile = row.primary_applicant_json || {
    identity: legacyIdentity!,
    currentResidence: legacyCurrentResidence!,
    previousResidence: row.previous_residence_json,
    currentEmployment: legacyCurrentEmployment!,
    previousEmployment: row.previous_employment_json,
    creditScoreRange: row.credit_score_range,
  }

  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    quickAppSubmissionId: row.quick_app_submission_id,
    applicationType: row.application_type || (row.co_applicant_json ? 'joint' : 'individual'),
    primaryApplicant,
    coApplicant: row.co_applicant_json,
    applicant: primaryApplicant.identity,
    currentResidence: primaryApplicant.currentResidence,
    previousResidence: primaryApplicant.previousResidence,
    currentEmployment: primaryApplicant.currentEmployment,
    previousEmployment: primaryApplicant.previousEmployment,
    creditScoreRange: row.credit_score_range,
    requiredDocuments: row.required_documents,
    uploadedDocuments: row.uploaded_documents,
    applicationStatus: row.application_status,
    completenessStatus: row.completeness_status,
    missingDocuments: row.missing_documents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapFinanceApplicationDocumentRowToDomain(row: FinanceApplicationDocumentRow): FinanceApplicationDocument {
  return {
    id: row.id,
    applicationId: row.application_id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    documentType: row.document_type,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    storageRef: row.storage_ref,
    uploadedByActorType: row.uploaded_by_actor_type,
    uploadStatus: row.upload_status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
