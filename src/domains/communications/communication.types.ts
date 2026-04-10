import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface CommunicationEventRow extends DbRow {
  lead_id?: UUID
  customer_id: UUID
  channel?: string
  direction?: string
  subject?: string
  body?: string
  transcript?: string
  summary?: string
  ai_generated: boolean
  ai_confidence?: number
  consent_checked: boolean
  sent_by_user_id?: UUID
  sent_by_agent?: string
}

export interface CommunicationEvent {
  id: UUID
  leadId?: UUID
  customerId: UUID
  channel?: string
  direction?: string
  subject?: string
  body?: string
  transcript?: string
  summary?: string
  aiGenerated: boolean
  aiConfidence?: number
  consentChecked: boolean
  sentByUserId?: UUID
  sentByAgent?: string
  createdAt: string
}

export interface CreateCommunicationEventInput {
  leadId?: UUID
  customerId: UUID
  channel: 'phone' | 'email' | 'sms' | 'chat' | 'in_person'
  direction: 'inbound' | 'outbound'
  subject?: string
  body?: string
  transcript?: string
  summary?: string
  aiGenerated?: boolean
  aiConfidence?: number
  consentChecked?: boolean
  sentByUserId?: UUID
  sentByAgent?: string
}

export function mapCommunicationEventRowToDomain(row: CommunicationEventRow): CommunicationEvent {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    channel: row.channel,
    direction: row.direction,
    subject: row.subject,
    body: row.body,
    transcript: row.transcript,
    summary: row.summary,
    aiGenerated: row.ai_generated,
    aiConfidence: row.ai_confidence,
    consentChecked: row.consent_checked,
    sentByUserId: row.sent_by_user_id,
    sentByAgent: row.sent_by_agent,
    createdAt: row.created_at,
  }
}
