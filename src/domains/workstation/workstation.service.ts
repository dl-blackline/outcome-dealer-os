import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { WorkstationCard, WorkstationColumnId } from './workstation.types'
import { DbRow } from '@/lib/db/supabase'
import { db } from '@/lib/db/supabase'
import { MOCK_WORKSTATION_CARDS } from './workstation.mock'

const TABLE = 'workstation_cards'

interface WorkstationCardRow extends DbRow {
  title: string
  description?: string
  column_id: string
  linked_object_type?: string
  linked_object_id?: string
  priority: string
  queue_type: string
  due_at?: string
  assignee_id?: string
  assignee_name?: string
  requires_approval: boolean
  source_event_name?: string
  tags?: string[]
}

function rowToCard(row: WorkstationCardRow): WorkstationCard {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    columnId: row.column_id as WorkstationCard['columnId'],
    linkedObjectType: row.linked_object_type as WorkstationCard['linkedObjectType'],
    linkedObjectId: row.linked_object_id,
    priority: row.priority as WorkstationCard['priority'],
    queueType: row.queue_type as WorkstationCard['queueType'],
    dueAt: row.due_at,
    assigneeId: row.assignee_id,
    assigneeName: row.assignee_name,
    requiresApproval: row.requires_approval,
    sourceEventName: row.source_event_name,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
  }
}

function cardToRow(card: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>): Omit<WorkstationCardRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: card.title,
    description: card.description,
    column_id: card.columnId,
    linked_object_type: card.linkedObjectType,
    linked_object_id: card.linkedObjectId,
    priority: card.priority,
    queue_type: card.queueType,
    due_at: card.dueAt,
    assignee_id: card.assigneeId,
    assignee_name: card.assigneeName,
    requires_approval: card.requiresApproval,
    source_event_name: card.sourceEventName,
    tags: card.tags,
  }
}

/** Seed mock data into KV if the table is empty */
async function ensureSeeded(): Promise<void> {
  const existing = await db.findMany<WorkstationCardRow>(TABLE)
  if (existing.length > 0) return

  for (const card of MOCK_WORKSTATION_CARDS) {
    await db.insert<WorkstationCardRow>(TABLE, cardToRow(card))
  }
}

export async function listWorkstationCards(): Promise<ServiceResult<WorkstationCard[]>> {
  try {
    await ensureSeeded()
    const rows = await db.findMany<WorkstationCardRow>(TABLE)
    return ok(rows.map(rowToCard))
  } catch (error) {
    return fail({ code: 'LIST_CARDS_FAILED', message: 'Failed to list workstation cards', details: { error: String(error) } })
  }
}

export async function getWorkstationCard(id: UUID): Promise<ServiceResult<WorkstationCard | null>> {
  try {
    const row = await db.findById<WorkstationCardRow>(TABLE, id)
    return ok(row ? rowToCard(row) : null)
  } catch (error) {
    return fail({ code: 'GET_CARD_FAILED', message: 'Failed to get card', details: { error: String(error) } })
  }
}

export async function createWorkstationCard(
  card: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceResult<WorkstationCard>> {
  try {
    const row = await db.insert<WorkstationCardRow>(TABLE, cardToRow(card))
    return ok(rowToCard(row))
  } catch (error) {
    return fail({ code: 'CREATE_CARD_FAILED', message: 'Failed to create card', details: { error: String(error) } })
  }
}

export async function moveWorkstationCard(
  id: UUID,
  columnId: WorkstationColumnId
): Promise<ServiceResult<WorkstationCard>> {
  try {
    const updated = await db.update<WorkstationCardRow>(TABLE, id, { column_id: columnId })
    if (!updated) return fail({ code: 'CARD_NOT_FOUND', message: 'Card not found' })
    return ok(rowToCard(updated))
  } catch (error) {
    return fail({ code: 'MOVE_CARD_FAILED', message: 'Failed to move card', details: { error: String(error) } })
  }
}

export async function updateWorkstationCard(
  id: UUID,
  updates: Partial<Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ServiceResult<WorkstationCard>> {
  try {
    const rowUpdates: Partial<Omit<WorkstationCardRow, 'id' | 'created_at'>> = {}
    if (updates.title !== undefined) rowUpdates.title = updates.title
    if (updates.description !== undefined) rowUpdates.description = updates.description
    if (updates.columnId !== undefined) rowUpdates.column_id = updates.columnId
    if (updates.linkedObjectType !== undefined) rowUpdates.linked_object_type = updates.linkedObjectType
    if (updates.linkedObjectId !== undefined) rowUpdates.linked_object_id = updates.linkedObjectId
    if (updates.priority !== undefined) rowUpdates.priority = updates.priority
    if (updates.queueType !== undefined) rowUpdates.queue_type = updates.queueType
    if (updates.dueAt !== undefined) rowUpdates.due_at = updates.dueAt
    if (updates.assigneeId !== undefined) rowUpdates.assignee_id = updates.assigneeId
    if (updates.assigneeName !== undefined) rowUpdates.assignee_name = updates.assigneeName
    if (updates.requiresApproval !== undefined) rowUpdates.requires_approval = updates.requiresApproval
    if (updates.tags !== undefined) rowUpdates.tags = updates.tags

    const updated = await db.update<WorkstationCardRow>(TABLE, id, rowUpdates)
    if (!updated) return fail({ code: 'CARD_NOT_FOUND', message: 'Card not found' })
    return ok(rowToCard(updated))
  } catch (error) {
    return fail({ code: 'UPDATE_CARD_FAILED', message: 'Failed to update card', details: { error: String(error) } })
  }
}

export async function completeWorkstationCard(id: UUID): Promise<ServiceResult<WorkstationCard>> {
  return moveWorkstationCard(id, 'done')
}
