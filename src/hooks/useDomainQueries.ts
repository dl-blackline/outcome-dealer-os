/**
 * Canonical frontend data layer — domain query hooks.
 *
 * Each hook returns { data, loading, error } and consults the adapter layer,
 * which currently resolves to mock data. When real APIs exist, only the
 * adapter files change — pages and hooks stay untouched.
 */
import { useState, useEffect, useMemo } from 'react'
import { MOCK_LEADS, MOCK_DEALS, MOCK_INVENTORY, MOCK_APPROVALS, MOCK_EVENTS, MOCK_SERVICE_EVENTS, type MockLead, type MockDeal, type MockInventoryUnit, type MockApproval, type MockEvent, type MockServiceEvent } from '@/lib/mockData'
import { MOCK_WORKSTATION_CARDS, type WorkstationCard } from '@/domains/workstation'

/* ─── Generic query result type ─── */
export interface QueryResult<T> {
  data: T
  loading: boolean
  error: string | null
}

function useSimulatedQuery<T>(resolver: () => T): QueryResult<T> {
  const [loading, setLoading] = useState(true)
  const data = useMemo(resolver, [])
  useEffect(() => { const t = setTimeout(() => setLoading(false), 80); return () => clearTimeout(t) }, [])
  return { data, loading, error: null }
}

/* ─── Household mock ─── */
export interface HouseholdSummary {
  id: string
  name: string
  primaryContact: string
  lifetimeValue: number
  loyaltyScore: number
  members: number
  createdAt: string
}

const HOUSEHOLD_DATA: HouseholdSummary[] = [
  { id: 'hh-001', name: 'Mitchell Family', primaryContact: 'Sarah Mitchell', lifetimeValue: 38900, loyaltyScore: 72, members: 2, createdAt: '2024-11-01T10:00:00Z' },
  { id: 'hh-002', name: 'Johnson Family', primaryContact: 'Marcus Johnson', lifetimeValue: 105200, loyaltyScore: 91, members: 3, createdAt: '2024-06-15T14:00:00Z' },
  { id: 'hh-003', name: 'Rodriguez Family', primaryContact: 'Elena Rodriguez', lifetimeValue: 0, loyaltyScore: 15, members: 1, createdAt: '2025-01-16T09:15:00Z' },
  { id: 'hh-004', name: 'Thompson Family', primaryContact: 'David Thompson', lifetimeValue: 67800, loyaltyScore: 85, members: 2, createdAt: '2023-03-20T08:30:00Z' },
]

export function useHouseholds(): QueryResult<HouseholdSummary[]> { return useSimulatedQuery(() => HOUSEHOLD_DATA) }
export function useHousehold(id: string): QueryResult<HouseholdSummary | null> {
  return useSimulatedQuery(() => HOUSEHOLD_DATA.find(h => h.id === id) ?? null)
}

/* ─── Leads ─── */
export function useLeads(): QueryResult<MockLead[]> { return useSimulatedQuery(() => MOCK_LEADS) }
export function useLead(id: string): QueryResult<MockLead | null> { return useSimulatedQuery(() => MOCK_LEADS.find(l => l.id === id) ?? null) }

/* ─── Deals ─── */
export function useDeals(): QueryResult<MockDeal[]> { return useSimulatedQuery(() => MOCK_DEALS) }
export function useDeal(id: string): QueryResult<MockDeal | null> { return useSimulatedQuery(() => MOCK_DEALS.find(d => d.id === id) ?? null) }

/* ─── Inventory ─── */
export function useInventory(): QueryResult<MockInventoryUnit[]> { return useSimulatedQuery(() => MOCK_INVENTORY) }
export function useInventoryUnit(id: string): QueryResult<MockInventoryUnit | null> { return useSimulatedQuery(() => MOCK_INVENTORY.find(u => u.id === id) ?? null) }

/* ─── Approvals ─── */
export function useApprovals(): QueryResult<MockApproval[]> { return useSimulatedQuery(() => MOCK_APPROVALS) }

/* ─── Events ─── */
export function useEvents(): QueryResult<MockEvent[]> { return useSimulatedQuery(() => MOCK_EVENTS) }
export function useEntityEvents(entityId: string): QueryResult<MockEvent[]> { return useSimulatedQuery(() => MOCK_EVENTS.filter(e => e.entityId === entityId)) }

/* ─── Service Events ─── */
export function useServiceEvents(): QueryResult<MockServiceEvent[]> { return useSimulatedQuery(() => MOCK_SERVICE_EVENTS) }

/* ─── Workstation ─── */
export function useWorkstationCards(): QueryResult<WorkstationCard[]> { return useSimulatedQuery(() => MOCK_WORKSTATION_CARDS) }
