# Current Implementation Status

Honest audit of what is implemented, what is placeholder, and what scaffold remnants exist.

Last updated: Phase 1 completion.

---

## Implemented

### Role & Permission Model
- 13 dealership roles with display names and descriptions
- 28 granular permissions (e.g., `leads:create`, `deals:approve`, `inventory:transfer`)
- Policy engine (`src/domains/auth/policies/`) with route guards and permission checks
- Role hierarchy awareness for approval chains

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
- `AppSidebar` with role-aware navigation sections (Dashboard, Records, Operations, Settings)
- `Topbar` with role switcher, notifications icon, and user menu
- `CommandPalette` shell (keyboard shortcut trigger present)
- Dark-first premium visual design with Space Grotesk / Inter / JetBrains Mono typography
- Responsive layout with collapsible sidebar

### Core UI Components
- `StatusPill` — color-coded status indicators for deals, leads, tasks
- `EntityBadge` — compact entity reference display
- `EmptyState` — structured empty state with icon, title, description, and action
- `SectionHeader` — consistent section headers with optional actions

### Mock Data Layer
- Realistic mock data for leads, deals, inventory, approvals, events, and tasks
- Mock data shapes match canonical type definitions
- Used by dashboard and list views for demonstration

### Domain Module Structure
- 21 domains under `src/domains/` with consistent internal structure
- Each domain has: types, services (interfaces), queries, and policies
- Domains: auth, crm, deals, fi, inventory, service, parts, accounting, compliance, marketing, analytics, appointments, approvals, communications, documents, hr, integrations, notifications, reporting, settings, tasks

### Database Adapter
- Spark KV-based adapter in `src/services/`
- CRUD helper functions for standard entity operations
- Designed for future replacement with real persistence layer

### Architecture Documentation
- 14 documents in `docs/architecture/` covering:
  - Auth and access model
  - Canonical objects
  - Event taxonomy
  - Domain service pattern
  - Service layer contracts
  - Schema overview and phase migration notes
  - Audit and approval rules
  - Integration sync model
  - Permissions matrix

### Dashboard
- Live mock data display with summary metrics
- Role-aware content (different metrics by role)
- Recent activity feed from event stream

---

## Placeholder

### Navigation
- Uses local `currentPath` state instead of a real client-side router
- Page transitions are component swaps, not URL-driven routes
- No browser history support (back/forward buttons don't work as expected)

### Records Pages
- Leads, Deals, Inventory, Contacts pages show "coming soon" placeholder cards
- List views exist but are not connected to filterable/sortable data grids
- Detail views not implemented

### Operations Pages
- Appointments, Service, Approvals, Tasks pages show "coming soon" placeholder cards
- No workflow UI implemented

### Settings Pages
- Users, Roles, Integrations, System settings show "coming soon" placeholder cards
- No settings persistence

### Workstation
- Workstation concept defined in architecture but no UI present
- No role-specific workstation views

### Command Palette
- Shell component exists with keyboard shortcut trigger
- No search, no command execution, no navigation
- Visual container only

### Data Flow
- Service interfaces defined in `src/types/contracts.ts` but not wired
- No real API calls or data persistence beyond Spark KV mock layer
- Event emission is typed but events are not persisted or replayed

---

## Scaffold Remnants (Fixed)

| Item | Was | Fixed To |
|------|-----|----------|
| `package.json` name | `spark-template` | `outcome-dealer-os` |
| `README.md` | Spark Template welcome page | Outcome Dealer OS project README |
| `index.html` title | Already correct | `Outcome Dealer OS` |
| `spark.meta.json` | `{"dbType": null}` | Kept as-is (runtime config, not identity) |
