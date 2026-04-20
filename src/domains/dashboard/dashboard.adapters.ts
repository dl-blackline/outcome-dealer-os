/**
 * Dashboard Adapters — Centralized metric derivation for the dashboard.
 *
 * Each adapter computes a summary from domain queries.
 * When real APIs exist, only adapters change — dashboard components stay untouched.
 */
import { AppRole } from '@/domains/roles/roles'

export interface MetricCard {
  label: string
  value: string | number
  subtext: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface DashboardSignals {
  metrics: MetricCard[]
}

export function getDashboardSignals(_role: AppRole): DashboardSignals {
  // TODO: derive role-based metrics from real data sources when available
  return {
    metrics: [],
  }
}
