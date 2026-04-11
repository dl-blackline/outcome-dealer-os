# Runtime Seed Strategy

## Overview

Outcome Dealer OS uses a **seeded runtime** model. The application boots with realistic demo data
that flows through the same query hooks and adapter boundaries as real data will in production.

## Seed Data Location

| Data Type | Source File | Consumed By |
|-----------|------------|-------------|
| Leads | `src/lib/mockData.ts` | `useLeads()`, `useLead(id)` |
| Deals | `src/lib/mockData.ts` | `useDeals()`, `useDeal(id)` |
| Inventory | `src/lib/mockData.ts` | `useInventory()`, `useInventoryUnit(id)` |
| Approvals | `src/lib/mockData.ts` | `useApprovals()`, `useApprovalMutations()` |
| Events | `src/lib/mockData.ts` | `useEvents()`, `useEntityEvents(id)` |
| Tasks | `src/lib/mockData.ts` | `useTasks()` |
| Service Events | `src/lib/mockData.ts` | `useServiceEvents()` |
| Households | `src/hooks/useDomainQueries.ts` | `useHouseholds()`, `useHousehold(id)` |
| Audit Logs | `src/hooks/useDomainQueries.ts` | `useAuditLogs()` |
| Integrations | `src/hooks/useDomainQueries.ts` | `useIntegrations()` |
| Workstation Cards | `src/domains/workstation/workstation.mock.ts` | `useWorkstationCards()`, `useWorkstationMutations()` |

## Query Hook Pattern

All seed data is consumed through `QueryResult<T>` hooks:

```typescript
interface QueryResult<T> {
  data: T
  loading: boolean
  error: string | null
}
```

Pages never import `MOCK_*` arrays directly. They receive data through hooks, which simulate
a brief loading state (80ms) and return the seeded data.

## Mutation Pattern

Write operations use dedicated mutation hooks that manage local state:

- `useApprovalMutations()` — approve/deny with optimistic updates
- `useWorkstationMutations()` — move/create/complete/reopen cards

## Transition to Real APIs

When real APIs are available, only the hook implementations change:

1. Replace `useSimulatedQuery()` with `useFetch()` or `useQuery()` calls
2. Replace mutation hooks with real API calls + cache invalidation
3. Pages remain unchanged — they only know `QueryResult<T>`

## Runtime Services (KV-backed)

Domain services in `src/domains/*/` are already implemented with real persistence logic
through the `src/lib/db/supabase.ts` KV layer. These services can be wired into hooks
when the application runtime supports async initialization.

| Service | Path | Status |
|---------|------|--------|
| Workstation | `src/domains/workstation/workstation.service.ts` | Implemented, not wired to hooks |
| Approvals | `src/domains/approvals/approval.service.ts` | Implemented, not wired to hooks |
| Events | `src/domains/events/event.service.ts` | Implemented, not wired to hooks |
| Audit | `src/domains/audit/audit.service.ts` | Implemented, not wired to hooks |
| Integrations | `src/domains/integrations/integration.service.ts` | Implemented, not wired to hooks |
| Leads | `src/domains/leads/lead.service.ts` | Implemented, not wired to hooks |
| Deals | `src/domains/deals/deal.service.ts` | Implemented, not wired to hooks |
