# Domain Runtime Hook Model

## Overview

Domain runtime hooks are React hooks scoped to a single business domain.
Each hook file lives inside its domain folder and owns the data-fetching
(currently simulated) and mutation logic for that domain.

## Shared Infrastructure

| File | Exports |
|---|---|
| `src/hooks/useQueryResult.ts` | `QueryResult<T>`, `useSimulatedQuery` |

Every domain hook returns `QueryResult<T>` — a triple of `{ data, loading, error }`.
`useSimulatedQuery` resolves mock data with an 80 ms delay; it will be replaced by
a real data-fetching layer in a future iteration.

## Domain Hook Map

| Domain | File | Hooks |
|---|---|---|
| Households | `src/domains/households/household.hooks.ts` | `useHouseholds`, `useHousehold` |
| Leads | `src/domains/leads/lead.hooks.ts` | `useLeads`, `useLead` |
| Deals | `src/domains/deals/deal.hooks.ts` | `useDeals`, `useDeal` |
| Inventory | `src/domains/inventory/inventory.hooks.ts` | `useInventory`, `useInventoryUnit` |
| Approvals | `src/domains/approvals/approval.hooks.ts` | `useApprovals`, `useApprovalMutations` |
| Events | `src/domains/events/event.hooks.ts` | `useEvents`, `useEntityEvents`, `useServiceEvents`, `useOperatingSignals` |
| Audit | `src/domains/audit/audit.hooks.ts` | `useAuditLogs` |
| Integrations | `src/domains/integrations/integration.hooks.ts` | `useIntegrations` |
| Workstation | `src/domains/workstation/workstation.hooks.ts` | `useWorkstationCards`, `useWorkstationMutations` |
| Tasks | `src/hooks/useTasks.ts` | `useTasks` (temporary — no domain folder yet) |

## Compatibility Barrel

`src/hooks/useDomainQueries.ts` re-exports every hook and type from the
domain files above. Existing consumers that import from `useDomainQueries`
continue to work without changes.

New code should import directly from the domain hook file:

```ts
// ✅ preferred
import { useDeals } from '@/domains/deals/deal.hooks'

// ⚠️ still works, but indirect
import { useDeals } from '@/hooks/useDomainQueries'
```

## Naming Convention

- Hook files: `<domain>.hooks.ts`
- Located inside the domain folder: `src/domains/<domain>/`
- Hooks that don't yet have a domain folder live in `src/hooks/`

## Adding a New Domain Hook

1. Create `src/domains/<domain>/<domain>.hooks.ts`
2. Import `useSimulatedQuery` and `QueryResult` from `@/hooks/useQueryResult`
3. Export your hooks
4. Add a re-export line to `src/hooks/useDomainQueries.ts` for backward compatibility
5. Update consumers to import from the domain file directly
