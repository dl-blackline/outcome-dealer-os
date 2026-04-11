/**
 * Lead domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_LEADS, type MockLead } from '@/lib/mockData'

export function useLeads(): QueryResult<MockLead[]> { return useSimulatedQuery(() => MOCK_LEADS) }
export function useLead(id: string): QueryResult<MockLead | null> { return useSimulatedQuery(() => MOCK_LEADS.find(l => l.id === id) ?? null) }
