/**
 * Inventory domain runtime hooks.
 */
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_INVENTORY, type MockInventoryUnit } from '@/lib/mockData'

export function useInventory(): QueryResult<MockInventoryUnit[]> { return useSimulatedQuery(() => MOCK_INVENTORY) }
export function useInventoryUnit(id: string): QueryResult<MockInventoryUnit | null> { return useSimulatedQuery(() => MOCK_INVENTORY.find(u => u.id === id) ?? null) }
