# Mock Elimination Plan

## Current State

All pages consume data through `useDomainQueries.ts` hooks. No page imports `MOCK_*` directly.
However, the hooks themselves resolve to static seed data with simulated loading.

## Elimination Priority

### Phase 1 — Wire Runtime Services to Hooks (High Priority)

These services are fully implemented with KV persistence and can be wired immediately:

1. **Workstation cards** — `workstation.service.ts` → `useWorkstationCards()`
2. **Approvals** — `approval.service.ts` → `useApprovals()`, `useApprovalMutations()`
3. **Events** — `event.service.ts` → `useEvents()`
4. **Audit** — `audit.service.ts` → `useAuditLogs()`

### Phase 2 — Core Entity Services (Medium Priority)

These need async initialization and proper seed flow:

5. **Leads** — `lead.service.ts` → `useLeads()`
6. **Deals** — `deal.service.ts` → `useDeals()`
7. **Inventory** — seed into KV on boot → `useInventory()`

### Phase 3 — Remaining Mock Data (Low Priority)

8. **Households** — move inline data to a service or dedicated adapter
9. **Tasks** — create a task domain service
10. **Service Events** — create a service event domain

## Implementation Pattern

For each entity:

```
1. Ensure domain service exists with list/get/create operations
2. Add seed function that writes MOCK_* data to KV on first boot
3. Update hook to call service.list() / service.get() instead of returning static array
4. Verify pages still render correctly with same data
5. Remove MOCK_* import from hook
```

## Seed-on-Boot Strategy

When the KV store is empty (first run), the application should:

1. Check if seed data exists: `db.count('leads') === 0`
2. If empty, write `MOCK_LEADS` to KV: `MOCK_LEADS.forEach(l => db.insert('leads', l))`
3. After seeding, hooks read from KV instead of static arrays

This preserves the demo experience while making the data layer real.

## Files to Remove When Complete

Once all hooks read from runtime services:

- `src/lib/mockData.ts` → convert to `src/lib/seedData.ts` (only used for initial seeding)
- Inline mock arrays in `useDomainQueries.ts` → remove `HOUSEHOLD_DATA`, `AUDIT_LOG_DATA`, `INTEGRATION_DATA`
