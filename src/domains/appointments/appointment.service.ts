import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import { AppointmentRow } from '@/lib/db/supabase'
import {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  mapAppointmentRowToDomain,
} from './appointment.types'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { hasPermission } from '@/domains/roles/policy'

export async function getAppointmentById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<Appointment>> {
  try {
    const row = await findById<AppointmentRow>('appointments', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Appointment not found' })
    }
    return ok(mapAppointmentRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_APPOINTMENT_FAILED',
      message: 'Failed to get appointment',
      details: { error: String(error) },
    })
  }
}

export async function listAppointments(filters?: {
  leadId?: UUID
  customerId?: UUID
  status?: string
  assignedUserId?: UUID
}): Promise<ServiceResult<Appointment[]>> {
  try {
    const rows = await findMany<AppointmentRow>('appointments', (row) => {
      if (filters?.leadId && row.lead_id !== filters.leadId) {
        return false
      }
      if (filters?.customerId && row.customer_id !== filters.customerId) {
        return false
      }
      if (filters?.status && row.status !== filters.status) {
        return false
      }
      if (filters?.assignedUserId && row.assigned_user_id !== filters.assignedUserId) {
        return false
      }
      return true
    })
    return ok(rows.map(mapAppointmentRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_APPOINTMENTS_FAILED',
      message: 'Failed to list appointments',
      details: { error: String(error) },
    })
  }
}

export async function createAppointment(
  input: CreateAppointmentInput,
  ctx: ServiceContext
): Promise<ServiceResult<Appointment>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_leads')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to create appointments',
        })
      }
    }

    if (!input.customerId) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'customerId is required',
      })
    }

    if (!input.scheduledFor) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'scheduledFor is required',
      })
    }

    const scheduledDate = new Date(input.scheduledFor)
    if (isNaN(scheduledDate.getTime())) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'Invalid date format for scheduledFor',
      })
    }

    const rowData: Omit<AppointmentRow, 'id' | 'created_at' | 'updated_at'> = {
      lead_id: input.leadId,
      customer_id: input.customerId,
      appointment_type: input.appointmentType,
      scheduled_for: input.scheduledFor,
      status: input.status || 'scheduled',
      assigned_user_id: input.assignedUserId,
      notes: input.notes,
      show_result: undefined,
    }

    const row = await insert<AppointmentRow>('appointments', rowData)
    const appointment = mapAppointmentRowToDomain(row)

    await writeAuditLog(
      {
        action: 'appointment.create',
        objectType: 'appointment',
        objectId: appointment.id,
        after: appointment as unknown as Record<string, unknown>,
      },
      ctx
    )

    await publishEvent(
      {
        eventName: 'appointment_booked',
        objectType: 'appointment',
        objectId: appointment.id,
        payload: {
          appointmentId: appointment.id,
          leadId: appointment.leadId,
          customerId: appointment.customerId,
          scheduledFor: appointment.scheduledFor,
          appointmentType: appointment.appointmentType,
        },
      },
      ctx
    )

    return ok(appointment)
  } catch (error) {
    return fail({
      code: 'CREATE_APPOINTMENT_FAILED',
      message: 'Failed to create appointment',
      details: { error: String(error) },
    })
  }
}

export async function updateAppointment(
  id: UUID,
  input: UpdateAppointmentInput,
  ctx: ServiceContext
): Promise<ServiceResult<Appointment>> {
  try {
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_leads')) {
        return fail({
          code: 'PERMISSION_DENIED',
          message: 'Insufficient permissions to update appointments',
        })
      }
    }

    const existingRow = await findById<AppointmentRow>('appointments', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Appointment not found' })
    }

    const before = mapAppointmentRowToDomain(existingRow)

    if (input.scheduledFor) {
      const scheduledDate = new Date(input.scheduledFor)
      if (isNaN(scheduledDate.getTime())) {
        return fail({
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format for scheduledFor',
        })
      }
    }

    const updates: Partial<Omit<AppointmentRow, 'id' | 'created_at'>> = {}
    if (input.appointmentType !== undefined) updates.appointment_type = input.appointmentType
    if (input.scheduledFor !== undefined) updates.scheduled_for = input.scheduledFor
    if (input.status !== undefined) updates.status = input.status
    if (input.assignedUserId !== undefined) updates.assigned_user_id = input.assignedUserId
    if (input.notes !== undefined) updates.notes = input.notes
    if (input.showResult !== undefined) updates.show_result = input.showResult

    const updatedRow = await update<AppointmentRow>('appointments', id, updates)
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update appointment' })
    }

    const after = mapAppointmentRowToDomain(updatedRow)

    await writeAuditLog(
      {
        action: 'appointment.update',
        objectType: 'appointment',
        objectId: id,
        before: before as unknown as Record<string, unknown>,
        after: after as unknown as Record<string, unknown>,
      },
      ctx
    )

    if (
      before.scheduledFor !== after.scheduledFor &&
      before.status !== 'cancelled' &&
      after.status !== 'cancelled'
    ) {
      await publishEvent(
        {
          eventName: 'appointment_rescheduled',
          objectType: 'appointment',
          objectId: id,
          payload: {
            appointmentId: id,
            previousScheduledFor: before.scheduledFor,
            newScheduledFor: after.scheduledFor,
          },
        },
        ctx
      )
    }

    if (before.status !== 'no_show' && after.status === 'no_show') {
      await publishEvent(
        {
          eventName: 'appointment_no_show',
          objectType: 'appointment',
          objectId: id,
          payload: {
            appointmentId: id,
            leadId: after.leadId,
            customerId: after.customerId,
          },
        },
        ctx
      )
    }

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_APPOINTMENT_FAILED',
      message: 'Failed to update appointment',
      details: { error: String(error) },
    })
  }
}
