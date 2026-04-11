/**
 * Deal domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_DEALS, type MockDeal } from '@/lib/mockData'

export function useDeals(): QueryResult<MockDeal[]> { return useSimulatedQuery(() => MOCK_DEALS) }
export function useDeal(id: string): QueryResult<MockDeal | null> { return useSimulatedQuery(() => MOCK_DEALS.find(d => d.id === id) ?? null) }
