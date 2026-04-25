import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

// ─── Enums & Unions ───────────────────────────────────────────────────────────

export type LenderType = 'bank' | 'credit_union' | 'finance_company' | 'captive' | 'other'

export type ProgramVersionStatus = 'draft' | 'pending_review' | 'active' | 'archived'

export type ExtractionMethod = 'manual' | 'ai_extracted' | 'api_feed'

export type DocumentType = 'rate_sheet' | 'guidelines' | 'addendum' | 'bulletin' | 'other'

export type DocumentProcessingStatus = 'pending' | 'processing' | 'extracted' | 'failed' | 'approved'

export type MatchResultStatus = 'greenlight' | 'review' | 'fail' | 'backend_only' | 'info_needed'

export type RuleSeverity = 'hard_fail' | 'warning' | 'info'

export type RuleOperator =
  | 'eq'
  | 'ne'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains'

export type RuleCategory =
  | 'credit_score'
  | 'ltv'
  | 'pti'
  | 'dti'
  | 'income'
  | 'vehicle_age'
  | 'mileage'
  | 'vehicle_type'
  | 'title_type'
  | 'term'
  | 'backend'
  | 'state_territory'
  | 'bankruptcy'
  | 'repossession'
  | 'employment'
  | 'other'

export type ProcessingJobStatus =
  | 'pending'
  | 'processing'
  | 'extracted'
  | 'needs_review'
  | 'failed'
  | 'approved'
  | 'rejected'

export type CreditTier = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

// ─── Row Types (DB shape) ─────────────────────────────────────────────────────

export interface LenderRow extends DbRow {
  name: string
  short_name?: string
  lender_type: LenderType
  is_active: boolean
  notes?: string
  website?: string
  phone?: string
  portal_url?: string
}

export interface LenderProgramRow extends DbRow {
  lender_id: UUID
  program_name: string
  program_code?: string
  is_active: boolean
  description?: string
  target_tier?: string
}

export interface LenderProgramVersionRow extends DbRow {
  program_id: UUID
  version_label: string
  effective_date?: string
  expiration_date?: string
  status: ProgramVersionStatus
  approved_by?: string
  approved_at?: string
  source_document_url?: string
  extraction_method?: ExtractionMethod
  extraction_confidence?: number
  needs_review: boolean
  notes?: string
}

export interface LenderProgramDocumentRow extends DbRow {
  program_id: UUID
  version_id?: UUID
  document_type: DocumentType
  file_name: string
  file_url?: string
  uploaded_by?: string
  effective_date?: string
  expiration_date?: string
  processing_status: DocumentProcessingStatus
}

export interface LenderRuleRow extends DbRow {
  program_version_id: UUID
  rule_name: string
  category: RuleCategory
  field: string
  operator: RuleOperator
  value: unknown
  severity: RuleSeverity
  message: string
  is_active: boolean
  is_ai_generated: boolean
  needs_review: boolean
  confidence?: number
  explanation?: string
  sort_order: number
}

export interface LenderContactRow extends DbRow {
  lender_id: UUID
  name: string
  title?: string
  email?: string
  phone?: string
  is_primary: boolean
  notes?: string
}

export interface LenderMatchRunRow extends DbRow {
  deal_id?: string
  run_by_user_id?: string
  input_snapshot: Record<string, unknown>
  calculated_ltv?: number
  calculated_pti?: number
  calculated_dti?: number
  calculated_amount_financed?: number
  calculated_total_backend?: number
  programs_evaluated: number
  greenlights: number
  reviews: number
  fails: number
  run_at: string
}

export interface LenderMatchResultRow extends DbRow {
  match_run_id: UUID
  lender_id: UUID
  program_id: UUID
  program_version_id: UUID
  status: MatchResultStatus
  confidence: number
  reasons: MatchReason[]
  restructure_suggestions: RestructureSuggestion[]
  passed_rules: number
  failed_rules: number
  warning_rules: number
  total_rules: number
}

export interface UploadedProgramJobRow extends DbRow {
  document_id?: UUID
  status: ProcessingJobStatus
  extracted_data?: Record<string, unknown>
  extracted_rules: Partial<LenderRuleRow>[]
  approved_rules: Partial<LenderRuleRow>[]
  reviewed_by?: string
  reviewed_at?: string
  error_message?: string
}

