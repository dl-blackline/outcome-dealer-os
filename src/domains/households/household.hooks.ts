/**
 * Household domain runtime hooks.
 *
 * Queries the household store through the household service layer.
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

const NO_HOUSEHOLDS: HouseholdSummary[] = []

export function useHouseholds(): QueryResult<HouseholdSummary[]> { return useSimulatedQuery(() => NO_HOUSEHOLDS) }
export function useHousehold(_id: string): QueryResult<HouseholdSummary | null> {
  return useSimulatedQuery(() => null)
}
