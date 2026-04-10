# Frontend Data Layer

## Architecture

The frontend data layer provides a clean boundary between page components and data sources.

```
Pages → Hooks → Adapters → Data Source
                              ↳ Mock data (Phase 1)
                              ↳ Spark KV (Phase 2)
                              ↳ Real APIs (Phase 3)
```

### Hooks (`src/hooks/useDomainQueries.ts`)

Every domain entity has at least one query hook:
- `useHouseholds()` / `useHousehold(id)`
- `useLeads()` / `useLead(id)`
- `useDeals()` / `useDeal(id)`
- `useInventory()` / `useInventoryUnit(id)`
- `useApprovals()`
- `useEvents()` / `useEntityEvents(entityId)`
- `useServiceEvents()`
- `useWorkstationCards()`

Each returns `QueryResult<T>` with `{ data, loading, error }`.

### Adapters

Currently all hooks resolve against centralized mock data in:
- `src/lib/mockData.ts` — leads, deals, inventory, approvals, events, service events
- `src/domains/workstation/workstation.mock.ts` — workstation cards

### Transition to Real Data

When APIs or Spark KV become available:
1. Create adapter files (e.g., `src/adapters/leadAdapter.ts`)
2. Update hooks to call adapters instead of mock imports
3. Pages remain unchanged — they only consume hooks

### Design Principles

1. **No direct mock imports in pages** — always go through hooks
2. **Return consistent shapes** — `QueryResult<T>` everywhere
3. **Simulated loading states** — hooks return `loading: true` briefly for realistic UX
4. **Centralized mock data** — single source of demo data, not scattered inline
