import { UUID } from '@/types/common'

export interface CreditAppRow {
  id: UUID
  lead_id: UUID
  customer_id: UUID
  quick_app_id?: UUID
  finance_connector?: string
  status: string
  consent_version?: string
  sensitive_data_token_ref?: string
  created_at: string
  updated_at?: string
}

export interface CreditApp {
  id: UUID
  leadId: UUID
  customerId: UUID
  quickAppId?: UUID
  financeConnector?: string
  status: 'started' | 'submitted' | 'approved' | 'declined' | 'cancelled'
  consentVersion?: string
  sensitiveDataTokenRef?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateCreditAppInput {
  leadId: UUID
  customerId: UUID
  quickAppId?: UUID
  financeConnector?: string
  consentVersion?: string
  sensitiveDataTokenRef?: string
}

export interface UpdateCreditAppInput {
  financeConnector?: string
  status?: 'started' | 'submitted' | 'approved' | 'declined' | 'cancelled'
  consentVersion?: string
  sensitiveDataTokenRef?: string
}

export function mapCreditAppRowToDomain(row: CreditAppRow): CreditApp {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    quickAppId: row.quick_app_id,
    financeConnector: row.finance_connector,
    status: row.status as CreditApp['status'],
    consentVersion: row.consent_version,
    sensitiveDataTokenRef: row.sensitive_data_token_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapCreditAppToRow(
  domain: Partial<CreditApp>
): Partial<Omit<CreditAppRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    lead_id: domain.leadId,
    customer_id: domain.customerId,
    quick_app_id: domain.quickAppId,
    finance_connector: domain.financeConnector,
    status: domain.status,
    consent_version: domain.consentVersion,
    sensitive_data_token_ref: domain.sensitiveDataTokenRef,
  }
}
