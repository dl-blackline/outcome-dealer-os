/**
 * Tasks runtime hook (no domain folder yet).
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_TASKS, type MockTask } from '@/lib/mockData'

export function useTasks(): QueryResult<MockTask[]> { return useSimulatedQuery(() => MOCK_TASKS) }
