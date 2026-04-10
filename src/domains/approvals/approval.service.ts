import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { ApprovalRequest, ApprovalRecord, ApprovalResolution } from './approval.types'
import { ApprovalRow } from '@/lib/db/supabase'
import { insert, update, findMany, findById } from '@/lib/db/helpers'
import { canUserApprove } from './approval.policy'
import { publishEvent } from '@/domains/events/event.publisher'
import { writeAuditLog } from '@/domains/audit/audit.service'

export async function requestApproval(
  request: ApprovalRequest,
  ctx: ServiceContext
): Promise<ServiceResult<ApprovalRecord>> {
  try {
    const approvalRow: Omit<ApprovalRow, 'id' | 'created_at' | 'updated_at'> = {
      type: request.type,
      requested_by_user_id: request.requestedByUserId,
      requested_by_agent: request.requestedByAgent,
      requested_by_role: ctx.actorRole,
      linked_entity_type: request.linkedEntityType,
      linked_entity_id: request.linkedEntityId,
      description: request.description,
      status: 'pending',
    }

    const savedRow = await insert<ApprovalRow>('approvals', approvalRow)

    await publishEvent(
      {
        eventName: 'approval_requested',
        objectType: 'approval',
        objectId: savedRow.id,
        payload: {
          approvalType: request.type,
          linkedEntityType: request.linkedEntityType,
          linkedEntityId: request.linkedEntityId,
        },
      },
      ctx
    )

    const result: ApprovalRecord = {
      id: savedRow.id,
      type: savedRow.type as any,
      requestedByUserId: savedRow.requested_by_user_id,
      requestedByAgent: savedRow.requested_by_agent,
      requestedByRole: savedRow.requested_by_role,
      linkedEntityType: savedRow.linked_entity_type,
      linkedEntityId: savedRow.linked_entity_id,
      description: savedRow.description,
      status: savedRow.status,
      createdAt: savedRow.created_at,
      updatedAt: savedRow.updated_at,
    }

    return ok(result)
  } catch (error) {
    return fail({
      code: 'REQUEST_APPROVAL_FAILED',
      message: 'Failed to create approval request',
      details: { error: String(error) },
    })
  }
}

export async function approveRequest(
  resolution: ApprovalResolution,
  ctx: ServiceContext
): Promise<ServiceResult<ApprovalRecord>> {
  try {
    const existing = await findById<ApprovalRow>('approvals', resolution.approvalId)
    if (!existing) {
      return fail({
        code: 'APPROVAL_NOT_FOUND',
        message: 'Approval not found',
      })
    }

    if (existing.status !== 'pending') {
      return fail({
        code: 'APPROVAL_ALREADY_RESOLVED',
        message: 'Approval already resolved',
      })
    }

    const canApprove = canUserApprove(
      { role: resolution.userRole as any },
      existing.type as any
    )

    if (!canApprove) {
      return fail({
        code: 'INSUFFICIENT_PERMISSION',
        message: 'User does not have permission to approve this type',
      })
    }

    const now = new Date().toISOString()
    const updatedRow = await update<ApprovalRow>('approvals', resolution.approvalId, {
      status: 'granted',
      approved_by_user_id: resolution.userId,
      approved_by_role: resolution.userRole,
      resolved_at: now,
      resolution_notes: resolution.notes,
    })

    if (!updatedRow) {
      return fail({
        code: 'UPDATE_FAILED',
        message: 'Failed to update approval',
      })
    }

    await publishEvent(
      {
        eventName: 'approval_granted',
        objectType: 'approval',
        objectId: updatedRow.id,
        payload: {
          approvalType: updatedRow.type,
          approvedBy: resolution.userId,
          linkedEntityType: updatedRow.linked_entity_type,
          linkedEntityId: updatedRow.linked_entity_id,
        },
      },
      ctx
    )

    await writeAuditLog(
      {
        action: 'approval_granted',
        objectType: 'approval',
        objectId: updatedRow.id,
        before: { status: 'pending' },
        after: { status: 'granted', approvedBy: resolution.userId },
      },
      ctx
    )

    const result: ApprovalRecord = {
      id: updatedRow.id,
      type: updatedRow.type as any,
      requestedByUserId: updatedRow.requested_by_user_id,
      requestedByAgent: updatedRow.requested_by_agent,
      requestedByRole: updatedRow.requested_by_role,
      linkedEntityType: updatedRow.linked_entity_type,
      linkedEntityId: updatedRow.linked_entity_id,
      description: updatedRow.description,
      status: updatedRow.status,
      approvedByUserId: updatedRow.approved_by_user_id,
      approvedByRole: updatedRow.approved_by_role,
      resolvedAt: updatedRow.resolved_at,
      resolutionNotes: updatedRow.resolution_notes,
      createdAt: updatedRow.created_at,
      updatedAt: updatedRow.updated_at,
    }

    return ok(result)
  } catch (error) {
    return fail({
      code: 'APPROVE_REQUEST_FAILED',
      message: 'Failed to approve request',
      details: { error: String(error) },
    })
  }
}

