import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  QuickAppRow,
  QuickApp,
  CreateQuickAppInput,
  UpdateQuickAppInput,
  mapQuickAppRowToDomain,
  mapQuickAppToRow,
} from './quickApp.types'
import {
  CreditAppRow,
  CreditApp,
  CreateCreditAppInput,
  UpdateCreditAppInput,
  mapCreditAppRowToDomain,
  mapCreditAppToRow,
} from './creditApp.types'
import {
  LenderDecisionRow,
  LenderDecision,
  CreateLenderDecisionInput,
  UpdateLenderDecisionInput,
  mapLenderDecisionRowToDomain,
  mapLenderDecisionToRow,
} from './lenderDecision.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { requestApproval } from '@/domains/approvals/approval.service'
import { hasPermission } from '@/domains/roles/policy'

export async function getQuickAppById(
  id: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<QuickApp>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_credit_apps')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to view quick apps',
        })
      }
    }

    const row = await findById<QuickAppRow>('quick_apps', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Quick app not found' })
    }
    return ok(mapQuickAppRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_QUICK_APP_FAILED',
      message: 'Failed to get quick app',
      details: { error: String(error) },
    })
  }
}

export async function createQuickApp(
  input: CreateQuickAppInput,
  ctx: ServiceContext
): Promise<ServiceResult<QuickApp>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_credit_apps')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to create quick apps',
        })
      }
    }

    if (!input.leadId || !input.customerId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'leadId and customerId are required',
      })
    }

    const rowData: Omit<QuickAppRow, 'id' | 'created_at' | 'updated_at'> = {
      lead_id: input.leadId,
      customer_id: input.customerId,
      consent_version: input.consentVersion,
      identity_status: input.identityStatus || 'unknown',
      status: 'started',
      routed_to_connector: false,
      connector_name: input.connectorName,
    }

    const row = await insert<QuickAppRow>('quick_apps', rowData)
    const quickApp = mapQuickAppRowToDomain(row)

    await writeAuditLog({
      action: 'quick_app.create',
      objectType: 'quick_app',
      objectId: quickApp.id,
      after: quickApp,
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
    })

    await publishEvent({
      eventName: 'quick_app_started',
      entityType: 'quick_app',
      entityId: quickApp.id,
      payload: { quickApp },
      actorType: ctx.actorType,
      actorId: ctx.actorId,
    })

    return ok(quickApp)
  } catch (error) {
    return fail({
      code: 'CREATE_QUICK_APP_FAILED',
      message: 'Failed to create quick app',
      details: { error: String(error) },
    })
  }
}

export async function updateQuickApp(
  id: UUID,
  input: UpdateQuickAppInput,
  ctx: ServiceContext
): Promise<ServiceResult<QuickApp>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_credit_apps')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to update quick apps',
        })
      }
    }

    const existingRow = await findById<QuickAppRow>('quick_apps', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Quick app not found' })
    }
    const before = mapQuickAppRowToDomain(existingRow)

    const updateData = mapQuickAppToRow(input as Partial<QuickApp>)
    const updatedRow = await update<QuickAppRow>('quick_apps', id, updateData)
    if (!updatedRow) {
      return fail({
        code: 'UPDATE_QUICK_APP_FAILED',
        message: 'Failed to update quick app',
      })
    }

    const after = mapQuickAppRowToDomain(updatedRow)

    await writeAuditLog({
      action: 'quick_app.update',
      objectType: 'quick_app',
      objectId: id,
      before,
      after,
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
    })

    if (input.status === 'completed' && before.status !== 'completed') {
      await publishEvent({
        eventName: 'quick_app_completed',
        entityType: 'quick_app',
        entityId: id,
        payload: { quickApp: after },
        actorType: ctx.actorType,
        actorId: ctx.actorId,
      })
    }

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_QUICK_APP_FAILED',
      message: 'Failed to update quick app',
      details: { error: String(error) },
    })
  }
}

export async function getCreditAppById(
  id: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<CreditApp>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_credit_apps')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to view credit apps',
        })
      }
    }

    const row = await findById<CreditAppRow>('credit_apps', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Credit app not found' })
    }
    return ok(mapCreditAppRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_CREDIT_APP_FAILED',
      message: 'Failed to get credit app',
      details: { error: String(error) },
    })
  }
}

