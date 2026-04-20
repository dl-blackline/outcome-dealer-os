/**
 * Lead domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { type MockLead } from '@/lib/mockData'

const NO_LEADS: MockLead[] = []

export function useLeads(): QueryResult<MockLead[]> { return useSimulatedQuery(() => NO_LEADS) }
export function useLead(_id: string): QueryResult<MockLead | null> { return useSimulatedQuery(() => null) }
