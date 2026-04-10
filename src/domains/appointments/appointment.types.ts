import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface AppointmentRow extends DbRow {
  lead_id?: UUID
  customer_id: UUID
  appointment_type?: string
  scheduled_for?: string
  status: string
  assigned_user_id?: UUID
  notes?: string
  show_result?: string
}

export interface Appointment {
  id: UUID
  leadId?: UUID
  customerId: UUID
  appointmentType?: string
  scheduledFor?: string
  status: string
  assignedUserId?: UUID
  notes?: string
  showResult?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentInput {
  leadId?: UUID
  customerId: UUID
  appointmentType: 'test_drive' | 'appraisal' | 'delivery' | 'service' | 'consultation'
  scheduledFor: string
  status?: 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'
  assignedUserId?: UUID
  notes?: string
}

export interface UpdateAppointmentInput {
  appointmentType?: 'test_drive' | 'appraisal' | 'delivery' | 'service' | 'consultation'
  scheduledFor?: string
  status?: 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'
  assignedUserId?: UUID
  notes?: string
  showResult?: 'showed' | 'no_show' | 'rescheduled' | 'cancelled'
}

export function mapAppointmentRowToDomain(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    appointmentType: row.appointment_type,
    scheduledFor: row.scheduled_for,
    status: row.status,
    assignedUserId: row.assigned_user_id,
    notes: row.notes,
    showResult: row.show_result,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}
