import { UUID } from '@/types/common'
import { findMany } from '@/lib/db/helpers'
import { TaskRow, Task, mapTaskRowToDomain } from './task.types'

export async function findTasksByAssignedUser(assignedTo: string): Promise<Task[]> {
  const rows = await findMany<TaskRow>('tasks', (row) => row.assigned_to === assignedTo)
  return rows.map(mapTaskRowToDomain)
}

export async function findTasksByStatus(
  status: TaskRow['status']
): Promise<Task[]> {
  const rows = await findMany<TaskRow>('tasks', (row) => row.status === status)
  return rows.map(mapTaskRowToDomain)
}

export async function findTasksByLinkedEntity(
  entityType: string,
  entityId: UUID
): Promise<Task[]> {
  const rows = await findMany<TaskRow>(
    'tasks',
    (row) => row.linked_entity_type === entityType && row.linked_entity_id === entityId
  )
  return rows.map(mapTaskRowToDomain)
}

export async function findOverdueTasks(asOfDate?: string): Promise<Task[]> {
  const cutoff = asOfDate || new Date().toISOString().slice(0, 10)
  const rows = await findMany<TaskRow>(
    'tasks',
    (row) => row.due_date < cutoff && row.status !== 'completed' && row.status !== 'cancelled'
  )
  return rows.map(mapTaskRowToDomain)
}
