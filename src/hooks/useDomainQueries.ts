/**
 * Compatibility re-export barrel.
 *
 * All domain hooks have been split into domain-scoped files.
 * This file re-exports everything so existing consumers keep working.
 * New code should import directly from the domain hook files.
 *
 * @see src/hooks/useQueryResult.ts          — QueryResult<T>, useSimulatedQuery
 * @see src/domains/households/household.hooks.ts
 * @see src/domains/leads/lead.hooks.ts
 * @see src/domains/deals/deal.hooks.ts
 * @see src/domains/inventory/inventory.hooks.ts
 * @see src/domains/approvals/approval.hooks.ts
 * @see src/domains/events/event.hooks.ts
 * @see src/domains/audit/audit.hooks.ts
 * @see src/domains/integrations/integration.hooks.ts
 * @see src/domains/workstation/workstation.hooks.ts
 * @see src/domains/tasks/task.hooks.ts
 */

export { type QueryResult, useSimulatedQuery } from '@/hooks/useQueryResult'
export { type HouseholdSummary, useHouseholds, useHousehold } from '@/domains/households/household.hooks'
export { useLeads, useLead } from '@/domains/leads/lead.hooks'
export { useDeals, useDeal } from '@/domains/deals/deal.hooks'
export { useInventory, useInventoryUnit } from '@/domains/inventory/inventory.hooks'
export { useTasks } from '@/domains/tasks/task.hooks'
export { useApprovals, type ApprovalMutations, useApprovalMutations } from '@/domains/approvals/approval.hooks'
export { useEvents, useEntityEvents, useServiceEvents, useOperatingSignals } from '@/domains/events/event.hooks'
export { type AuditLogEntry, useAuditLogs } from '@/domains/audit/audit.hooks'
export { type IntegrationStatus, useIntegrations } from '@/domains/integrations/integration.hooks'
export { useWorkstationCards, type WorkstationMutations, useWorkstationMutations } from '@/domains/workstation/workstation.hooks'
