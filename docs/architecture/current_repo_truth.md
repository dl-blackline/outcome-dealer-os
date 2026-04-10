# Current Repo Truth — Phase 2 Baseline

> Last updated: Phase 2 start

## Routing

- **Status**: Implemented
- Custom hash-based router (`src/app/router/`) using `#/app/...` format
- `RouterProvider` context with `useRouter()` hook
- Route definitions in `routes.ts` with `requiredPermission` and `requireExecutive` fields defined but **not enforced**
- `matchRoute()` and `findMatchingRoute()` helpers work correctly
- Fallback: unmatched routes render `DashboardPage`

## Workstation

- **Status**: Implemented (mock-driven, page-local state)
- Full kanban board UI with 5 columns (inbox, today, in_progress, waiting, done)
- 8 mock cards in `workstation.mock.ts`
- Card create, move, filter, search — all page-local `useState`
- Auto-card rules defined (9 rules) but **not executed at runtime**
- No persistence — cards reset on page reload
- `WorkstationComponents.tsx` is a well-built 400-line component set

## Records Pages

- **Status**: Implemented (mock-driven, read-only)
- Household, Lead, Deal, Inventory — all have list + record pages
- Data comes from `useDomainQueries.ts` hooks backed by `mockData.ts`
- Record pages silently return `null` for unknown IDs (no explicit not-found handling)
- List pages have search/filter but no real pagination
- Navigation from list to record works via `useRouter().navigate()`

## Ops Pages

- **Status**: Implemented (mock-driven, local-only actions)
- Event Explorer: reads from `MOCK_EVENTS`, filters by entity type and actor type
- Approval Queue: reads from `MOCK_APPROVALS`, tabs for status, approve/deny buttons exist but mutate local state only
- Audit Explorer: reads from `MOCK_EVENTS` as proxy for audit, displays in table format

## Dashboard

- **Status**: Implemented (mock-driven, not role-aware)
- Reads directly from `MOCK_LEADS`, `MOCK_DEALS`, `MOCK_INVENTORY`, `MOCK_APPROVALS`, `MOCK_TASKS`
- Static metric cards with hardcoded "+2 from last week" text
- Not connected to domain query hooks or adapters
- No role-specific behavior (same dashboard for all roles)

## Auth and Role State

- **Status**: Partially implemented
- `AuthProvider` exists in `src/domains/auth/auth.store.tsx` with full context
- `useAuth()`, `useCurrentUser()`, `useRequireAuth()` hooks exist
- `AuthService` fetches from `spark.user()` and maps to `CurrentAppUser`
- **However**: `AuthProvider` is NOT used in `App.tsx` or `AppShell.tsx`
- `AppShell` uses local `useState<AppRole>('gm')` for role management
- Topbar role switcher updates local state, not auth context
- Result: auth domain is complete but disconnected from the app

## Command Palette

- **Status**: Shell only
- Opens/closes via dialog, has search input
- Displays "Command palette functionality coming soon"
- No route navigation, no record search, no actions

## Notifications

- **Status**: Shell only
- `NotificationCenter` component exists with Sheet UI
- Displays "No new notifications"
- Bell button in Topbar exists but not connected to NotificationCenter
- No event-driven notifications

## Data Persistence

- **Status**: Infrastructure exists, not wired to UI
- `SupabaseClient` class wraps `window.spark.kv` for CRUD operations
- `db.helpers.ts` exports `findById`, `findMany`, `insert`, `update`, `deleteById`, `count`
- DB row types defined for events, audit, approvals, integrations, households, customers, leads, etc.
- Services (`approval.service.ts`, `event.publisher.ts`, `audit.service.ts`) use these helpers
- **However**: UI pages read from static mock arrays, not from services/KV
- No runtime data flows through the persistence layer in normal operation

## Approval and Event Continuity

- **Status**: Service layer complete, UI disconnected
- `approval.service.ts` has full CRUD with event publishing and audit logging
- `event.publisher.ts` writes to KV-backed event bus
- `audit.service.ts` writes structured audit logs
- **However**: UI pages use `MOCK_APPROVALS` and `MOCK_EVENTS` directly
- Approve/deny buttons in ApprovalQueuePage mutate local array state

## Permission Model

- **Status**: Fully defined, partially enforced
- 13 roles × 28 permissions matrix in `permissions.ts`
- Policy engine with `hasPermission()`, `assertPermission()`, `canApprove()`
- Auth permission helpers in `auth.permissions.ts`
- Route definitions have `requiredPermission` fields
- **However**: No route guards are active — any role can access any page
- Sidebar visibility is role-filtered (nav groups) but URL access is not restricted
