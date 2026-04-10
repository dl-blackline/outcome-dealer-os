import { UUID } from '@/types/common'

export interface AuditLogPayload {
  action: string
  objectType: string
  objectId: UUID
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  userId?: UUID
  userRole?: string
  source?: string
  confidenceScore?: number
  requiresReview?: boolean
}

export interface AuditLog {
  id: UUID
  userId?: UUID
  userRole?: string
  entityType: string
  entityId: UUID
  action: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  source?: string
  timestamp: string
  confidenceScore?: number
  requiresReview?: boolean
  createdAt: string
}
