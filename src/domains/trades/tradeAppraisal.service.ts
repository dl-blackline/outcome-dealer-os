import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  TradeAppraisalRow,
  TradeAppraisal,
  CreateTradeAppraisalInput,
  UpdateTradeAppraisalInput,
  mapTradeAppraisalRowToDomain,
} from './tradeAppraisal.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { requestApproval } from '@/domains/approvals/approval.service'
import { hasPermission } from '@/domains/roles/policy'

const TRADE_VALUE_CHANGE_THRESHOLD = 2000

export async function getTradeAppraisalById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<TradeAppraisal>> {
  try {
    const row = await findById<TradeAppraisalRow>('trade_appraisals', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Trade appraisal not found' })
    }
    return ok(mapTradeAppraisalRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_TRADE_APPRAISAL_FAILED',
      message: 'Failed to get trade appraisal',
      details: { error: String(error) },
    })
  }
}

export async function listTradeAppraisals(
  filters?: {
    leadId?: UUID
    customerId?: UUID
    managerApproved?: boolean
  },
  ctx?: ServiceContext
): Promise<ServiceResult<TradeAppraisal[]>> {
  try {
    const rows = await findMany<TradeAppraisalRow>('trade_appraisals', (row) => {
      if (filters?.leadId && row.lead_id !== filters.leadId) {
        return false
      }
      if (filters?.customerId && row.customer_id !== filters.customerId) {
        return false
      }
      if (filters?.managerApproved !== undefined && row.manager_approved !== filters.managerApproved) {
        return false
      }
      return true
    })
    return ok(rows.map(mapTradeAppraisalRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_TRADE_APPRAISALS_FAILED',
      message: 'Failed to list trade appraisals',
      details: { error: String(error) },
    })
  }
}

export async function createTradeAppraisal(
  input: CreateTradeAppraisalInput,
  ctx: ServiceContext
): Promise<ServiceResult<TradeAppraisal>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_trades')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to create trade appraisals' })
      }
    }

    if (!input.customerId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'customerId is required',
      })
    }

    const rowData: Omit<TradeAppraisalRow, 'id' | 'created_at' | 'updated_at'> = {
      lead_id: input.leadId,
      customer_id: input.customerId,
      inventory_unit_id: input.inventoryUnitId,
      vin: input.vin,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim,
      mileage: input.mileage,
      condition_notes: input.conditionNotes,
      appraisal_value: input.appraisalValue,
      recon_estimate: input.reconEstimate,
      market_exit_value: input.marketExitValue,
      valuation_explanation: input.valuationExplanation,
      appraised_by_user_id: input.appraisedByUserId,
      manager_approved: false,
    }

    const row = await insert<TradeAppraisalRow>('trade_appraisals', rowData)
    const appraisal = mapTradeAppraisalRowToDomain(row)

    await publishEvent(
      {
        eventName: 'trade_submitted',
        objectType: 'trade_appraisal',
        objectId: row.id,
        payload: {
          customerId: input.customerId,
          appraisalValue: input.appraisalValue,
        },
      },
      ctx
    )

    await writeAuditLog(
      {
        action: 'trade_appraisal.create',
        objectType: 'trade_appraisal',
        objectId: row.id,
        after: {
          customerId: input.customerId,
          appraisalValue: input.appraisalValue,
          vin: input.vin,
        },
      },
      ctx
    )

    return ok(appraisal)
  } catch (error) {
    return fail({
      code: 'CREATE_TRADE_APPRAISAL_FAILED',
      message: 'Failed to create trade appraisal',
      details: { error: String(error) },
    })
  }
}

export async function updateTradeAppraisal(
  id: UUID,
  input: UpdateTradeAppraisalInput,
  ctx: ServiceContext
): Promise<ServiceResult<TradeAppraisal>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_trades')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to update trade appraisals' })
      }
    }

    const existing = await findById<TradeAppraisalRow>('trade_appraisals', id)
    if (!existing) {
      return fail({ code: 'NOT_FOUND', message: 'Trade appraisal not found' })
    }

    const updates: Partial<TradeAppraisalRow> = {}
    if (input.vin !== undefined) updates.vin = input.vin
    if (input.year !== undefined) updates.year = input.year
    if (input.make !== undefined) updates.make = input.make
    if (input.model !== undefined) updates.model = input.model
    if (input.trim !== undefined) updates.trim = input.trim
    if (input.mileage !== undefined) updates.mileage = input.mileage
    if (input.conditionNotes !== undefined) updates.condition_notes = input.conditionNotes
    if (input.appraisalValue !== undefined) updates.appraisal_value = input.appraisalValue
    if (input.reconEstimate !== undefined) updates.recon_estimate = input.reconEstimate
    if (input.marketExitValue !== undefined) updates.market_exit_value = input.marketExitValue
    if (input.valuationExplanation !== undefined) updates.valuation_explanation = input.valuationExplanation
    if (input.managerApproved !== undefined) updates.manager_approved = input.managerApproved
    if (input.managerApprovedByUserId !== undefined) updates.manager_approved_by_user_id = input.managerApprovedByUserId

    const oldValue = existing.appraisal_value || 0
    const newValue = input.appraisalValue !== undefined ? input.appraisalValue : oldValue
    const valueDelta = Math.abs(newValue - oldValue)

    let requiresReview = false
    if (valueDelta > TRADE_VALUE_CHANGE_THRESHOLD) {
      requiresReview = true
      
      if (ctx.actorType === 'agent' || ctx.actorType === 'system') {
        await requestApproval(
          {
            type: 'trade_value_change',
            requestedByAgent: ctx.actorType === 'agent' ? ctx.actorId : undefined,
            linkedEntityType: 'trade_appraisal',
            linkedEntityId: id,
            description: `Trade value changed by $${valueDelta.toFixed(2)} from $${oldValue.toFixed(2)} to $${newValue.toFixed(2)}`,
            metadata: {
              oldValue,
              newValue,
              delta: valueDelta,
            },
          },
          ctx
        )
      }
    }

    const row = await update<TradeAppraisalRow>('trade_appraisals', id, updates)
    if (!row) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update trade appraisal' })
    }

    const appraisal = mapTradeAppraisalRowToDomain(row)

    if (input.managerApproved === true) {
      await publishEvent(
        {
          eventName: 'appraisal_completed',
          objectType: 'trade_appraisal',
          objectId: id,
          payload: {
            appraisalValue: row.appraisal_value,
            managerApprovedBy: input.managerApprovedByUserId,
          },
        },
        ctx
      )
    }

    await writeAuditLog(
      {
        action: 'trade_appraisal.update',
        objectType: 'trade_appraisal',
        objectId: id,
        before: {
          appraisalValue: existing.appraisal_value,
          managerApproved: existing.manager_approved,
        },
        after: {
          appraisalValue: row.appraisal_value,
          managerApproved: row.manager_approved,
        },
        requiresReview,
      },
      ctx
    )

    return ok(appraisal)
  } catch (error) {
    return fail({
      code: 'UPDATE_TRADE_APPRAISAL_FAILED',
      message: 'Failed to update trade appraisal',
      details: { error: String(error) },
    })
  }
}
