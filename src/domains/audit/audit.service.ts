import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { AuditLogPayload, AuditLog } from './audit.types'
import { AuditLogRow } from '@/lib/db/supabase'
import { insert, findMany } from '@/lib/db/helpers'

export async function writeAuditLog(
  payload: Omit<AuditLogPayload, 'userId' | 'userRole'> &
    Partial<Pick<AuditLogPayload, 'userId' | 'userRole'>>,
  ctx?: ServiceContext
): Promise<ServiceResult<AuditLog>> {
  try {
    const now = new Date().toISOString()

    const userId = payload.userId || ctx?.actorId
    const userRole = payload.userRole || ctx?.actorRole

    const auditRow: Omit<AuditLogRow, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      user_role: userRole,
      entity_type: payload.objectType,
      entity_id: payload.objectId,
      action: payload.action,
      before_json: payload.before,
      after_json: payload.after,
      source: payload.source || ctx?.source,
      timestamp: now,
      confidence_score: payload.confidenceScore,
      requires_review: payload.requiresReview,
    }

    const savedRow = await insert<AuditLogRow>('audit_logs', auditRow)

    const result: AuditLog = {
      id: savedRow.id,
      userId: savedRow.user_id,
      userRole: savedRow.user_role,
      entityType: savedRow.entity_type,
      entityId: savedRow.entity_id,
      action: savedRow.action,
      beforeState: savedRow.before_json,
      afterState: savedRow.after_json,
      ipAddress: savedRow.ip_address,
      userAgent: savedRow.user_agent,
      source: savedRow.source,
      timestamp: savedRow.timestamp,
      confidenceScore: savedRow.confidence_score,
      requiresReview: savedRow.requires_review,
      createdAt: savedRow.created_at,
    }

    return ok(result)
  } catch (error) {
    return fail({
      code: 'AUDIT_LOG_FAILED',
      message: 'Failed to write audit log',
      details: { error: String(error) },
    })
  }
}

export async function getAuditLogsByEntity(
  entityType: string,
  entityId: UUID
): Promise<ServiceResult<AuditLog[]>> {
  try {
    const rows = await findMany<AuditLogRow>(
      'audit_logs',
      (row) => row.entity_type === entityType && row.entity_id === entityId
    )

    const logs: AuditLog[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userRole: row.user_role,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      beforeState: row.before_json,
      afterState: row.after_json,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      source: row.source,
      timestamp: row.timestamp,
      confidenceScore: row.confidence_score,
      requiresReview: row.requires_review,
      createdAt: row.created_at,
    }))

    return ok(logs)
  } catch (error) {
    return fail({
      code: 'GET_AUDIT_LOGS_FAILED',
      message: 'Failed to get audit logs',
      details: { error: String(error) },
    })
  }
}

export async function getAuditLogsRequiringReview(): Promise<ServiceResult<AuditLog[]>> {
  try {
    const rows = await findMany<AuditLogRow>('audit_logs', (row) => row.requires_review === true)

    const logs: AuditLog[] = rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userRole: row.user_role,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      beforeState: row.before_json,
      afterState: row.after_json,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      source: row.source,
      timestamp: row.timestamp,
      confidenceScore: row.confidence_score,
      requiresReview: row.requires_review,
      createdAt: row.created_at,
    }))

    return ok(logs)
  } catch (error) {
    return fail({
      code: 'GET_AUDIT_LOGS_FAILED',
      message: 'Failed to get audit logs requiring review',
      details: { error: String(error) },
    })
  }
}
