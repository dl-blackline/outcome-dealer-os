/**
 * Dashboard Adapters — Centralized metric derivation for the dashboard.
 *
 * Each adapter computes a summary from mock data or domain queries.
 * When real APIs exist, only adapters change — dashboard components stay untouched.
 */
import { MOCK_LEADS, MOCK_DEALS, MOCK_INVENTORY, MOCK_APPROVALS, MOCK_EVENTS, type MockLead, type MockDeal, type MockEvent } from '@/lib/mockData'
import { MOCK_WORKSTATION_CARDS } from '@/domains/workstation'
import { AppRole } from '@/domains/roles/roles'

export interface MetricCard {
  label: string
  value: string | number
  subtext: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface DashboardSignals {
  metrics: MetricCard[]
  recentLeads: MockLead[]
  activeDeals: MockDeal[]
  recentEvents: MockEvent[]
}

const SALES_ROLES: AppRole[] = ['owner', 'gm', 'gsm', 'sales_manager', 'sales_rep', 'bdc_manager', 'used_car_manager']
const SERVICE_ROLES: AppRole[] = ['service_director', 'service_advisor', 'recon_manager']
const FINANCE_ROLES: AppRole[] = ['fi_manager']

function getMetricsForRole(role: AppRole): MetricCard[] {
  const pendingApprovals = MOCK_APPROVALS.filter(a => a.status === 'pending').length
  const agingUnits = MOCK_INVENTORY.filter(i => i.status === 'aging').length
  const openCards = MOCK_WORKSTATION_CARDS.filter(c => c.columnId !== 'done').length

  const baseMetrics: MetricCard[] = [
    { label: 'Open Workstation Cards', value: openCards, subtext: `${MOCK_WORKSTATION_CARDS.filter(c => c.columnId === 'inbox').length} in inbox`, trend: 'neutral' },
  ]

  if (SALES_ROLES.includes(role)) {
    return [
      { label: 'Active Leads', value: MOCK_LEADS.length, subtext: `${MOCK_LEADS.filter(l => l.status === 'qualified').length} qualified`, trend: 'up' },
      { label: 'Deals in Progress', value: MOCK_DEALS.filter(d => d.status !== 'funded').length, subtext: `${MOCK_DEALS.filter(d => d.status === 'funded').length} funded`, trend: 'up' },
      { label: 'Pending Approvals', value: pendingApprovals, subtext: 'Requires manager action', trend: pendingApprovals > 0 ? 'down' : 'neutral' },
      ...baseMetrics,
    ]
  }

  if (SERVICE_ROLES.includes(role)) {
    return [
      { label: 'Aging Inventory', value: agingUnits, subtext: '60+ days in stock', trend: agingUnits > 0 ? 'down' : 'neutral' },
      { label: 'Inventory Units', value: MOCK_INVENTORY.length, subtext: `${MOCK_INVENTORY.filter(i => i.status === 'frontline').length} frontline ready`, trend: 'neutral' },
      { label: 'Recent Events', value: MOCK_EVENTS.length, subtext: 'Last 24 hours', trend: 'neutral' },
      ...baseMetrics,
    ]
  }

  if (FINANCE_ROLES.includes(role)) {
    return [
      { label: 'Deals in Progress', value: MOCK_DEALS.filter(d => d.status !== 'funded').length, subtext: `${MOCK_DEALS.filter(d => d.status === 'funded').length} funded`, trend: 'up' },
      { label: 'Pending Approvals', value: pendingApprovals, subtext: 'Requires review', trend: pendingApprovals > 0 ? 'down' : 'neutral' },
      { label: 'Active Leads', value: MOCK_LEADS.length, subtext: `${MOCK_LEADS.filter(l => l.status === 'converted').length} converted`, trend: 'neutral' },
      ...baseMetrics,
    ]
  }

  // Executive / admin / marketing / default
  return [
    { label: 'Active Leads', value: MOCK_LEADS.length, subtext: `${MOCK_LEADS.filter(l => l.status === 'qualified').length} qualified`, trend: 'up' },
    { label: 'Deals in Progress', value: MOCK_DEALS.length, subtext: `${MOCK_DEALS.filter(d => d.status === 'funded').length} funded`, trend: 'up' },
    { label: 'Pending Approvals', value: pendingApprovals, subtext: 'Requires manager action', trend: pendingApprovals > 0 ? 'down' : 'neutral' },
    { label: 'Aging Inventory', value: agingUnits, subtext: '60+ days in stock', trend: agingUnits > 0 ? 'down' : 'neutral' },
  ]
}

export function getDashboardSignals(role: AppRole): DashboardSignals {
  return {
    metrics: getMetricsForRole(role),
    recentLeads: MOCK_LEADS,
    activeDeals: MOCK_DEALS,
    recentEvents: MOCK_EVENTS.slice(0, 5),
  }
}