export async function denyRequest(
  resolution: ApprovalResolution,
  ctx: ServiceContext
): Promise<ServiceResult<ApprovalRecord>> {
  try {
    const existing = await findById<ApprovalRow>('approvals', resolution.approvalId)
    if (!existing) {
      return fail({
        code: 'APPROVAL_NOT_FOUND',
        message: 'Approval not found',
      })
    }

    if (existing.status !== 'pending') {
      return fail({
        code: 'APPROVAL_ALREADY_RESOLVED',
        message: 'Approval already resolved',
      })
    }

    const canApprove = canUserApprove(
      { role: resolution.userRole as any },
      existing.type as any
    )

    if (!canApprove) {
      return fail({
        code: 'INSUFFICIENT_PERMISSION',
        message: 'User does not have permission to deny this type',
      })
    }

    const now = new Date().toISOString()
    const updatedRow = await update<ApprovalRow>('approvals', resolution.approvalId, {
      status: 'denied',
      approved_by_user_id: resolution.userId,
      approved_by_role: resolution.userRole,
      resolved_at: now,
      resolution_notes: resolution.notes,
    })

    if (!updatedRow) {
      return fail({
        code: 'UPDATE_FAILED',
        message: 'Failed to update approval',
      })
    }

    await publishEvent(
      {
        eventName: 'approval_denied',
        objectType: 'approval',
        objectId: updatedRow.id,
        payload: {
          approvalType: updatedRow.type,
          deniedBy: resolution.userId,
          linkedEntityType: updatedRow.linked_entity_type,
          linkedEntityId: updatedRow.linked_entity_id,
        },
      },
      ctx
    )

    await writeAuditLog(
      {
        action: 'approval_denied',
        objectType: 'approval',
        objectId: updatedRow.id,
        before: { status: 'pending' },
        after: { status: 'denied', deniedBy: resolution.userId },
      },
      ctx
    )

    const result: ApprovalRecord = {
      id: updatedRow.id,
      type: updatedRow.type as any,
      requestedByUserId: updatedRow.requested_by_user_id,
      requestedByAgent: updatedRow.requested_by_agent,
      requestedByRole: updatedRow.requested_by_role,
      linkedEntityType: updatedRow.linked_entity_type,
      linkedEntityId: updatedRow.linked_entity_id,
      description: updatedRow.description,
      status: updatedRow.status,
      approvedByUserId: updatedRow.approved_by_user_id,
      approvedByRole: updatedRow.approved_by_role,
      resolvedAt: updatedRow.resolved_at,
      resolutionNotes: updatedRow.resolution_notes,
      createdAt: updatedRow.created_at,
      updatedAt: updatedRow.updated_at,
    }

    return ok(result)
  } catch (error) {
    return fail({
      code: 'DENY_REQUEST_FAILED',
      message: 'Failed to deny request',
      details: { error: String(error) },
    })
  }
}

export async function listPendingApprovals(): Promise<ServiceResult<ApprovalRecord[]>> {
  try {
    const rows = await findMany<ApprovalRow>('approvals', (row) => row.status === 'pending')

    const approvals: ApprovalRecord[] = rows.map((row) => ({
      id: row.id,
      type: row.type as any,
      requestedByUserId: row.requested_by_user_id,
      requestedByAgent: row.requested_by_agent,
      requestedByRole: row.requested_by_role,
      linkedEntityType: row.linked_entity_type,
      linkedEntityId: row.linked_entity_id,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return ok(approvals)
  } catch (error) {
    return fail({
      code: 'LIST_APPROVALS_FAILED',
      message: 'Failed to list pending approvals',
      details: { error: String(error) },
    })
  }
}
