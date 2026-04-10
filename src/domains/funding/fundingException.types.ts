import { UUID } from '@/types/common'

export interface FundingExceptionRow {
  id: UUID
  deal_id: UUID
  lender_decision_id?: UUID
  exception_type: string
  severity: string
  description: string
  resolved: boolean
  resolved_at?: string
  assigned_to_user_id?: UUID
  created_at: string
  updated_at?: string
}

export interface FundingException {
  id: UUID
  dealId: UUID
  lenderDecisionId?: UUID
  exceptionType: 'missing_stip' | 'incorrect_disclosure' | 'title_delay' | 'identity_verification' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  resolved: boolean
  resolvedAt?: string
  assignedToUserId?: UUID
  createdAt: string
  updatedAt?: string
}

export interface CreateFundingExceptionInput {
  dealId: UUID
  lenderDecisionId?: UUID
  exceptionType: 'missing_stip' | 'incorrect_disclosure' | 'title_delay' | 'identity_verification' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  assignedToUserId?: UUID
}

export interface UpdateFundingExceptionInput {
  exceptionType?: 'missing_stip' | 'incorrect_disclosure' | 'title_delay' | 'identity_verification' | 'other'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  resolved?: boolean
  resolvedAt?: string
  assignedToUserId?: UUID
}

export function mapFundingExceptionRowToDomain(row: FundingExceptionRow): FundingException {
  return {
    id: row.id,
    dealId: row.deal_id,
    lenderDecisionId: row.lender_decision_id,
    exceptionType: row.exception_type as FundingException['exceptionType'],
    severity: row.severity as FundingException['severity'],
    description: row.description,
    resolved: row.resolved,
    resolvedAt: row.resolved_at,
    assignedToUserId: row.assigned_to_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapFundingExceptionToRow(
  domain: Partial<FundingException>
): Partial<Omit<FundingExceptionRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    deal_id: domain.dealId,
    lender_decision_id: domain.lenderDecisionId,
    exception_type: domain.exceptionType,
    severity: domain.severity,
    description: domain.description,
    resolved: domain.resolved,
    resolved_at: domain.resolvedAt,
    assigned_to_user_id: domain.assignedToUserId,
  }
}
