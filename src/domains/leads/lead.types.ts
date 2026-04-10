import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface LeadRow extends DbRow {
  customer_id: UUID
  household_id?: UUID
  lead_source?: string
  source_campaign_id?: string
  source_medium?: string
  source_detail?: string
  intent_type?: string
  assigned_to_user_id?: UUID
  assigned_team?: string
  status: string
  lead_score: number
  appointment_status: string
  showroom_status: string
  sold_lost_status: string
  lost_reason?: string
}

export interface Lead {
  id: UUID
  customerId: UUID
  householdId?: UUID
  leadSource?: string
  sourceCampaignId?: string
  sourceMedium?: string
  sourceDetail?: string
  intentType?: string
  assignedToUserId?: UUID
  assignedTeam?: string
  status: string
  leadScore: number
  appointmentStatus: string
  showroomStatus: string
  soldLostStatus: string
  lostReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadInput {
  customerId: UUID
  householdId?: UUID
  leadSource?: string
  sourceCampaignId?: string
  sourceMedium?: string
  sourceDetail?: string
  intentType?: 'buy' | 'service' | 'trade' | 'finance' | 'info'
  assignedToUserId?: UUID
  assignedTeam?: string
  status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
  leadScore?: number
}

export interface UpdateLeadInput {
  leadSource?: string
  sourceCampaignId?: string
  sourceMedium?: string
  sourceDetail?: string
  intentType?: 'buy' | 'service' | 'trade' | 'finance' | 'info'
  assignedToUserId?: UUID
  assignedTeam?: string
  status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
  leadScore?: number
  appointmentStatus?: 'none' | 'scheduled' | 'completed' | 'no_show' | 'cancelled'
  showroomStatus?: 'none' | 'visited' | 'test_drove'
  soldLostStatus?: 'open' | 'sold' | 'lost'
  lostReason?: string
}

export function mapLeadRowToDomain(row: LeadRow): Lead {
  return {
    id: row.id,
    customerId: row.customer_id,
    householdId: row.household_id,
    leadSource: row.lead_source,
    sourceCampaignId: row.source_campaign_id,
    sourceMedium: row.source_medium,
    sourceDetail: row.source_detail,
    intentType: row.intent_type,
    assignedToUserId: row.assigned_to_user_id,
    assignedTeam: row.assigned_team,
    status: row.status,
    leadScore: row.lead_score,
    appointmentStatus: row.appointment_status,
    showroomStatus: row.showroom_status,
    soldLostStatus: row.sold_lost_status,
    lostReason: row.lost_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}