// ─── Domain Types (camelCase) ─────────────────────────────────────────────────

export interface Lender {
  id: UUID
  name: string
  shortName?: string
  lenderType: LenderType
  isActive: boolean
  notes?: string
  website?: string
  phone?: string
  portalUrl?: string
  createdAt: string
  updatedAt?: string
}

export interface LenderProgram {
  id: UUID
  lenderId: UUID
  programName: string
  programCode?: string
  isActive: boolean
  description?: string
  targetTier?: string
  createdAt: string
  updatedAt?: string
}

export interface LenderProgramVersion {
  id: UUID
  programId: UUID
  versionLabel: string
  effectiveDate?: string
  expirationDate?: string
  status: ProgramVersionStatus
  approvedBy?: string
  approvedAt?: string
  sourceDocumentUrl?: string
  extractionMethod?: ExtractionMethod
  extractionConfidence?: number
  needsReview: boolean
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface LenderProgramDocument {
  id: UUID
  programId: UUID
  versionId?: UUID
  documentType: DocumentType
  fileName: string
  fileUrl?: string
  uploadedBy?: string
  effectiveDate?: string
  expirationDate?: string
  processingStatus: DocumentProcessingStatus
  createdAt: string
  updatedAt?: string
}

export interface LenderRule {
  id: UUID
  programVersionId: UUID
  ruleName: string
  category: RuleCategory
  field: string
  operator: RuleOperator
  value: unknown
  severity: RuleSeverity
  message: string
  isActive: boolean
  isAiGenerated: boolean
  needsReview: boolean
  confidence?: number
  explanation?: string
  sortOrder: number
  createdAt: string
  updatedAt?: string
}

export interface LenderContact {
  id: UUID
  lenderId: UUID
  name: string
  title?: string
  email?: string
  phone?: string
  isPrimary: boolean
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface MatchReason {
  type: string
  severity: RuleSeverity
  message: string
  ruleId?: string
  category?: RuleCategory
  suggestedFix?: string
}

export interface RestructureSuggestion {
  type: string
  description: string
  value?: number
  priority: number
}

export interface LenderMatchRun {
  id: UUID
  dealId?: string
  runByUserId?: string
  inputSnapshot: DealStructureInput
  calculatedLtv?: number
  calculatedPti?: number
  calculatedDti?: number
  calculatedAmountFinanced?: number
  calculatedTotalBackend?: number
  programsEvaluated: number
  greenlights: number
  reviews: number
  fails: number
  runAt: string
  createdAt: string
  updatedAt?: string
}

export interface LenderMatchResult {
  id: UUID
  matchRunId: UUID
  lenderId: UUID
  programId: UUID
  programVersionId: UUID
  lenderName: string
  programName: string
  status: MatchResultStatus
  confidence: number
  reasons: MatchReason[]
  restructureSuggestions: RestructureSuggestion[]
  passedRules: number
  failedRules: number
  warningRules: number
  totalRules: number
  createdAt: string
  updatedAt?: string
}

export interface UploadedProgramJob {
  id: UUID
  documentId?: UUID
  status: ProcessingJobStatus
  extractedData?: Record<string, unknown>
  extractedRules: Partial<LenderRule>[]
  approvedRules: Partial<LenderRule>[]
  reviewedBy?: string
  reviewedAt?: string
  errorMessage?: string
  createdAt: string
  updatedAt?: string
}

// ─── Deal Structure Input ─────────────────────────────────────────────────────

export interface DealStructureInput {
  // Customer / Credit
  firstName?: string
  lastName?: string
  creditScore?: number
  creditTier?: CreditTier
  monthlyGrossIncome?: number
  monthlyRentMortgage?: number
  existingMonthlyDebt?: number
  employmentStatus?: 'employed' | 'self_employed' | 'retired' | 'other'
  monthsOnJob?: number
  hasBankruptcy?: boolean
  bankruptcyDischargeDate?: string
  hasRepossession?: boolean
  repossessionDate?: string
  state?: string

