import { UUID } from '@/types/common'

export interface DealDocumentPackageRow {
  id: UUID
  deal_id: UUID
  status: string
  signed_at?: string
  missing_docs_json: string[]
  created_at: string
  updated_at?: string
}

export interface DealDocumentPackage {
  id: UUID
  dealId: UUID
  status: 'incomplete' | 'pending_review' | 'complete' | 'archived'
  signedAt?: string
  missingDocs: string[]
  createdAt: string
  updatedAt?: string
}

export interface CreateDealDocumentPackageInput {
  dealId: UUID
  status?: 'incomplete' | 'pending_review' | 'complete' | 'archived'
  missingDocs?: string[]
}

export interface UpdateDealDocumentPackageInput {
  status?: 'incomplete' | 'pending_review' | 'complete' | 'archived'
  signedAt?: string
  missingDocs?: string[]
}

export function mapDealDocumentPackageRowToDomain(row: DealDocumentPackageRow): DealDocumentPackage {
  return {
    id: row.id,
    dealId: row.deal_id,
    status: row.status as DealDocumentPackage['status'],
    signedAt: row.signed_at,
    missingDocs: row.missing_docs_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapDealDocumentPackageToRow(
  domain: Partial<DealDocumentPackage>
): Partial<Omit<DealDocumentPackageRow, 'id' | 'created_at' | 'updated_at'>> {
  return {
    deal_id: domain.dealId,
    status: domain.status,
    signed_at: domain.signedAt,
    missing_docs_json: domain.missingDocs,
  }
}
