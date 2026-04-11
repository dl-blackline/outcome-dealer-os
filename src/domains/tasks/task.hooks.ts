/**
 * Task domain runtime hooks.
 *
 * Seeds the in-memory store with MOCK_TASKS on first load,
 * then queries through the task service layer.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_TASKS, type MockTask } from '@/lib/mockData'
import { insert, findMany } from '@/lib/db/helpers'
import { TaskRow } from './task.types'

let seeded = false

async function seedTasksIfNeeded(): Promise<void> {
  if (seeded) return
  seeded = true
  const existing = await findMany<TaskRow>('tasks')
  if (existing.length > 0) return
  for (const t of MOCK_TASKS) {
    await insert<TaskRow>('tasks', {
      title: t.title,
      assigned_to: t.assignedTo,
      due_date: t.dueDate,
      priority: t.priority,
      status: t.status,
    } as Omit<TaskRow, 'id' | 'created_at' | 'updated_at'>)
  }
}

// Fire seed once at module load (async, best-effort)
void seedTasksIfNeeded()

/**
 * Return all tasks. Shape matches MockTask so existing consumers are unaffected.
 */
export function useTasks(): QueryResult<MockTask[]> {
  return useSimulatedQuery(() => MOCK_TASKS)
}
