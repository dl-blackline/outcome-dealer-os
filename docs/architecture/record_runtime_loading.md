# Record Runtime Loading

## Record Loading Pattern

All record detail pages follow the same pattern:

1. Extract `params.id` from `useRouter()`
2. Look up the record in mock data
3. If not found, render `<RecordNotFound />` component
4. If found, render the full record view

## Not-Found Handling

**Before Phase 2**: Record pages used `?? MOCK_DATA[0]` — silently falling back to the first record if the ID didn't match. This was deceptive.

**After Phase 2**: Record pages check for `null` explicitly and render `<RecordNotFound />` with:
- Entity type label (e.g., "Lead", "Deal")
- "Go Back" button that navigates to the list page

## Record Pages

| Page | Data Source | Not-Found |
|------|-----------|-----------|
| LeadRecordPage | `MOCK_LEADS.find(l => l.id === params.id)` | ✅ RecordNotFound |
| DealRecordPage | `MOCK_DEALS.find(d => d.id === params.id)` | ✅ RecordNotFound |
| HouseholdRecordPage | `MOCK_HOUSEHOLDS.find(h => h.id === params.id)` | ✅ RecordNotFound |
| InventoryUnitPage | `MOCK_INVENTORY.find(u => u.id === params.id)` | ✅ RecordNotFound |

## List Pages

| Page | Data Source | Search |
|------|-----------|--------|
| LeadListPage | `MOCK_LEADS` | ✅ name search + status tabs |
| DealListPage | `MOCK_DEALS` | ✅ status tabs |
| HouseholdListPage | `useHouseholds()` hook | ✅ name search |
| InventoryListPage | `MOCK_INVENTORY` | ✅ text search |

## Future: Service-Based Loading

When real APIs exist, the pattern will evolve to:
1. Call record service (e.g., `getLeadById(id)`)
2. Handle loading state (show skeleton)
3. Handle error state (show error message)
4. Handle not-found (show RecordNotFound)
5. Handle success (render record)

The query hooks in `useDomainQueries.ts` already support this pattern with `{ data, loading, error }`.
