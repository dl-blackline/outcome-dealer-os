# Current Implementation Status

Honest audit of what is implemented, what is placeholder, and what scaffold remnants exist.

Last updated: Phase 3, Prompt 30 (final).

---

## Implemented

### Role & Permission Model
- 14 dealership roles with display names, descriptions, and nav group assignments
- 28 granular permissions (e.g., `leads:create`, `deals:approve`, `inventory:transfer`)
- Policy engine (`src/domains/auth/policies/`) with route guards and permission checks
- Role hierarchy awareness for approval chains
- Roles page shows descriptions, permissions, and navigation access per role

### Canonical Type System
- 30+ business objects in `src/types/canonical.ts`
- Full TypeScript typing for: Household, Lead, Deal, DealFinancials, Vehicle, Inventory, Appointment, ServiceTicket, TradeIn, CreditApplication, LenderSubmission, Warranty, Task, Notification, and more
- Enum types for deal stages, lead sources, vehicle conditions, appointment types, etc.

### Event Taxonomy
- 49 structured event types in `src/types/events.ts`
- Covers all domains: CRM, deals, F&I, inventory, service, approvals, system
- Each event has typed payload, timestamp, actor, and metadata
- Designed for audit trails, AI training, and state reconstruction

### Auth Domain
- `AuthProvider` context with current user and role state
- `useAuth` hook for component-level access to auth state
- Permission checking utilities (`hasPermission`, `canAccess`)
- Route guards that enforce role-based access
- Role switcher in the topbar for development/demo purposes

### Application Shell
- `AppSidebar` with role-aware navigation sections (Dashboard, Workstation, Records, Operations, Settings)
- `Topbar` with role switcher, notifications button, command palette trigger
- `NotificationCenter` with severity-coded operating signals and read tracking
- `CommandPalette` with full navigation, entity search (leads/deals/inventory/households), and context actions
- Dark-first premium visual design with Space Grotesk / Inter / JetBrains Mono typography

### Core UI Components
- `StatusPill` — color-coded status indicators for deals, leads, tasks
- `EntityBadge` — compact entity reference display with type-specific colors
- `EmptyState` — structured empty state with icon, title, description, and action
- `SectionHeader` — consistent section headers with optional actions

### Domain Query Hooks (`useDomainQueries.ts`)
- All 15 pages consume data through `QueryResult<T>` hooks with loading states
- No page imports `MOCK_*` arrays directly
- Mutation hooks: `useApprovalMutations()`, `useWorkstationMutations()`
- Entity hooks: `useLeads()`, `useDeals()`, `useInventory()`, `useHouseholds()`, `useApprovals()`, `useEvents()`, `useAuditLogs()`, `useIntegrations()`, `useOperatingSignals()`

### Domain Module Structure
- 21 domains under `src/domains/` with consistent internal structure
- Each domain has: types, services (interfaces), queries, and policies
- Runtime services implemented with KV persistence for: workstation, approvals, events, audit, integrations, leads, deals

### Database Adapter
- Spark KV-based adapter in `src/services/`
- CRUD helper functions for standard entity operations

### Workstation
- Full kanban board with 5 columns (Inbox, Today, In Progress, Waiting, Done)
- HTML5 drag-and-drop between columns with visual drop targets
- Card creation via Quick Create dialog
- Filtering by queue type, priority, and text search
- Card detail drawer with metadata, linked records, and lifecycle actions
- Card lifecycle: active → completed → reopened
- Complete/Reopen buttons in drawer
- Auto-card rules (9 event-to-card mappings)

### Approval Queue
- Tab filtering: pending / granted / denied / all
- Two-click resolution with optional notes
- Resolution metadata display (resolved-by, timestamp, notes)
- `useApprovalMutations()` with optimistic local state updates

### Event/Audit/Notification
- OperatingSignal unified type for events, audit, and notifications
- Severity classification: critical / warning / success / info
- Event Explorer with entity and actor filtering, severity badges
- Audit Explorer with role/entity/timestamp filtering
- Notification Center with unread count and mark-all-read

### Record Pages (All Hook-Backed)
- Lead list + detail with linked household and deals (EntityBadge navigation)
- Deal list + detail with linked lead/household/inventory, deal stage progress, approvals
- Inventory list + detail with status/aging/pricing
- Household list + detail with linked leads and deals

### Dashboard
- Clickable metric cards (Active Leads, Deals, Pending Approvals, Aging Inventory)
- Urgency indicators (yellow/red borders on cards needing attention)
- Workstation summary with column breakdown
- Recent leads and active deals tables with clickable rows
- Tasks section with priority badges

### Settings
- Roles page with descriptions, permission lists, and navigation access display
- Integrations page with status, sync architecture notes, and per-integration documentation

### Architecture Documentation
- 24 documents across `docs/architecture/`, `docs/product/`, and `docs/ux/`

---

## Remaining Gaps

### Hook-to-Service Wiring
- Domain query hooks read from static seed data, not from KV-backed runtime services
- Services are fully implemented but not wired to the hook layer
- See `docs/architecture/mock_elimination_plan.md` for transition path

### Household Deduplication
- Household data defined in useDomainQueries.ts inline, not from a shared source
- Need dedicated household.service.ts with seed-on-boot

### Task Domain
- No dedicated task service — tasks are inline mock data only
- Low priority but needed for full runtime coverage

### Dashboard Role Filtering
- Metrics are universal across all roles
- Should filter/prioritize based on current user's role
- Role-specific adapter exists in `dashboard.adapters.ts` but not connected

### Integration Manual Controls
- No manual sync trigger from UI
- No credential management or configuration editing

---

## Phase 3 Summary

Phase 3 (Prompts 20–30) completed the integration layer:
- All pages consume data through hooks with loading states
- Workstation has full card lifecycle with drag-and-drop
- Approval queue has resolution flow with notes
- Events, audit, and notifications unified through OperatingSignal
- All record pages have cross-surface EntityBadge navigation
- Dashboard has clickable metrics and workstation summary
- Command palette indexes 4 entity types and provides context actions
- Settings pages document role and integration architecture
- 14 new documentation files created
