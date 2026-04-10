import { UUID } from '@/types/common'

export interface QuickAppRow {
  id: UUID
  lead_id: UUID
  customer_id: UUID
  consent_version?: string
  identity_status: string
  status: string
  routed_to_connector: boolean
  connector_name?: string
  created_at: string
  updated_at?: string
}

export interface QuickApp {
  id: UUID
  leadId: UUID
  customerId: UUID
  consentVersion?: string
  identityStatus: 'unknown' | 'verified' | 'failed'
  status: 'started' | 'completed' | 'expired' | 'cancelled'
  routedToConnector: boolean
  connectorName?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateQuickAppInput {
  leadId: UUID
  customerId: UUID
  consentVersion?: string
  identityStatus?: 'unknown' | 'verified' | 'failed'
  connectorName?: string
}

export interface UpdateQuickAppInput {
  consentVersion?: string
  identityStatus?: 'unknown' | 'verified' | 'failed'
  status?: 'started' | 'completed' | 'expired' | 'cancelled'
  routedToConnector?: boolean
  connectorName?: string
}

export function mapQuickAppRowToDomain(row: QuickAppRow): QuickApp {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    consentVersion: row.consent_version,
    identityStatus: row.identity_status as QuickApp['identityStatus'],
    status: row.status as QuickApp['status'],
    routedToConnector: row.routed_to_connector,
    connectorName: row.connector_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapQuickAppToRow(
  domain: Partial<QuickApp>
): Partial<Omit<QuickAppRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    lead_id: domain.leadId,
    customer_id: domain.customerId,
    consent_version: domain.consentVersion,
    identity_status: domain.identityStatus,
    status: domain.status,
    routed_to_connector: domain.routedToConnector,
    connector_name: domain.connectorName,
  }
}
