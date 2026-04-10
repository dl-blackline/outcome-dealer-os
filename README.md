# Outcome Dealer OS

A premium AI-native dealership operating system that unifies the entire dealership value chain under one intelligent command layer.

## What This Is

Outcome Dealer OS is a comprehensive dealership operating system with canonical data models, event-driven architecture, role-based access control, approval workflows, and AI co-pilot features. It handles the complete customer lifecycle from lead generation through vehicle delivery and service retention.

This is **not** a marketing site or proof-of-concept. It is an enterprise-grade application shell with real domain modeling, a full role/permission system, and structured architecture documentation.

## Current Status

**Phase 2 — Integration** is complete. All systems are connected and functional with mock data backing. See [`docs/product/current_implementation_status.md`](docs/product/current_implementation_status.md) for details.

### What's Working

- **Auth**: AuthProvider as single source of truth, dev role switcher updates context
- **Route guards**: Permission-based access enforcement with AccessDenied UI
- **Role model**: 13 roles, 28 permissions, policy engine — actively enforced
- **Workstation**: KV-persisted cards via service layer, auto-seeded from mock
- **Event bus**: `emitEvent()` persists events, triggers auto-card generation, notifies listeners
- **Auto-card rules**: 9 event-to-card mappings executed at runtime via event bus
- **Approval actions**: Approve/deny call real services, emit events, write audit logs
- **Command palette**: Full search across pages and records with keyboard navigation (⌘K)
- **Notifications**: Event-driven notification center with severity levels
- **Dashboard**: Role-aware metrics via centralized adapters
- **Record pages**: Proper not-found handling with RecordNotFound component
- **Settings**: Auth-aware roles page, interactive integration sync actions

### What's Mock-Driven

- Record data (leads, deals, inventory, households) from static mock arrays
- Dashboard metrics derived from mock data (role-aware derivation is real)
- Notifications seeded from mock events
- Integration sync buttons are visual-only

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Components | Radix UI primitives, Shadcn-style composition |
| Icons | Lucide React |
| State | React context + hooks (event-sourced design) |
| Data | Spark KV adapter with CRUD helpers (mock layer) |

## Architecture

The system follows a **domain-driven, event-sourced, role-aware** architecture:

- **Domains** (`src/domains/`): Each business domain (CRM, inventory, deals, F&I, service, etc.) has its own types, services, queries, and policy files.
- **Canonical Objects** (`src/types/canonical.ts`): Single source of truth for all entity shapes — households, leads, deals, vehicles, appointments, etc.
- **Event System** (`src/types/events.ts`): Every meaningful state change produces an immutable event with structured payload.
- **Role & Permission Engine** (`src/domains/auth/`): Policy-based access control with 13 dealership roles and 28 granular permissions.
- **Shell** (`src/app/`): Premium dark-first shell with sidebar, topbar, command palette, and notification center — all role-aware.

See the [`docs/architecture/`](docs/architecture/) directory for detailed documentation on auth, events, services, schemas, and integration patterns.

## Project Structure

```
src/
├── app/            # Shell layout (sidebar, topbar, command palette)
├── components/     # Shared UI components
├── domains/        # Business domains (auth, crm, inventory, deals, ...)
├── hooks/          # Shared React hooks
├── lib/            # Utilities
├── services/       # Data adapters
├── styles/         # Global styles
└── types/          # Canonical types, events, contracts
docs/
├── architecture/   # Technical architecture docs (14 files)
├── product/        # Product identity and status
└── copilot-prompts/# Build prompts
```

## Running Locally

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:5000`.

## Building

```bash
npm run build
```

## License

MIT
