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
