import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  TaskRow,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  mapTaskRowToDomain,
} from './task.types'
import { writeAuditLog } from '@/domains/audit/audit.service'

export async function getTaskById(id: UUID): Promise<ServiceResult<Task>> {
  try {
    const row = await findById<TaskRow>('tasks', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Task not found' })
    }
    return ok(mapTaskRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_TASK_FAILED',
      message: 'Failed to get task',
      details: { error: String(error) },
    })
  }
}

export async function listTasks(filters?: {
  status?: TaskRow['status']
  priority?: TaskRow['priority']
  assignedTo?: string
}): Promise<ServiceResult<Task[]>> {
  try {
    const rows = await findMany<TaskRow>('tasks', (row) => {
      if (filters?.status && row.status !== filters.status) return false
      if (filters?.priority && row.priority !== filters.priority) return false
      if (filters?.assignedTo && row.assigned_to !== filters.assignedTo) return false
      return true
    })
    return ok(rows.map(mapTaskRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_TASKS_FAILED',
      message: 'Failed to list tasks',
      details: { error: String(error) },
    })
  }
}

export async function createTask(
  input: CreateTaskInput,
  ctx: ServiceContext
): Promise<ServiceResult<Task>> {
  try {
    if (!input.title.trim()) {
      return fail({ code: 'VALIDATION_ERROR', message: 'Task title is required' })
    }

    const rowData: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'> = {
      title: input.title,
      description: input.description,
      assigned_to: input.assignedTo,
      assigned_to_user_id: input.assignedToUserId,
      assigned_by_user_id: input.assignedByUserId,
      linked_entity_type: input.linkedEntityType,
      linked_entity_id: input.linkedEntityId,
      due_date: input.dueDate,
      priority: input.priority || 'medium',
      status: input.status || 'pending',
    }

    const row = await insert<TaskRow>('tasks', rowData)
    const task = mapTaskRowToDomain(row)

    await writeAuditLog(
      {
        action: 'task.create',
        objectType: 'task',
        objectId: task.id,
        after: task as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(task)
  } catch (error) {
    return fail({
      code: 'CREATE_TASK_FAILED',
      message: 'Failed to create task',
      details: { error: String(error) },
    })
  }
}

export async function updateTask(
  id: UUID,
  input: UpdateTaskInput,
  ctx: ServiceContext
): Promise<ServiceResult<Task>> {
  try {
    const existingRow = await findById<TaskRow>('tasks', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Task not found' })
    }

    const before = mapTaskRowToDomain(existingRow)

    const updates: Partial<Omit<TaskRow, 'id' | 'created_at'>> = {}
    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.assignedTo !== undefined) updates.assigned_to = input.assignedTo
    if (input.assignedToUserId !== undefined) updates.assigned_to_user_id = input.assignedToUserId
    if (input.linkedEntityType !== undefined) updates.linked_entity_type = input.linkedEntityType
    if (input.linkedEntityId !== undefined) updates.linked_entity_id = input.linkedEntityId
    if (input.dueDate !== undefined) updates.due_date = input.dueDate
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.status !== undefined) updates.status = input.status

    const updatedRow = await update<TaskRow>('tasks', id, updates)
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to update task' })
    }

    const after = mapTaskRowToDomain(updatedRow)

    await writeAuditLog(
      {
        action: 'task.update',
        objectType: 'task',
        objectId: id,
        before: before as unknown as Record<string, unknown>,
        after: after as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_TASK_FAILED',
      message: 'Failed to update task',
      details: { error: String(error) },
    })
  }
}

export async function completeTask(
  id: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<Task>> {
  try {
    const existingRow = await findById<TaskRow>('tasks', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Task not found' })
    }

    if (existingRow.status === 'completed') {
      return ok(mapTaskRowToDomain(existingRow))
    }

    const before = mapTaskRowToDomain(existingRow)

    const updatedRow = await update<TaskRow>('tasks', id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Failed to complete task' })
    }

    const after = mapTaskRowToDomain(updatedRow)

    await writeAuditLog(
      {
        action: 'task.complete',
        objectType: 'task',
        objectId: id,
        before: { status: before.status } as unknown as Record<string, unknown>,
        after: { status: after.status, completedAt: after.completedAt } as unknown as Record<string, unknown>,
      },
      ctx
    )

    return ok(after)
  } catch (error) {
    return fail({
      code: 'COMPLETE_TASK_FAILED',
      message: 'Failed to complete task',
      details: { error: String(error) },
    })
  }
}
