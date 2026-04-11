# Direct Mock Dependency Inventory

> Complete inventory of every file, hook, and inline dataset that consumes mock data directly.
>
> Use this document to track migration progress. When a row is wired to runtime, mark it done and remove the mock dependency.

---

## 1. Files That Import from `src/lib/mockData.ts`

| File | Imported Symbols | Purpose |
|------|-----------------|---------|
| `src/domains/leads/lead.hooks.ts` | `MOCK_LEADS`, `MockLead` | Feeds `useLeads()` / `useLead()` |
| `src/domains/deals/deal.hooks.ts` | `MOCK_DEALS`, `MockDeal` | Feeds `useDeals()` / `useDeal()` |
| `src/domains/inventory/inventory.hooks.ts` | `MOCK_INVENTORY`, `MockInventoryUnit` | Feeds `useInventory()` / `useInventoryUnit()` |
| `src/domains/approvals/approval.hooks.ts` | `MOCK_APPROVALS`, `MockApproval` | Feeds `useApprovals()` / `useApprovalMutations()` |
| `src/domains/events/event.hooks.ts` | `MOCK_EVENTS`, `MOCK_SERVICE_EVENTS`, `MockEvent`, `MockServiceEvent` | Feeds `useEvents()` / `useEntityEvents()` / `useServiceEvents()` / `useOperatingSignals()` |
| `src/domains/tasks/task.hooks.ts` | `MOCK_TASKS`, `MockTask` | Seeds in-memory store + feeds `useTasks()` |
| `src/domains/dashboard/dashboard.adapters.ts` | `MOCK_LEADS`, `MOCK_DEALS`, `MOCK_INVENTORY`, `MOCK_APPROVALS`, `MOCK_EVENTS` + `MockLead`, `MockDeal`, `MockEvent` types | Computes role-specific dashboard metrics directly from mock arrays |

> **Note:** `src/hooks/useDomainQueries.ts` is now a compatibility re-export barrel and no longer imports from `mockData.ts` directly.

### Separate Mock Files

| File | Imported By | Symbols |
|------|------------|---------|
| `src/domains/workstation/workstation.mock.ts` | `workstation.service.ts`, `dashboard.adapters.ts` (via barrel), `workstation.hooks.ts` (via barrel) | `MOCK_WORKSTATION_CARDS` |

---

## 2. Inline Static Datasets (now in domain hook files)

These datasets were previously inside `useDomainQueries.ts` and have been moved to their respective domain hook files.

| Constant | File | Records | Type | Content |
|----------|------|---------|------|---------|
| `HOUSEHOLD_SEED` | `src/domains/households/household.hooks.ts` | 4 | `HouseholdSummary[]` | Mitchell, Johnson, Rodriguez, Thompson families with member counts, loyalty tiers, lifetime values |
| `AUDIT_LOG_DATA` | `src/domains/audit/audit.hooks.ts` | 6 | `AuditLogEntry[]` | Hardcoded audit entries: lead creation, deal stage update, approval request, login, inventory price change, lead assignment |
| `INTEGRATION_DATA` | `src/domains/integrations/integration.hooks.ts` | 4 | `IntegrationStatus[]` | DMS Sync (healthy), Credit Bureau (warning), Lender Portal (healthy), Marketing Platform (error) |
| `WARNING_EVENTS` | `src/domains/events/event.hooks.ts` | varies | `string[]` | Event names classified as warning severity |
| `SUCCESS_EVENTS` | `src/domains/events/event.hooks.ts` | varies | `string[]` | Event names classified as success severity |
| `CRITICAL_EVENTS` | `src/domains/events/event.hooks.ts` | varies | `string[]` | Event names classified as critical severity |

---

## 3. Hooks That Use `useSimulatedQuery()`

Every hook below calls `useSimulatedQuery<T>(resolver)` (defined in `src/hooks/useQueryResult.ts`) which wraps the resolver in a `useMemo` + `useEffect` with an 80ms simulated delay. Returns `QueryResult<T>` with `{ data, loading, error }`. Each hook now lives in its respective domain hook file (see `docs/architecture/domain_runtime_hook_model.md`).

### Read-Only Query Hooks

