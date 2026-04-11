# Phase 4 — Runtime Wiring Plan

> Honest classification of every major surface entity, migration priorities, and current bottlenecks.
>
> Generated from a full codebase audit. No optimistic projections — only what the code actually does today.

---

## 1. Entity Classification Matrix

Every user-facing entity in the system is classified below. The columns describe:

| Column | Meaning |
|--------|---------|
| **Entity** | The domain concept surfaced in the UI |
| **Service Layer** | Whether a domain service exists in `src/domains/` that uses db helpers |
| **Page Data Source** | What the page *actually* reads at render time |
| **Mutation Source** | Where writes/state changes happen |
| **Classification** | Honest architectural tier (see legend below) |

### Classification Legend

| Tier | Definition |
|------|-----------|
| 🟢 **runtime-backed** | Domain service → db helpers → in-memory store. Full CRUD path exists. |
| 🟡 **runtime-backed, UI-disconnected** | Service layer exists and works, but the page reads from mock arrays or inline data instead of calling the service. Two parallel data universes. |
| 🟠 **hook-backed via mock arrays** | `useSimulatedQuery()` wraps a static array from `mockData.ts`. No service call, no persistence. |
| 🔴 **page-local only** | State lives in React `useState`. Lost on navigation or refresh. |
| ⚪ **inline/derived** | Hardcoded inline data or computed from another mock source. |

### Entity Table

| Entity | Service Layer | Page Data Source | Mutation Source | Classification |
|--------|--------------|------------------|-----------------|---------------|
| **Workstation Cards** | `workstation.service.ts` — full CRUD, column moves, complete/reopen | `useWorkstationCards()` reads `MOCK_WORKSTATION_CARDS` via `useSimulatedQuery()`. `useWorkstationMutations()` initializes local state from same mock array. | `useWorkstationMutations()` — React `useState`. `moveCard`, `createCard`, `completeCard`, `reopenCard` mutate local state only. | 🟡 runtime-backed, UI-disconnected |
| **Events** | `event.service.ts` — list/filter. `event.publisher.ts` — persist to `event_bus` table. `event.bus.ts` — emit + auto-card generation. | `useEvents()` reads `MOCK_EVENTS` from `mockData.ts` via `useSimulatedQuery()`. | No write path from UI. Events are created by service-layer side effects. | 🟡 runtime-backed, UI-disconnected |
| **Audit Logs** | `audit.service.ts` — `writeAuditLog()`, `listAuditLogs()` via db helpers. | `useAuditLogs()` returns inline `AUDIT_LOG_DATA` (6 hardcoded entries) via `useSimulatedQuery()`. | `writeAuditLog()` called by other services internally. UI has no write path. | 🟡 runtime-backed, UI-disconnected |
| **Approvals** | `approval.service.ts` — `requestApproval()`, `approveApproval()`, `denyApproval()`, `listApprovals()` via db helpers. | `useApprovals()` reads `MOCK_APPROVALS` from `mockData.ts`. `useApprovalMutations()` initializes local state from same array. | `useApprovalMutations()` — React `useState`. `approveItem()` and `denyItem()` modify local state only. | 🟡 runtime-backed, UI-disconnected |
| **Households** | `household.service.ts` — full CRUD. `household.queries.ts` exists. | `useHouseholds()` / `useHousehold(id)` return inline `HOUSEHOLD_DATA` (4 entries) via `useSimulatedQuery()`. | No write path from UI. | 🟡 runtime-backed, UI-disconnected |
| **Leads** | `lead.service.ts` — full CRUD with permissions, audit, events. | `useLeads()` / `useLead(id)` read `MOCK_LEADS` from `mockData.ts` via `useSimulatedQuery()`. | No write path from UI. | 🟡 runtime-backed, UI-disconnected |
| **Deals** | `deal.types.ts` exists. **No `deal.service.ts`.** | `useDeals()` / `useDeal(id)` read `MOCK_DEALS` from `mockData.ts` via `useSimulatedQuery()`. | No write path from UI. | 🟠 hook-backed via mock arrays |
| **Inventory** | `inventory.service.ts` — full CRUD. | `useInventory()` / `useInventoryUnit(id)` read `MOCK_INVENTORY` from `mockData.ts` via `useSimulatedQuery()`. | No write path from UI. | 🟡 runtime-backed, UI-disconnected |
| **Tasks** | **No `task.service.ts` exists.** | `useTasks()` reads `MOCK_TASKS` from `mockData.ts` via `useSimulatedQuery()`. | No write path. Displayed on dashboard only. | 🟠 hook-backed via mock arrays |
| **Integrations** | `integration.service.ts` — status, sync tracking. | `useIntegrations()` returns inline `INTEGRATION_DATA` (4 entries) via `useSimulatedQuery()`. | No write path from UI. | 🟡 runtime-backed, UI-disconnected |
| **Dashboard Metrics** | N/A (computed) | `dashboard.adapters.ts` imports `MOCK_LEADS`, `MOCK_DEALS`, `MOCK_INVENTORY`, `MOCK_APPROVALS`, `MOCK_EVENTS`, `MOCK_WORKSTATION_CARDS` directly. Computes role-specific metrics. | Read-only derived view. | ⚪ inline/derived from mock arrays |
| **Operating Signals** | N/A (derived) | `useOperatingSignals()` transforms `MOCK_EVENTS` into severity-classified signals. | Read-only derived view. | ⚪ inline/derived from mock arrays |
| **Notifications** | None | `NotificationCenter.tsx` consumes `useOperatingSignals()`. Local `readIds` state for read/unread. | `useState` for read tracking. | 🔴 page-local only |
| **Command Palette** | None | `CommandPalette.tsx` uses `useLeads()`, `useDeals()`, `useInventory()`, `useHouseholds()` + hardcoded nav/action items. | N/A — search/navigation only. | ⚪ inline/derived from mock arrays |
| **Service Events** | N/A | `useServiceEvents()` reads `MOCK_SERVICE_EVENTS` from `mockData.ts`. | No write path. | 🟠 hook-backed via mock arrays |