  // Vehicle
  vehicleYear?: number
  vehicleMake?: string
  vehicleModel?: string
  vehicleVin?: string
  vehicleType?: 'new' | 'used' | 'certified'
  vehicleMileage?: number
  titleType?: 'clean' | 'salvage' | 'rebuilt' | 'flood' | 'lemon' | 'other'
  bookValue?: number
  retailValue?: number

  // Deal Structure
  salesPrice?: number
  cashDown?: number
  tradeValue?: number
  tradePayoff?: number
  tradeEquity?: number
  taxes?: number
  titleLicenseFees?: number
  docFee?: number
  proposedMonthlyPayment?: number
  proposedTerm?: number
  proposedRate?: number

  // Backend Products
  gapPrice?: number
  vscPrice?: number
  maintenancePrice?: number
  otherBackendPrice?: number

  // Deal reference
  dealId?: string
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function mapLenderRow(row: LenderRow): Lender {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    lenderType: row.lender_type,
    isActive: row.is_active,
    notes: row.notes,
    website: row.website,
    phone: row.phone,
    portalUrl: row.portal_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderProgramRow(row: LenderProgramRow): LenderProgram {
  return {
    id: row.id,
    lenderId: row.lender_id,
    programName: row.program_name,
    programCode: row.program_code,
    isActive: row.is_active,
    description: row.description,
    targetTier: row.target_tier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderProgramVersionRow(row: LenderProgramVersionRow): LenderProgramVersion {
  return {
    id: row.id,
    programId: row.program_id,
    versionLabel: row.version_label,
    effectiveDate: row.effective_date,
    expirationDate: row.expiration_date,
    status: row.status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    sourceDocumentUrl: row.source_document_url,
    extractionMethod: row.extraction_method,
    extractionConfidence: row.extraction_confidence,
    needsReview: row.needs_review,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderRuleRow(row: LenderRuleRow): LenderRule {
  return {
    id: row.id,
    programVersionId: row.program_version_id,
    ruleName: row.rule_name,
    category: row.category,
    field: row.field,
    operator: row.operator,
    value: row.value,
    severity: row.severity,
    message: row.message,
    isActive: row.is_active,
    isAiGenerated: row.is_ai_generated,
    needsReview: row.needs_review,
    confidence: row.confidence,
    explanation: row.explanation,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderContactRow(row: LenderContactRow): LenderContact {
  return {
    id: row.id,
    lenderId: row.lender_id,
    name: row.name,
    title: row.title,
    email: row.email,
    phone: row.phone,
    isPrimary: row.is_primary,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderMatchRunRow(row: LenderMatchRunRow): LenderMatchRun {
  return {
    id: row.id,
    dealId: row.deal_id,
    runByUserId: row.run_by_user_id,
    inputSnapshot: row.input_snapshot as unknown as DealStructureInput,
    calculatedLtv: row.calculated_ltv,
    calculatedPti: row.calculated_pti,
    calculatedDti: row.calculated_dti,
    calculatedAmountFinanced: row.calculated_amount_financed,
    calculatedTotalBackend: row.calculated_total_backend,
    programsEvaluated: row.programs_evaluated,
    greenlights: row.greenlights,
    reviews: row.reviews,
    fails: row.fails,
    runAt: row.run_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderMatchResultRow(
  row: LenderMatchResultRow,
  lenderName: string,
  programName: string
): LenderMatchResult {
  return {
    id: row.id,
    matchRunId: row.match_run_id,
    lenderId: row.lender_id,
    programId: row.program_id,
    programVersionId: row.program_version_id,
    lenderName,
    programName,
    status: row.status,
    confidence: row.confidence,
    reasons: row.reasons,
    restructureSuggestions: row.restructure_suggestions,
    passedRules: row.passed_rules,
    failedRules: row.failed_rules,
    warningRules: row.warning_rules,
    totalRules: row.total_rules,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapUploadedProgramJobRow(row: UploadedProgramJobRow): UploadedProgramJob {
  return {
    id: row.id,
    documentId: row.document_id,
    status: row.status,
    extractedData: row.extracted_data,
    extractedRules: row.extracted_rules as Partial<LenderRule>[],
    approvedRules: row.approved_rules as Partial<LenderRule>[],
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
