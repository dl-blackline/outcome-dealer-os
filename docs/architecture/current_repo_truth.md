# Current Repo Truth — Phase 2 Complete

> Last updated: Phase 2 completion

## Routing

- **Status**: Fully implemented with permission enforcement
- Custom hash-based router (`src/app/router/`) using `#/app/...` format
- `RouterProvider` context with `useRouter()` hook
- Route definitions in `routes.ts` with `requiredPermission` and `requireExecutive` fields **actively enforced** in AppShell
- `matchRoute()` and `findMatchingRoute()` helpers work correctly
- `AccessDenied` component renders when role lacks required permission

## Auth

- **Status**: Fully connected
- `AuthProvider` wraps the entire app in `App.tsx`
- `AppShell` reads role from `useAuth()` — single source of truth
- Topbar role switcher updates auth context via `setRole()`
- All pages can access auth state via `useAuth()` / `useCurrentUser()`
- ⌘K keyboard shortcut opens command palette globally

## Workstation

- **Status**: Implemented with KV persistence
- Full kanban board UI with 5 columns
- Cards persisted via `workstation.service.ts` → Spark KV
- Mock data auto-seeded on first load if KV table is empty
- Card create, move, filter, search — all persist through service layer
- Auto-card rules (9 rules) connected to event bus for runtime execution

## Event Bus

- **Status**: Implemented
- `event.bus.ts` emits events → persists via publisher → checks auto-card rules → notifies listeners
- `emitEvent()` is the single entry point for all business events
- Events can automatically generate workstation cards when auto-card rules match

## Approval Actions

- **Status**: Service-connected
- Approve/deny buttons call real `approveRequest()` / `denyRequest()` services
- Each action emits events through the event bus
- Audit logging via `audit.service.ts` captures before/after state
- Local state still seeds from `MOCK_APPROVALS` for initial display

## Records Pages

- **Status**: Mock-driven with proper not-found handling
- All record detail pages use `RecordNotFound` component for invalid IDs
- No more silent fallback to first record — explicit not-found UI
- List pages have search/filter and navigation

## Dashboard

- **Status**: Role-aware with centralized adapters
- `dashboard.adapters.ts` provides `getDashboardSignals(role)` with role-specific metrics
- Sales roles see leads/deals/approvals
- Service roles see inventory/events
- Finance roles see deals/approvals/leads
- Executives see everything
- Personalized greeting with user display name

## Command Palette

- **Status**: Fully functional
- Searches across all pages and all mock records (leads, deals, inventory)
- Keyboard navigation (↑↓ arrows, Enter to select, Esc to close)
- ⌘K keyboard shortcut to open
- Grouped results by category (Pages, Records)

## Notifications

- **Status**: Event-driven
- `NotificationCenter` displays events as notifications
- Events categorized by severity (info, warning, success)
- "Mark all read" functionality
- Bell button in Topbar opens notification sheet

## Settings

- **Status**: Enhanced
- Roles page shows current user's role with auth context integration
- Integrations page has sync action buttons, health summary, and descriptions

## Data Persistence

- **Status**: Workstation and events connected, records still mock
- Workstation cards: KV-persisted via `workstation.service.ts`
- Events: KV-persisted via `event.publisher.ts`
- Approvals: Service layer available, UI seeds from mock
- Records (leads, deals, inventory, households): Still from static mock arrays
