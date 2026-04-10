import { UUID } from '@/types/common'

export interface DbRow {
  id: UUID
  created_at: string
  updated_at?: string
}

export interface EventBusRow extends DbRow {
  event_name: string
  event_id: UUID
  timestamp: string
  actor_type: 'user' | 'agent' | 'system'
  actor_id?: UUID
  entity_type?: string
  entity_id?: UUID
  payload: Record<string, unknown>
  trace_id?: UUID
  status: 'pending' | 'processed' | 'failed'
}

export interface AuditLogRow extends DbRow {
  user_id?: UUID
  user_role?: string
  entity_type: string
  entity_id: UUID
  action: string
  before_json?: Record<string, unknown>
  after_json?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  source?: string
  timestamp: string
  confidence_score?: number
  requires_review?: boolean
}

export interface ApprovalRow extends DbRow {
  type: string
  requested_by_user_id?: UUID
  requested_by_agent?: string
  requested_by_role?: string
  linked_entity_type: string
  linked_entity_id: UUID
  description: string
  status: 'pending' | 'granted' | 'denied'
  approved_by_user_id?: UUID
  approved_by_role?: string
  resolved_at?: string
  resolution_notes?: string
}

export interface IntegrationSyncStateRow extends DbRow {
  source_system: string
  target_system: string
  object_type: string
  object_id: UUID
  last_successful_sync_at?: string
  last_attempt_at?: string
  error_count: number
  last_error_message?: string
  retry_backoff_seconds: number
  status: 'pending' | 'syncing' | 'success' | 'failed' | 'recovering'
}

export interface HouseholdRow extends DbRow {
  primary_customer_id?: UUID
  household_name?: string
  household_type: string
  notes?: string
  preferred_store_id?: UUID
}

export interface CustomerRow extends DbRow {
  household_id?: UUID
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source?: string
  lifecycle_stage: string
  current_vehicle_summary?: string
  preferred_contact_method?: string
  opt_in_sms: boolean
  opt_in_email: boolean
}

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

class SupabaseClient {
  private store = window.spark.kv

  async insert<T extends DbRow>(table: string, row: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    
    const fullRow = {
      id,
      created_at: now,
      updated_at: now,
      ...row,
    } as T

    const tableKey = `db:${table}`
    const existingRows = await this.store.get<T[]>(tableKey) || []
    existingRows.push(fullRow)
    await this.store.set(tableKey, existingRows)

    return fullRow
  }

  async update<T extends DbRow>(
    table: string,
    id: UUID,
    updates: Partial<Omit<T, 'id' | 'created_at'>>
  ): Promise<T | null> {
    const tableKey = `db:${table}`
    const existingRows = await this.store.get<T[]>(tableKey) || []
    const index = existingRows.findIndex((r: DbRow) => r.id === id)
    
    if (index === -1) return null

    const updatedRow = {
      ...existingRows[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    existingRows[index] = updatedRow
    await this.store.set(tableKey, existingRows)

    return updatedRow
  }

  async findOne<T extends DbRow>(table: string, predicate: (row: T) => boolean): Promise<T | null> {
    const tableKey = `db:${table}`
    const rows = await this.store.get<T[]>(tableKey) || []
    return rows.find(predicate) || null
  }

  async findMany<T extends DbRow>(table: string, predicate?: (row: T) => boolean): Promise<T[]> {
    const tableKey = `db:${table}`
    const rows = await this.store.get<T[]>(tableKey) || []
    return predicate ? rows.filter(predicate) : rows
  }

  async findById<T extends DbRow>(table: string, id: UUID): Promise<T | null> {
    return this.findOne<T>(table, (row) => row.id === id)
  }

  async deleteById(table: string, id: UUID): Promise<boolean> {
    const tableKey = `db:${table}`
    const rows = await this.store.get<DbRow[]>(tableKey) || []
    const filtered = rows.filter((r: DbRow) => r.id !== id)
    
    if (filtered.length === rows.length) return false

    await this.store.set(tableKey, filtered)
    return true
  }

  async count(table: string, predicate?: (row: DbRow) => boolean): Promise<number> {
    const tableKey = `db:${table}`
    const rows = await this.store.get<DbRow[]>(tableKey) || []
    return predicate ? rows.filter(predicate).length : rows.length
  }
}

export const db = new SupabaseClient()
