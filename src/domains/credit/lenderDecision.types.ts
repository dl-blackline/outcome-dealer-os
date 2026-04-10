import { UUID } from '@/types/common'

export interface LenderDecisionRow {
  id: UUID
  credit_app_id: UUID
  lender_name: string
  decision_status: string
  approval_terms_json: Record<string, unknown>
  stip_status: string
  missing_items_json: string[]
  confidence_notes?: string
  created_at: string
  updated_at?: string
}

export interface ApprovalTerms {
  approvedAmount?: number
  rate?: number
  term?: number
  advancePercentage?: number
  backendCap?: number
  monthlyPayment?: number
  [key: string]: unknown
}

export interface LenderDecision {
  id: UUID
  creditAppId: UUID
  lenderName: string
  decisionStatus: 'approved' | 'countered' | 'declined' | 'pending' | 'conditional'
  approvalTerms: ApprovalTerms
  stipStatus: 'none' | 'pending' | 'satisfied' | 'overdue'
  missingItems: string[]
  confidenceNotes?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateLenderDecisionInput {
  creditAppId: UUID
  lenderName: string
  decisionStatus: 'approved' | 'countered' | 'declined' | 'pending' | 'conditional'
  approvalTerms?: ApprovalTerms
  stipStatus?: 'none' | 'pending' | 'satisfied' | 'overdue'
  missingItems?: string[]
  confidenceNotes?: string
}

export interface UpdateLenderDecisionInput {
  decisionStatus?: 'approved' | 'countered' | 'declined' | 'pending' | 'conditional'
  approvalTerms?: ApprovalTerms
  stipStatus?: 'none' | 'pending' | 'satisfied' | 'overdue'
  missingItems?: string[]
  confidenceNotes?: string
}

export function mapLenderDecisionRowToDomain(row: LenderDecisionRow): LenderDecision {
  return {
    id: row.id,
    creditAppId: row.credit_app_id,
    lenderName: row.lender_name,
    decisionStatus: row.decision_status as LenderDecision['decisionStatus'],
    approvalTerms: row.approval_terms_json as ApprovalTerms,
    stipStatus: row.stip_status as LenderDecision['stipStatus'],
    missingItems: row.missing_items_json,
    confidenceNotes: row.confidence_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLenderDecisionToRow(
  domain: Partial<LenderDecision>
): Partial<Omit<LenderDecisionRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    credit_app_id: domain.creditAppId,
    lender_name: domain.lenderName,
    decision_status: domain.decisionStatus,
    approval_terms_json: domain.approvalTerms || {},
    stip_status: domain.stipStatus,
    missing_items_json: domain.missingItems,
    confidence_notes: domain.confidenceNotes,
  }
}