export async function createCreditApp(
  input: CreateCreditAppInput,
  ctx: ServiceContext
): Promise<ServiceResult<CreditApp>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_credit_apps')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to create credit apps',
        })
      }
    }

    if (!input.leadId || !input.customerId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'leadId and customerId are required',
      })
    }

    if (input.sensitiveDataTokenRef && input.sensitiveDataTokenRef.includes('SSN:')) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'Cannot store raw sensitive data - only token references allowed',
      })
    }

    const rowData: Omit<CreditAppRow, 'id' | 'created_at' | 'updated_at'> = {
      lead_id: input.leadId,
      customer_id: input.customerId,
      quick_app_id: input.quickAppId,
      finance_connector: input.financeConnector,
      status: 'started',
      consent_version: input.consentVersion,
      sensitive_data_token_ref: input.sensitiveDataTokenRef,
    }

    const row = await insert<CreditAppRow>('credit_apps', rowData)
    const creditApp = mapCreditAppRowToDomain(row)

    await writeAuditLog({
      action: 'credit_app.create',
      objectType: 'credit_app',
      objectId: creditApp.id,
      after: creditApp,
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
    })

    return ok(creditApp)
  } catch (error) {
    return fail({
      code: 'CREATE_CREDIT_APP_FAILED',
      message: 'Failed to create credit app',
      details: { error: String(error) },
    })
  }
}

export async function updateCreditApp(
  id: UUID,
  input: UpdateCreditAppInput,
  ctx: ServiceContext
): Promise<ServiceResult<CreditApp>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_credit_apps')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to update credit apps',
        })
      }
    }

    const existingRow = await findById<CreditAppRow>('credit_apps', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Credit app not found' })
    }
    const before = mapCreditAppRowToDomain(existingRow)

    const updateData = mapCreditAppToRow(input as Partial<CreditApp>)
    const updatedRow = await update<CreditAppRow>('credit_apps', id, updateData)
    if (!updatedRow) {
      return fail({
        code: 'UPDATE_CREDIT_APP_FAILED',
        message: 'Failed to update credit app',
      })
    }

    const after = mapCreditAppRowToDomain(updatedRow)

    await writeAuditLog({
      action: 'credit_app.update',
      objectType: 'credit_app',
      objectId: id,
      before,
      after,
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
    })

    if (input.status === 'submitted' && before.status !== 'submitted') {
      await publishEvent({
        eventName: 'credit_app_submitted',
        entityType: 'credit_app',
        entityId: id,
        payload: { creditApp: after },
        actorType: ctx.actorType,
        actorId: ctx.actorId,
      })
    }

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_CREDIT_APP_FAILED',
      message: 'Failed to update credit app',
      details: { error: String(error) },
    })
  }
}

export async function getLenderDecisionById(
  id: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<LenderDecision>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_lender_decisions')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to view lender decisions',
        })
      }
    }

    const row = await findById<LenderDecisionRow>('lender_decisions', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Lender decision not found' })
    }
    return ok(mapLenderDecisionRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_LENDER_DECISION_FAILED',
      message: 'Failed to get lender decision',
      details: { error: String(error) },
    })
  }
}

