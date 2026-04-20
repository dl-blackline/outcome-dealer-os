import { UUID } from '@/types/common'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

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

export interface AssistantWorklogRow extends DbRow {
  action_id: string
  issue_summary: string
  symptoms: string
  likely_cause: string
  files_inspected: string[]
  changes_proposed: string[]
  validation_steps: string[]
  open_questions: string[]
  confidence: number
  worklog_summary: string
}

export interface AssistantFixProposalRow extends DbRow {
  action_id: string
  issue_summary: string
  /** JSON-serialised CodePatchProposal[] */
  patch_proposals: Record<string, unknown>[]
  approval_id?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'denied'
}

const LOCAL_DB_PREFIX = 'outcome.db:'

class SupabaseClient {
  private getSparkStore() {
    if (typeof window === 'undefined') return null

    const sparkWindow = window as typeof window & {
      spark?: {
        kv?: {
          get: <T>(key: string) => Promise<T | null>
          set: <T>(key: string, value: T) => Promise<void>
        }
      }
    }

    return sparkWindow.spark?.kv || null
  }

  private getTableKey(table: string) {
    return `${LOCAL_DB_PREFIX}${table}`
  }

  private readLocalTable<T extends DbRow>(table: string): T[] {
    if (typeof window === 'undefined') return []

    try {
      const raw = window.localStorage.getItem(this.getTableKey(table))
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  private writeLocalTable<T extends DbRow>(table: string, rows: T[]) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(this.getTableKey(table), JSON.stringify(rows))
  }

  private async loadRows<T extends DbRow>(table: string): Promise<T[]> {
    const client = getSupabaseBrowserClient()

    if (client) {
      const { data, error } = await client.from(table).select('*')
      if (error) {
        throw new Error(`[DB] Supabase read from "${table}" failed: ${error.message}`)
      }
      return (data || []) as T[]
    }

    // Supabase not configured – use local fallback (dev/demo mode only)
    const sparkStore = this.getSparkStore()
    if (sparkStore) {
      const rows = await sparkStore.get<T[]>(`db:${table}`)
      return rows || []
    }

    return this.readLocalTable<T>(table)
  }

  async insert<T extends DbRow>(table: string, row: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const now = new Date().toISOString()
    const fullRow = {
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      ...row,
    } as T

    const client = getSupabaseBrowserClient()
    if (client) {
      // Avoid .select().single() after insert — anon RLS policies may permit
      // INSERT but not SELECT, which causes PostgREST to roll back the entire
      // transaction. The client-constructed fullRow already contains the
      // correct id, created_at, and updated_at so a select-back is unnecessary.
      const { error } = await client.from(table).insert(fullRow)
      if (error) {
        throw new Error(`[DB] Supabase insert into "${table}" failed: ${error.message}`)
      }
      return fullRow
    }

    // Supabase not configured – use local fallback (dev/demo mode only)
    const sparkStore = this.getSparkStore()
    if (sparkStore) {
      const tableKey = `db:${table}`
      const existingRows = (await sparkStore.get<T[]>(tableKey)) || []
      existingRows.push(fullRow)
      await sparkStore.set(tableKey, existingRows)
      return fullRow
    }

    const existingRows = this.readLocalTable<T>(table)
    existingRows.push(fullRow)
    this.writeLocalTable(table, existingRows)
    return fullRow
  }

  async update<T extends DbRow>(
    table: string,
    id: UUID,
    updates: Partial<Omit<T, 'id' | 'created_at'>>,
  ): Promise<T | null> {
    const client = getSupabaseBrowserClient()
    if (client) {
      const payload = { ...updates, updated_at: new Date().toISOString() }
      const { data, error } = await client.from(table).update(payload).eq('id', id).select().single()
      if (error || !data) {
        throw new Error(`[DB] Supabase update on "${table}" (id: ${id}) failed: ${error?.message ?? 'no data returned'}`)
      }
      return data as T
    }

    // Supabase not configured – use local fallback (dev/demo mode only)
    const sparkStore = this.getSparkStore()
    if (sparkStore) {
      const tableKey = `db:${table}`
      const existingRows = (await sparkStore.get<T[]>(tableKey)) || []
      const index = existingRows.findIndex((row) => row.id === id)
      if (index === -1) return null

      const updatedRow = {
        ...existingRows[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }

      existingRows[index] = updatedRow
      await sparkStore.set(tableKey, existingRows)
      return updatedRow as T
    }

    const existingRows = this.readLocalTable<T>(table)
    const index = existingRows.findIndex((row) => row.id === id)
    if (index === -1) return null

    const updatedRow = {
      ...existingRows[index],
      ...updates,
      updated_at: new Date().toISOString(),
    } as T

    existingRows[index] = updatedRow
    this.writeLocalTable(table, existingRows)
    return updatedRow
  }

  async findOne<T extends DbRow>(table: string, predicate: (row: T) => boolean): Promise<T | null> {
    const rows = await this.loadRows<T>(table)
    return rows.find(predicate) || null
  }

  async findMany<T extends DbRow>(table: string, predicate?: (row: T) => boolean): Promise<T[]> {
    const rows = await this.loadRows<T>(table)
    return predicate ? rows.filter(predicate) : rows
  }

  async findById<T extends DbRow>(table: string, id: UUID): Promise<T | null> {
    return this.findOne<T>(table, (row) => row.id === id)
  }

  async deleteById(table: string, id: UUID): Promise<boolean> {
    const client = getSupabaseBrowserClient()
    if (client) {
      const { error } = await client.from(table).delete().eq('id', id)
      if (error) {
        throw new Error(`[DB] Supabase delete from "${table}" (id: ${id}) failed: ${error.message}`)
      }
      return true
    }

    // Supabase not configured – use local fallback (dev/demo mode only)
    const sparkStore = this.getSparkStore()
    if (sparkStore) {
      const tableKey = `db:${table}`
      const rows = (await sparkStore.get<DbRow[]>(tableKey)) || []
      const filtered = rows.filter((row) => row.id !== id)
      if (filtered.length === rows.length) return false
      await sparkStore.set(tableKey, filtered)
      return true
    }

    const rows = this.readLocalTable<DbRow>(table)
    const filtered = rows.filter((row) => row.id !== id)
    if (filtered.length === rows.length) return false
    this.writeLocalTable(table, filtered)
    return true
  }

  async count(table: string, predicate?: (row: DbRow) => boolean): Promise<number> {
    const rows = await this.loadRows<DbRow>(table)
    return predicate ? rows.filter(predicate).length : rows.length
  }
}

export const db = new SupabaseClient()
