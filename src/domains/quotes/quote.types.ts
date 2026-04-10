import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface QuoteRow extends DbRow {
  lead_id?: UUID
  customer_id: UUID
  desk_scenario_id?: UUID
  quote_type: string
  quote_amount?: number
  explanation?: string
  status: string
  sent_channel?: string
  accepted_at?: string
}

export interface Quote {
  id: UUID
  leadId?: UUID
  customerId: UUID
  deskScenarioId?: UUID
  quoteType: string
  quoteAmount?: number
  explanation?: string
  status: string
  sentChannel?: string
  acceptedAt?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateQuoteInput {
  leadId?: UUID
  customerId: UUID
  deskScenarioId?: UUID
  quoteType: string
  quoteAmount?: number
  explanation?: string
  status?: string
}

export interface UpdateQuoteInput {
  quoteAmount?: number
  explanation?: string
  status?: string
  sentChannel?: string
  acceptedAt?: string
}

export function mapQuoteRowToDomain(row: QuoteRow): Quote {
  return {
    id: row.id,
    leadId: row.lead_id,
    customerId: row.customer_id,
    deskScenarioId: row.desk_scenario_id,
    quoteType: row.quote_type,
    quoteAmount: row.quote_amount,
    explanation: row.explanation,
    status: row.status,
    sentChannel: row.sent_channel,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