export async function createLenderDecision(
  input: CreateLenderDecisionInput,
  ctx: ServiceContext
): Promise<ServiceResult<LenderDecision>> {
  try {
    const fiRoles = ['owner', 'gm', 'fi_manager', 'admin']
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!fiRoles.includes(ctx.actorRole)) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to create lender decisions',
        })
      }
    }

    if (!input.creditAppId || !input.lenderName || !input.decisionStatus) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'creditAppId, lenderName, and decisionStatus are required',
      })
    }

    const rowData: Omit<LenderDecisionRow, 'id' | 'created_at' | 'updated_at'> = {
      credit_app_id: input.creditAppId,
      lender_name: input.lenderName,
      decision_status: input.decisionStatus,
      approval_terms_json: input.approvalTerms || {},
      stip_status: input.stipStatus || 'none',
      missing_items_json: input.missingItems || [],
      confidence_notes: input.confidenceNotes,
    }

    const row = await insert<LenderDecisionRow>('lender_decisions', rowData)
    const lenderDecision = mapLenderDecisionRowToDomain(row)

    const requiresReview = ctx.actorType === 'agent' || ctx.source === 'ai'

    await writeAuditLog({
      action: 'lender_decision.create',
      objectType: 'lender_decision',
      objectId: lenderDecision.id,
      after: lenderDecision,
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
      requiresReview,
    })

    if (input.decisionStatus === 'declined') {
      await publishEvent({
        eventName: 'lender_declined',
        entityType: 'lender_decision',
        entityId: lenderDecision.id,
        payload: { lenderDecision },
        actorType: ctx.actorType,
        actorId: ctx.actorId,
      })
    } else if (
      input.decisionStatus === 'approved' ||
      input.decisionStatus === 'countered'
    ) {
      await publishEvent({
        eventName: 'lender_decision_received',
        entityType: 'lender_decision',
        entityId: lenderDecision.id,
        payload: { lenderDecision },
        actorType: ctx.actorType,
        actorId: ctx.actorId,
      })
    }

    if (input.stipStatus === 'pending' && input.missingItems && input.missingItems.length > 0) {
      await publishEvent({
        eventName: 'stip_missing',
        entityType: 'lender_decision',
        entityId: lenderDecision.id,
        payload: { lenderDecision, missingItems: input.missingItems },
        actorType: ctx.actorType,
        actorId: ctx.actorId,
      })
    }

    if (requiresReview && input.approvalTerms) {
      await requestApproval({
        type: 'financial_output_change',
        requestedByAgent: ctx.source,
        linkedEntityType: 'lender_decision',
        linkedEntityId: lenderDecision.id,
        description: `AI-originated lender decision with approval terms from ${input.lenderName}`,
        metadata: { approvalTerms: input.approvalTerms },
      })
    }

    return ok(lenderDecision)
  } catch (error) {
    return fail({
      code: 'CREATE_LENDER_DECISION_FAILED',
      message: 'Failed to create lender decision',
      details: { error: String(error) },
    })
  }
}

export async function updateLenderDecision(
  id: UUID,
  input: UpdateLenderDecisionInput,
  ctx: ServiceContext
): Promise<ServiceResult<LenderDecision>> {
  try {
    const fiRoles = ['owner', 'gm', 'fi_manager', 'admin']
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!fiRoles.includes(ctx.actorRole)) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to update lender decisions',
        })
      }
    }

    const existingRow = await findById<LenderDecisionRow>('lender_decisions', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Lender decision not found' })
    }
    const before = mapLenderDecisionRowToDomain(existingRow)

    const updateData = mapLenderDecisionToRow(input as Partial<LenderDecision>)
    const updatedRow = await update<LenderDecisionRow>('lender_decisions', id, updateData)
    if (!updatedRow) {
      return fail({
        code: 'UPDATE_LENDER_DECISION_FAILED',
        message: 'Failed to update lender decision',
      })
    }

    const after = mapLenderDecisionRowToDomain(updatedRow)

    const requiresReview =
      (ctx.actorType === 'agent' || ctx.source === 'ai') &&
      input.approvalTerms !== undefined

    await writeAuditLog({
      action: 'lender_decision.update',
      objectType: 'lender_decision',
      objectId: id,
      before,
      after,
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
      requiresReview,
    })

    if (input.stipStatus === 'pending' && before.stipStatus !== 'pending') {
      if (input.missingItems && input.missingItems.length > 0) {
        await publishEvent({
          eventName: 'stip_missing',
          entityType: 'lender_decision',
          entityId: id,
          payload: { lenderDecision: after, missingItems: input.missingItems },
          actorType: ctx.actorType,
          actorId: ctx.actorId,
        })
      }
    }

    if (requiresReview) {
      await requestApproval({
        type: 'financial_output_change',
        requestedByAgent: ctx.source,
        linkedEntityType: 'lender_decision',
        linkedEntityId: id,
        description: 'AI-originated update to lender decision approval terms',
        metadata: { before: before.approvalTerms, after: input.approvalTerms },
      })
    }

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_LENDER_DECISION_FAILED',
      message: 'Failed to update lender decision',
      details: { error: String(error) },
    })
  }
}