| Hook | Resolver Input | Returns | Consumers |
|------|---------------|---------|-----------|
| `useLeads()` | `() => MOCK_LEADS` | `QueryResult<MockLead[]>` | `LeadListPage`, `DashboardPage`, `CommandPalette` |
| `useLead(id)` | `() => MOCK_LEADS.find(l => l.id === id)` | `QueryResult<MockLead \| null>` | `LeadRecordPage` |
| `useDeals()` | `() => MOCK_DEALS` | `QueryResult<MockDeal[]>` | `DealListPage`, `DashboardPage`, `CommandPalette` |
| `useDeal(id)` | `() => MOCK_DEALS.find(d => d.id === id)` | `QueryResult<MockDeal \| null>` | `DealRecordPage` |
| `useInventory()` | `() => MOCK_INVENTORY` | `QueryResult<MockInventoryUnit[]>` | `InventoryListPage`, `CommandPalette` |
| `useInventoryUnit(id)` | `() => MOCK_INVENTORY.find(u => u.id === id)` | `QueryResult<MockInventoryUnit \| null>` | `InventoryUnitPage` |
| `useTasks()` | `() => MOCK_TASKS` | `QueryResult<MockTask[]>` | `DashboardPage` |
| `useApprovals()` | `() => MOCK_APPROVALS` | `QueryResult<MockApproval[]>` | `DashboardPage` (count only) |
| `useEvents()` | `() => MOCK_EVENTS` | `QueryResult<MockEvent[]>` | `EventExplorerPage` |
| `useEntityEvents(entityId)` | `() => MOCK_EVENTS.filter(e => e.entityId === entityId)` | `QueryResult<MockEvent[]>` | Entity detail pages |
| `useServiceEvents()` | `() => MOCK_SERVICE_EVENTS` | `QueryResult<MockServiceEvent[]>` | (currently unused or minimal) |
| `useAuditLogs()` | `() => AUDIT_LOG_DATA` (inline) | `QueryResult<AuditLogEntry[]>` | `AuditExplorerPage` |
| `useHouseholds()` | `() => HOUSEHOLD_DATA` (inline) | `QueryResult<HouseholdSummary[]>` | `HouseholdListPage`, `CommandPalette` |
| `useHousehold(id)` | `() => HOUSEHOLD_DATA.find(h => h.id === id)` (inline) | `QueryResult<HouseholdSummary \| null>` | `HouseholdRecordPage` |
| `useIntegrations()` | `() => INTEGRATION_DATA` (inline) | `QueryResult<IntegrationStatus[]>` | `IntegrationsSettingsPage` |
| `useWorkstationCards()` | `() => MOCK_WORKSTATION_CARDS` | `QueryResult<WorkstationCard[]>` | `DashboardPage` (summary) |
| `useOperatingSignals()` | Derived: maps `MOCK_EVENTS` → severity-classified signals | `QueryResult<OperatingSignal[]>` | `NotificationCenter` |

### Mutation Hooks (Local State)

| Hook | Initial State | Mutations | Consumers |
|------|--------------|-----------|-----------|
| `useApprovalMutations()` | `useState(MOCK_APPROVALS)` | `approveItem(id, notes?)` → sets status `'granted'`; `denyItem(id, notes?)` → sets status `'denied'` | `ApprovalQueuePage` |
| `useWorkstationMutations()` | `useState(MOCK_WORKSTATION_CARDS)` | `moveCard(id, column)` → updates column; `createCard(partial)` → pushes new card; `completeCard(id)` → sets status `'completed'`; `reopenCard(id)` → resets to `'open'` | `WorkstationPage` |

---

## 4. Mock Data Flow Diagrams

### Pattern A: Hook-backed via mock array (most entities)

```
mockData.ts                domain hook file                     Page Component
─────────────             ──────────────────────           ─────────────────
MOCK_LEADS ──import──→  useLeads()                    ──→  LeadListPage
                           └─ useSimulatedQuery(          { data, loading }
                                () => MOCK_LEADS          renders table
                              )
```

### Pattern B: Inline dataset (households, audit, integrations)

```
domain hook file                                 Page Component
───────────────────────────                     ─────────────────
const HOUSEHOLD_DATA = [...]  ──→  useHouseholds()  ──→  HouseholdListPage
                                     └─ useSimulatedQuery(
                                          () => HOUSEHOLD_DATA
                                        )
```