---

## 2. The Core Architectural Problem

```
┌─────────────────────┐     ┌──────────────────────────┐
│   Domain Services    │     │    useDomainQueries.ts    │
│                      │     │                           │
│  lead.service.ts     │     │  useLeads() → MOCK_LEADS  │
│  approval.service.ts │     │  useApprovals() → MOCK_*  │
│  audit.service.ts    │     │  useAuditLogs() → inline  │
│  event.service.ts    │     │  useEvents() → MOCK_*     │
│  workstation.svc.ts  │     │  useWorkstation() → MOCK_*│
│  household.svc.ts    │     │  useHouseholds() → inline │
│         ...          │     │         ...               │
│                      │     │                           │
│    ┌─────────┐       │     │    (Pages read from here) │
│    │ db hlprs│       │     └──────────────────────────┘
│    └────┬────┘       │
│         ▼            │       ← No connection between
│  ┌────────────┐      │          these two columns.
│  │ KV store   │      │
│  └────────────┘      │
└─────────────────────┘
```

**Two parallel data universes exist.** Domain services persist to the in-memory store. Pages read from static mock arrays. They never meet.

---

## 3. Current Bottlenecks

### Bottleneck 1: `useDomainQueries.ts` is a monolith

All 17+ hooks live in a single 220+ line file. It mixes:
- Query hooks (read-only data)
- Mutation hooks (local state management)
- Inline datasets (households, audit logs, integrations)
- Derived computations (operating signals)

**Impact**: Every entity migration requires touching this file. High merge-conflict risk.

### Bottleneck 2: `useSimulatedQuery()` masks the data source

The generic `useSimulatedQuery<T>(resolver)` wrapper accepts any `() => T` function. It simulates async loading with an 80ms delay but has no cache, no refetch, no invalidation. Hooks pass it static array references.

**Impact**: Replacing the resolver with a service call is the simplest migration path — but the lack of cache/invalidation means services will be called on every mount.

### Bottleneck 3: Mutations are React-local

`useApprovalMutations()` and `useWorkstationMutations()` use `useState` initialized from mock arrays. Changes are lost on navigation. The service layer has the same operations (`approveApproval`, `moveWorkstationCard`) ready to go.

**Impact**: Wiring mutations to services requires state management rethinking — either optimistic updates or a query-invalidation pattern.

### Bottleneck 4: `dashboard.adapters.ts` hardcodes mock imports

The dashboard adapter directly imports 6 mock arrays and computes metrics from them. It cannot reflect runtime state.

**Impact**: Must be rewritten to call services or accept injected data once entities are runtime-backed.

### Bottleneck 5: No `deal.service.ts` or `task.service.ts`

Deals have types but no service. Tasks have neither types nor service. These must be built from scratch.

**Impact**: Cannot wire these entities to runtime without new service files.

---

## 4. Recommended Migration Order

The ordering prioritizes: (a) entities where services already exist, (b) entities with the highest user-facing impact, (c) dependency chains.

### Wave 1 — Wire existing services to hooks (highest leverage)

