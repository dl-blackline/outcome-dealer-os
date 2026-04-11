/**
 * Household domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'

export interface HouseholdSummary {
  id: string
  name: string
  primaryContact: string
  lifetimeValue: number
  loyaltyScore: number
  members: number
  preferredContact?: string
  createdAt: string
}

const HOUSEHOLD_DATA: HouseholdSummary[] = [
  { id: 'hh-001', name: 'Mitchell Family', primaryContact: 'Sarah Mitchell', lifetimeValue: 38900, loyaltyScore: 72, preferredContact: 'email', members: 2, createdAt: '2024-11-01T10:00:00Z' },
  { id: 'hh-002', name: 'Johnson Family', primaryContact: 'Marcus Johnson', lifetimeValue: 105200, loyaltyScore: 91, preferredContact: 'phone', members: 3, createdAt: '2024-06-15T14:00:00Z' },
  { id: 'hh-003', name: 'Rodriguez Family', primaryContact: 'Elena Rodriguez', lifetimeValue: 0, loyaltyScore: 15, preferredContact: 'sms', members: 1, createdAt: '2025-01-16T09:15:00Z' },
  { id: 'hh-004', name: 'Thompson Family', primaryContact: 'David Thompson', lifetimeValue: 67800, loyaltyScore: 85, preferredContact: 'phone', members: 2, createdAt: '2023-03-20T08:30:00Z' },
]

export function useHouseholds(): QueryResult<HouseholdSummary[]> { return useSimulatedQuery(() => HOUSEHOLD_DATA) }
export function useHousehold(id: string): QueryResult<HouseholdSummary | null> {
  return useSimulatedQuery(() => HOUSEHOLD_DATA.find(h => h.id === id) ?? null)
}
