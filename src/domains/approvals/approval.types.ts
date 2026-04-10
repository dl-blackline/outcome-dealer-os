import { UUID } from '@/types/common'
import { ApprovalType } from '@/domains/roles/policy'

export interface ApprovalRequest {
  type: ApprovalType
  requestedByUserId?: UUID
  requestedByAgent?: string
  linkedEntityType: string
  linkedEntityId: UUID
  description: string
  metadata?: Record<string, unknown>
}

export interface ApprovalRecord {
  id: UUID
  type: ApprovalType
  requestedByUserId?: UUID
  requestedByAgent?: string
  requestedByRole?: string
  linkedEntityType: string
  linkedEntityId: UUID
  description: string
  status: 'pending' | 'granted' | 'denied'
  approvedByUserId?: UUID
  approvedByRole?: string
  resolvedAt?: string
  resolutionNotes?: string
  createdAt: string
  updatedAt?: string
}

export interface ApprovalResolution {
  approvalId: UUID
  action: 'grant' | 'deny'
  userId: UUID
  userRole: string
  notes?: string
}
