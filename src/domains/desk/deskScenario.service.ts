import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  DeskScenarioRow,
  DeskScenario,
  CreateDeskScenarioInput,
  UpdateDeskScenarioInput,
  mapDeskScenarioRowToDomain,
} from './deskScenario.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { requestApproval } from '@/domains/approvals/approval.service'
import { hasPermission } from '@/domains/roles/policy'

const FINANCIAL_CHANGE_THRESHOLD_PERCENT = 0.10

export async function getDeskScenarioById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<DeskScenario>> {
  try {
    const row = await findById<DeskScenarioRow>('desk_scenarios', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Desk scenario not found' })
    }
    return ok(mapDeskScenarioRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_DESK_SCENARIO_FAILED',
      message: 'Failed to get desk scenario',
      details: { error: String(error) },
    })
  }
}

export async function listDeskScenarios(
  filters?: {
    leadId?: UUID
    customerId?: UUID
    inventoryUnitId?: UUID
  },
  ctx?: ServiceContext
): Promise<ServiceResult<DeskScenario[]>> {
  try {
    const rows = await findMany<DeskScenarioRow>('desk_scenarios', (row) => {
      if (filters?.leadId && row.lead_id !== filters.leadId) {
        return false
      }
      if (filters?.customerId && row.customer_id !== filters.customerId) {
        return false
      }
      if (filters?.inventoryUnitId && row.inventory_unit_id !== filters.inventoryUnitId) {
        return false
      }
      return true
    })
    return ok(rows.map(mapDeskScenarioRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_DESK_SCENARIOS_FAILED',
      message: 'Failed to list desk scenarios',
      details: { error: String(error) },
    })
  }
}

export async function createDeskScenario(
  input: CreateDeskScenarioInput,
  ctx: ServiceContext
): Promise<ServiceResult<DeskScenario>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_desk_scenarios')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to create desk scenarios' })
      }
    }

    if (!input.customerId || !input.inventoryUnitId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'customerId and inventoryUnitId are required',
      })
    }

    const rowData: Omit<DeskScenarioRow, 'id' | 'created_at' | 'updated_at'> = {
      lead_id: input.leadId,
      customer_id: input.customerId,
      inventory_unit_id: input.inventoryUnitId,
      trade_appraisal_id: input.tradeAppraisalId,
      scenario_type: input.scenarioType,
      sale_price: input.salePrice,
      down_payment: input.downPayment,
      trade_value: input.tradeValue,
      payoff: input.payoff,
      taxes: input.taxes,
      fees: input.fees,
      term_months: input.termMonths,
      apr: input.apr,
      monthly_payment: input.monthlyPayment,
      incentive_snapshot: input.incentiveSnapshot || {},
      front_gross_estimate: input.frontGrossEstimate,
      payment_explanation: input.paymentExplanation,
      customer_summary: input.customerSummary,
      presented_by_user_id: input.presentedByUserId,
    }

    const row = await insert<DeskScenarioRow>('desk_scenarios', rowData)
    const scenario = mapDeskScenarioRowToDomain(row)

    await publishEvent(
      {
        eventName: 'desk_scenario_created',
        objectType: 'desk_scenario',
        objectId: row.id,
        payload: {
          customerId: input.customerId,
          inventoryUnitId: input.inventoryUnitId,
          scenarioType: input.scenarioType,
        },
      },
      ctx
    )

    await writeAuditLog(
      {
        action: 'desk_scenario.create',
        objectType: 'desk_scenario',
        objectId: row.id,
        after: {
          customerId: input.customerId,
          inventoryUnitId: input.inventoryUnitId,
          salePrice: input.salePrice,
          monthlyPayment: input.monthlyPayment,
        },
      },
      ctx
    )

    return ok(scenario)
  } catch (error) {
    return fail({
      code: 'CREATE_DESK_SCENARIO_FAILED',
      message: 'Failed to create desk scenario',
      details: { error: String(error) },
    })
  }
}

export async function updateDeskScenario(
  id: UUID,
  input: UpdateDeskScenarioInput,
  ctx: ServiceContext
): Promise<ServiceResult<DeskScenario>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_desk_scenarios')) {
        return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to update desk scenarios' })
      }
    }

    const existing = await findById<DeskScenarioRow>('desk_scenarios', id)
    if (!existing) {
      return fail({ code: 'NOT_FOUND', message: 'Desk scenario not found' })
    }

    const updates: Partial<DeskScenarioRow> = {}
    if (input.salePrice !== undefined) updates.sale_price = input.salePrice
    if (input.downPayment !== undefined) updates.down_payment = input.downPayment
    if (input.tradeValue !== undefined) updates.trade_value = input.tradeValue
    if (input.payoff !== undefined) updates.payoff = input.payoff
    if (input.taxes !== undefined) updates.taxes = input.taxes
    if (input.fees !== undefined) updates.fees = input.fees
    if (input.termMonths !== undefined) updates.term_months = input.termMonths
    if (input.apr !== undefined) updates.apr = input.apr
    if (input.monthlyPayment !== undefined) updates.monthly_payment = input.monthlyPayment
    if (input.incentiveSnapshot !== undefined) updates.incentive_snapshot = input.incentiveSnapshot
    if (input.frontGrossEstimate !== undefined) updates.front_gross_estimate = input.frontGrossEstimate
    if (input.paymentExplanation !== undefined) updates.payment_explanation = input.paymentExplanation
    if (input.customerSummary !== undefined) updates.customer_summary = input.customerSummary

    const oldPayment = existing.monthly_payment || 0
    const newPayment = input.monthlyPayment !== undefined ? input.monthlyPayment : oldPayment
    const paymentDelta = oldPayment > 0 ? Math.abs((newPayment - oldPayment) / oldPayment) : 0

    let requiresReview = false
    if (paymentDelta > FINANCIAL_CHANGE_THRESHOLD_PERCENT) {
      requiresReview = true
      
      if (ctx.actorType === 'agent' || ctx.actorType === 'system') {
        await requestApproval(
          {
            type: 'financial_output_change',
            requestedByAgent: ctx.actorType === 'agent' ? ctx.actorId : undefined,
            linkedEntityType: 'desk_scenario',
            linkedEntityId: id,
            description: `Monthly payment changed by ${(paymentDelta * 100).toFixed(1)}% from $${oldPayment.toFixed(2)} to $${newPayment.toFixed(2)}`,
            metadata: {
              oldPayment,
              newPayment,
              deltaPercent: paymentDelta,
            },
          },
          ctx
        )
      }
    }

    const row = await update<DeskScenarioRow>('desk_scenarios', id, updates)
    if (!row) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update desk scenario' })
    }

    const scenario = mapDeskScenarioRowToDomain(row)

    await writeAuditLog(
      {
        action: 'desk_scenario.update',
        objectType: 'desk_scenario',
        objectId: id,
        before: {
          salePrice: existing.sale_price,
          monthlyPayment: existing.monthly_payment,
        },
        after: {
          salePrice: row.sale_price,
          monthlyPayment: row.monthly_payment,
        },
        requiresReview,
      },
      ctx
    )

    return ok(scenario)
  } catch (error) {
    return fail({
      code: 'UPDATE_DESK_SCENARIO_FAILED',
      message: 'Failed to update desk scenario',
      details: { error: String(error) },
    })
  }
}
