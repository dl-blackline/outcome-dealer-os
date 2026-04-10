# Current Implementation Status

Honest audit of what is implemented, what is placeholder, and what scaffold remnants exist.

Last updated: Phase 3, Prompt 20.

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

### Navigation (Updated Phase 2)
- Custom hash-based router implemented (`src/app/router/`)
- 15 routes defined with route-to-component mapping in AppShell
- URL-driven navigation works (`#/app/...` format)

### Records Pages (Updated Phase 2)
- Lead, Deal, Inventory, Household list and detail pages all implemented
- All pages read directly from MOCK_* arrays — no runtime connection
- Detail pages show linked records, activity timelines

### Operations Pages (Updated Phase 2)
- Event Explorer, Approval Queue, Audit Explorer all implemented
- All read from MOCK_* arrays or inline mock data
- Approval actions update local state only — deceptive runtime appearance

### Settings Pages (Updated Phase 2)
- Roles page shows all 13 roles with expandable permission lists (read-only, from code)
- Integrations page shows mock integration status cards

### Workstation (Updated Phase 2)
- Full kanban board with 5 columns (Inbox, Today, In Progress, Waiting, Done)
- HTML5 drag-and-drop between columns
- Card creation, filtering by queue/priority, card detail drawer
- **Gap**: Page uses local `useState` with mock seed data, does not call workstation.service.ts

### Command Palette (Updated Phase 2)
- Search across navigation items and records (leads, deals, inventory)
- Keyboard navigation (↑↓ Enter Esc)
- **Gap**: Reads MOCK_* arrays directly; no contextual actions

### Data Flow (Updated Phase 2)
- Runtime services exist for: workstation, approvals, events, audit, integrations
- All use KV-backed `db` layer (`lib/db/supabase.ts`) with real CRUD
- **Critical gap**: UI pages do NOT use these services; they read mock arrays directly
- Domain query hooks (`useDomainQueries.ts`) exist but also just wrap mock arrays
- `dashboard.adapters.ts` provides role-aware metrics but DashboardPage doesn't use it

### Notification Center (Updated Phase 2)
- Shows notifications derived from MOCK_EVENTS at mount time
- Mark-all-read functionality (local state only)
- **Gap**: No connection to runtime event bus; notifications are static after mount

---

## Phase 3 Hybrid State Summary

See also: `docs/architecture/hybrid_state_inventory.md` and `docs/architecture/mock_vs_runtime_matrix.md`

The primary gap is a **disconnected UI↔Service layer**:
- Runtime services (workstation, approvals, events, audit) are real and use KV persistence
- UI pages bypass these services entirely and read static mock arrays
- This creates a deceptive experience where the app appears runtime-backed but isn't

Phase 3 goals: bridge this gap by routing pages through domain adapters/services.
