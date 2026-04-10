# Mock to Real Data Transition Guide

## Current State (Phase 1)

All data flows through centralized mock adapters:
- `src/lib/mockData.ts` — business objects (leads, deals, inventory, approvals, events)
- `src/domains/workstation/workstation.mock.ts` — workstation cards
- `src/hooks/useDomainQueries.ts` — query hooks that page components consume

## Transition Steps

### Step 1: Create Adapter Layer
For each domain, create an adapter file:
```
src/adapters/
  leadAdapter.ts
  dealAdapter.ts
  inventoryAdapter.ts
  approvalAdapter.ts
  eventAdapter.ts
  workstationAdapter.ts
```

Each adapter exports functions matching the hook signatures:
- `fetchLeads(): Promise<Lead[]>`
- `fetchLead(id: string): Promise<Lead | null>`

### Step 2: Update Hooks
Change hooks from synchronous mock resolution to async adapter calls:
```typescript
export function useLeads(): QueryResult<Lead[]> {
  // Before: return useSimulatedQuery(() => MOCK_LEADS)
  // After:  return useAsyncQuery(() => fetchLeads())
}
```

### Step 3: Data Source Swap
Adapters can point to:
- Spark KV (`window.spark.kv`) — for Phase 2 persistent storage
- REST/GraphQL APIs — for Phase 3 server integration
- Supabase — if a real DB is configured

### Step 4: Remove Mock Data
Once all adapters point to real sources, mock data files become test fixtures only.

## Rules
- Pages NEVER import from `mockData.ts` directly — always through hooks
- Adapters handle serialization, error wrapping, and caching
- Types remain canonical (`src/types/canonical.ts`) regardless of data source
