# Prompt 05 — Canonical Frontend Data Layer

Create the frontend canonical data layer for Outcome Dealer OS so the app stops behaving like a shell-only mock.

## Goals

- introduce clean domain-facing query and service boundaries on the frontend
- map records, approvals, events, workstation cards, leads, deals, and inventory into consistent shapes
- prepare the UI to swap from mock data to real data without page rewrites

## Tasks

1. Add or refine domain, query, and service layers for:
   - households
   - leads
   - deals
   - inventory
   - approvals
   - audit
   - events
   - workstation
2. Build reusable adapters and mappers between current mock/demo data and future real canonical sources.
3. Remove direct mock-data dependence from `App.tsx` and page bodies where possible.
4. Centralize demo data in one place if real APIs are not implemented yet.
5. Update docs:
   - `/docs/architecture/frontend_data_layer.md`
   - `/docs/architecture/mock_to_real_transition.md`

## Rules

- do not overengineer
- keep types clean
- do not invent duplicate business objects

## Deliverable

- cleaner frontend architecture
- reduced shell-only coupling
- easier path to real data wiring