| Priority | Entity | Work Required |
|----------|--------|--------------|
| **1.1** | **Workstation Cards** | Replace `useWorkstationMutations()` local state with calls to `workstation.service.ts`. Add seed call on first mount. Already has full CRUD. Highest interaction surface. |
| **1.2** | **Events / Audit Logs** | Replace `useEvents()` and `useAuditLogs()` with calls to `event.service.ts` and `audit.service.ts`. These are read-only in the UI — simplest wiring. Once connected, all service-emitted events become visible. |
| **1.3** | **Approvals** | Replace `useApprovalMutations()` with calls to `approval.service.ts`. Service already has approve/deny/list. |

### Wave 2 — Wire remaining CRUD entities

| Priority | Entity | Work Required |
|----------|--------|--------------|
| **2.1** | **Leads** | Replace `useLeads()` with `lead.service.ts` calls. Service is full-featured with permissions. |
| **2.2** | **Households** | Replace `useHouseholds()` inline data with `household.service.ts` calls. Seed initial households. |
| **2.3** | **Inventory** | Replace `useInventory()` with `inventory.service.ts` calls. |
| **2.4** | **Integrations** | Replace `useIntegrations()` inline data with `integration.service.ts` calls. |

### Wave 3 — Build missing services

| Priority | Entity | Work Required |
|----------|--------|--------------|
| **3.1** | **Deals** | Create `deal.service.ts` (types already exist in `deal.types.ts`). Wire `useDeals()`. |
| **3.2** | **Tasks** | Create `task.types.ts` + `task.service.ts`. Wire `useTasks()`. |

### Wave 4 — Derived surfaces

| Priority | Entity | Work Required |
|----------|--------|--------------|
| **4.1** | **Dashboard Adapters** | Rewrite `dashboard.adapters.ts` to call services instead of importing mock arrays. Must happen after Waves 1–3 so data exists at runtime. |
| **4.2** | **Operating Signals** | Derive from `event.service.ts` instead of `MOCK_EVENTS`. Depends on Wave 1.2. |
| **4.3** | **Notifications** | Wire `NotificationCenter` to event bus listener for real-time signals. |
| **4.4** | **Command Palette** | Will automatically benefit once entity hooks return runtime data. No explicit work needed unless search requires service calls. |

### Wave 5 — Cleanup

| Priority | Task |
|----------|------|
| **5.1** | Delete `src/lib/mockData.ts` once all consumers are removed |
| **5.2** | Delete or gut `useDomainQueries.ts` — split surviving hooks into domain-specific files under `src/domains/*/hooks/` |
| **5.3** | Remove `useSimulatedQuery()` in favor of direct async service calls with proper loading/error state |

---

## 5. File Impact Map

Files that will be touched during migration, grouped by wave:

```
Wave 1:
  src/hooks/useDomainQueries.ts          — modify useWorkstationMutations, useEvents, useAuditLogs, useApprovalMutations
  src/app/pages/WorkstationPage.tsx       — may need refetch/invalidation
  src/app/pages/EventExplorerPage.tsx     — no changes if hook signature preserved
  src/app/pages/AuditExplorerPage.tsx     — no changes if hook signature preserved
  src/app/pages/ApprovalQueuePage.tsx     — may need async mutation handling

Wave 2:
  src/hooks/useDomainQueries.ts          — modify useLeads, useHouseholds, useInventory, useIntegrations
  (All corresponding list/record pages)

Wave 3:
  src/domains/deals/deal.service.ts      — NEW
  src/domains/tasks/task.service.ts      — NEW
  src/domains/tasks/task.types.ts        — NEW
  src/hooks/useDomainQueries.ts          — modify useDeals, useTasks

Wave 4:
  src/domains/dashboard/dashboard.adapters.ts — rewrite
  src/hooks/useDomainQueries.ts               — modify useOperatingSignals
  src/components/shell/NotificationCenter.tsx  — add event bus listener

Wave 5:
  src/lib/mockData.ts                    — DELETE
  src/hooks/useDomainQueries.ts          — DELETE or DECOMPOSE
```

---

## 6. Design Constraints

1. **Hook return signatures must not change** — Pages depend on `QueryResult<T>` with `data`, `isLoading`, `error`. Wiring to services must preserve this contract.
2. **Seed data is still needed** — The in-memory store starts empty. A bootstrap/seed step must populate initial data for demo/development.
3. **Service context is required** — Domain services expect a `ServiceContext` (user, role). Hooks must obtain this from auth context.
4. **Event side effects must remain** — Services emit events and write audit logs. The event bus auto-generates workstation cards. This chain must be preserved during migration.
