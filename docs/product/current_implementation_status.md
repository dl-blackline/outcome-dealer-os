# Current Implementation Status

Honest audit of what is implemented, what is placeholder, and what remains mock-driven.

Last updated: Phase 2 start.

---

## Fully Implemented

### Role & Permission Model
- 13 dealership roles in `src/domains/roles/roles.ts`
- 28 permissions in `src/domains/roles/permissions.ts` with full role-permission matrix
- Policy engine in `src/domains/roles/policy.ts` with `hasPermission`, `assertPermission`, `canApprove`
- Approval policy in `src/domains/approvals/approval.policy.ts` with trade/financial/AI evaluation

### Event Taxonomy
- 49 structured event names in `src/domains/events/event.constants.ts`
- Event types, publisher, and service in `src/domains/events/`

### Auth Domain (Built but Not Connected)
- `AuthProvider` context in `src/domains/auth/auth.store.tsx`
- `useAuth`, `useCurrentUser`, `useRequireAuth` hooks
- `AuthService` resolves Spark user → `CurrentAppUser` with permissions
- Auth permission helpers in `auth.permissions.ts`
- **Note**: AuthProvider is NOT wired into App.tsx — role comes from local state in AppShell

### Application Shell
- Hash-based custom router (`src/app/router/`) with param extraction
- `AppSidebar` with role-filtered navigation (uses `ROLE_NAV_GROUPS`)
- `Topbar` with dev role switcher and command palette trigger
- `AppShell` renders pages by matching route patterns

### Workstation UI
- Full kanban board with 5 columns in `src/components/workstation/WorkstationComponents.tsx`
- Card drawer, filters (queue/priority/search), quick create dialog
- 9 auto-card rules in `workstation.autoCardRules.ts` with `generateCardFromEvent()`

### Record Pages (Mock-Driven)
- Household, Lead, Deal, Inventory — each has list + detail page
- List pages have search/filter and navigation to records
- Detail pages show entity data, linked records, and activity sections

### Ops Pages (Mock-Driven)
- Event Explorer with entity/actor filtering
- Approval Queue with status tabs and approve/deny buttons
- Audit Explorer with entity filtering

### Settings Pages (Read-Only)
- Roles page displays role-permission matrix
- Integrations page displays connection status

### Core UI Components
- StatusPill, EntityBadge, EmptyState, SectionHeader — consistently used across pages

### Domain Services (Backend Layer)
- `approval.service.ts` — full CRUD with event/audit integration
- `event.publisher.ts` — persists events to Spark KV
- `audit.service.ts` — writes structured audit logs
- `lib/db/` — KV-backed CRUD adapter (insert, update, find, delete, count)

### Domain Query Hooks
- `useDomainQueries.ts` — consistent `QueryResult<T>` pattern for all entity types
- Currently backed by static mock data arrays

---

## Placeholder / Shell Only

| System | What Exists | What's Missing |
|--------|-------------|---------------|
| Command palette | Dialog with search input | No search results, no navigation, no actions |
| Notifications | Sheet component | Static "no notifications" — not connected to events |
| Route guards | `requiredPermission` defined on routes | Not enforced — any role can access any URL |
| Auth in shell | AuthProvider built | Not used — AppShell uses local `useState` for role |

---

## Mock-Driven (Working UI, Fake Data)

| System | Status |
|--------|--------|
| Dashboard metrics | Direct imports from `MOCK_*` arrays, hardcoded trend text |
| All record pages | Read from static mock arrays via query hooks |
| Workstation cards | `useState(MOCK_WORKSTATION_CARDS)` — local only, no persistence |
| Approval actions | Approve/deny mutate local state only |
| Event explorer | Reads `MOCK_EVENTS` array |
| Audit explorer | Reads `MOCK_EVENTS` as audit proxy |

---

## Not Implemented

- Real API integration (all data is mock)
- Drag-and-drop workstation
- AI agent integration
- Campaign execution
- Multi-store support
- Real-time notifications
- Code splitting
