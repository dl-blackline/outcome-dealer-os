# Prompt 02 — Real App Shell and Route Architecture

Convert the current Outcome Dealer OS app from a single-state mock shell into a real route-driven shell.

## Goals

- replace local currentPath navigation logic with a real route map
- keep the premium dark-first shell direction
- preserve role-awareness
- prepare the app for real record and ops pages

## Tasks

1. Build or finalize:
   - app shell
   - role shell
   - dashboard layout
   - route map
   - route guards
2. Replace href-only shell behavior and local `currentPath` state with real route-based navigation.
3. Support routes for:
   - `/app/dashboard`
   - `/app/workstation`
   - `/app/records/households/:id`
   - `/app/records/leads/:id`
   - `/app/records/deals/:id`
   - `/app/records/inventory/:id`
   - `/app/ops/events`
   - `/app/ops/approvals`
   - `/app/ops/audit`
   - `/app/settings/roles`
   - `/app/settings/integrations`
4. Keep role-aware dashboard behavior.
5. Keep current shell styling but improve consistency and fallback handling.

## Rules

- do not add giant workflow logic yet
- do not re-theme the whole app
- prefer clean routing and state boundaries over flashy changes

## Deliverable

- real route architecture
- route-aware shell
- cleaner navigation
- role-aware dashboard entry behavior
