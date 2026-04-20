/**
 * Task domain runtime hooks.
 *
 * Queries the in-memory store through the task service layer.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { type MockTask } from '@/lib/mockData'

const NO_TASKS: MockTask[] = []

/**
 * Return all tasks.
 */
export function useTasks(): QueryResult<MockTask[]> {
  return useSimulatedQuery(() => NO_TASKS)
}
