# Outcome Dealer OS

A premium AI-native dealership operating system that unifies the entire dealership value chain under one intelligent command layer.

## What This Is

Outcome Dealer OS is a comprehensive dealership operating system with canonical data models, event-driven architecture, role-based access control, approval workflows, and AI co-pilot features. It handles the complete customer lifecycle from lead generation through vehicle delivery and service retention.

This is **not** a marketing site or proof-of-concept. It is an enterprise-grade application shell with real domain modeling, a full role/permission system, and structured architecture documentation.

## Current Status

**Phase 1 — Foundation** is complete. The application shell, type system, role model, event taxonomy, and domain structure are implemented. See [`docs/product/current_implementation_status.md`](docs/product/current_implementation_status.md) for a detailed audit.

### What's Working

- **Role model**: 13 roles, 28 permissions, policy engine with route guards
- **Canonical types**: 30+ business objects defined in `src/types/canonical.ts`
- **Event taxonomy**: 49 structured event types across all domains
- **Auth domain**: AuthProvider, useAuth hook, permission checks, route guards
- **Shell**: AppSidebar with role-aware navigation, Topbar with role switcher, CommandPalette shell
- **Core components**: StatusPill, EntityBadge, EmptyState, SectionHeader
- **Mock data layer**: Leads, deals, inventory, approvals, events, tasks
- **Domain structure**: 21 domains with types, services, queries, and policies
- **Dashboard**: Live mock data display with role-aware metrics

### What's Placeholder

- Navigation uses local `currentPath` state, not a real router
- Records, Operations, and Settings pages show "coming soon" cards
- Workstation UI not present
- Command palette shell exists but has no functionality
- Services defined in types/contracts but not wired to real data

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
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

```text
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

## Public Site And Supabase Setup

The repository now includes two clear surfaces:

- Public buyer-facing routes at `#/`, `#/shop`, `#/shop/:unitId`, finance, trade, schedule, and inquiry pages.
- Protected internal OS routes at `#/app/...`.

Supabase is optional for local development but fully wired for auth and SQL-backed storage when configured.

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Apply SQL migrations in `migrations/`, including `0015_supabase_public_inventory_and_auth.sql`.
4. Create a public Supabase storage bucket matching `VITE_SUPABASE_STORAGE_BUCKET` if you want staff-managed uploads.

Without Supabase env vars, the app falls back to a safe local/demo mode so the public site and protected route flow still work in development.

## Building

```bash
npm run build
```

## License

MIT