### Pattern C: Local state mutations (approvals, workstation)

```
mockData.ts              domain hook file                      Page Component
─────────────           ──────────────────────                 ─────────────────
MOCK_APPROVALS ─────→  useApprovalMutations()              ──→  ApprovalQueuePage
                          └─ const [items, setItems]             calls approveItem(id)
                               = useState(MOCK_APPROVALS)        which updates local
                             approveItem = (id) =>               state only
                               setItems(prev => ...)
                                                                 ⚠ Lost on navigation
```

### Pattern D: Direct import (dashboard adapters)

```
mockData.ts                    dashboard.adapters.ts            DashboardPage
─────────────                 ──────────────────────           ─────────────────
MOCK_LEADS ───────import───→  getDashboardSignals(role)   ──→  renders metrics
MOCK_DEALS ───────import───→    computes counts/filters
MOCK_INVENTORY ───import───→    returns MetricCard[]
MOCK_APPROVALS ───import───→
MOCK_EVENTS ──────import───→
```

---

## 5. Corresponding Domain Services (Ready to Wire)

For reference, these services exist and expose equivalent operations. The migration task is to replace the mock-data resolver in each hook with a call to the corresponding service function.

| Mock Source | Replacement Service | Service Functions |
|-------------|-------------------|-------------------|
| `MOCK_LEADS` | `lead.service.ts` | `listLeads()`, `getLeadById()` |
| `MOCK_DEALS` | **None — must create `deal.service.ts`** | — |
| `MOCK_INVENTORY` | `inventory.service.ts` | `listInventoryUnits()`, `getInventoryUnitById()` |
| `MOCK_APPROVALS` | `approval.service.ts` | `listApprovals()`, `approveApproval()`, `denyApproval()` |
| `MOCK_EVENTS` | `event.service.ts` | `listEventBusRows()`, `getEventById()` |
| `MOCK_SERVICE_EVENTS` | (part of event system) | `listEventBusRows()` with filter |
| `MOCK_TASKS` | **None — must create `task.service.ts`** | — |
| `MOCK_WORKSTATION_CARDS` | `workstation.service.ts` | `listWorkstationCards()`, `moveWorkstationCard()`, `createWorkstationCard()`, `completeWorkstationCard()` |
| `HOUSEHOLD_DATA` (inline) | `household.service.ts` | `listHouseholds()`, `getHouseholdById()` |
| `AUDIT_LOG_DATA` (inline) | `audit.service.ts` | `listAuditLogs()` |
| `INTEGRATION_DATA` (inline) | `integration.service.ts` | `listIntegrations()`, `getIntegrationStatus()` |

---

## 6. Migration Checklist

Use this checklist to track progress as each entity is wired to its runtime service.

- [ ] **Workstation Cards** — Replace `useWorkstationMutations()` local state with `workstation.service.ts` calls
- [ ] **Events** — Replace `useEvents()` mock array with `event.service.ts` calls
- [ ] **Audit Logs** — Replace `useAuditLogs()` inline data with `audit.service.ts` calls
- [ ] **Approvals** — Replace `useApprovalMutations()` local state with `approval.service.ts` calls
- [ ] **Leads** — Replace `useLeads()` mock array with `lead.service.ts` calls
- [ ] **Households** — Replace `useHouseholds()` inline data with `household.service.ts` calls
- [ ] **Inventory** — Replace `useInventory()` mock array with `inventory.service.ts` calls
- [ ] **Integrations** — Replace `useIntegrations()` inline data with `integration.service.ts` calls
- [ ] **Deals** — Create `deal.service.ts`, then replace `useDeals()` mock array
- [ ] **Tasks** — Create `task.service.ts`, then replace `useTasks()` mock array
- [ ] **Dashboard Adapters** — Rewrite `dashboard.adapters.ts` to call services
- [ ] **Operating Signals** — Derive from runtime events instead of `MOCK_EVENTS`
- [ ] **Notifications** — Wire to event bus for real-time signals
- [ ] **Delete `mockData.ts`** — Final cleanup after all consumers migrated
- [x] **Decompose `useDomainQueries.ts`** — Split into domain-specific hook files (done — see `domain_runtime_hook_model.md`)
