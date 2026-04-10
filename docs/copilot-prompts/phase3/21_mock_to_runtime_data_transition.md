# Prompt 21 — Mock-to-Runtime Data Transition

Move Outcome Dealer OS away from direct page-level mock imports and toward runtime-backed domain adapters across surfaced entities.

## Goals

- stop pages from directly depending on `MOCK_*` arrays where possible
- centralize seeding and runtime fallback behavior
- make it easy to replace seeded demo data with real persistence later

## Tasks

1. Audit all page and component imports of mock data.
2. Refactor pages to consume domain queries, adapters, or services instead of direct mock arrays.
3. Keep seeded/demo data where needed, but move it behind domain-level runtime access.
4. Prioritize these surfaces:
   - dashboard
   - record list pages
   - record detail pages
   - workstation
   - approvals
   - events / audit / notifications
5. Add or update:
   - `/docs/architecture/runtime_seed_strategy.md`
   - `/docs/architecture/mock_elimination_plan.md`

## Rules

- do not remove all demo data if the app still needs seeded content to function
- do not leave pages coupled directly to raw mock files
- prefer domain adapters over page-local transforms

## Deliverable

- reduced direct mock usage
- stronger runtime adapter boundaries
- docs for seed/runtime transition strategy
