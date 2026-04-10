# Prompt 12 — Workstation Persistence and Real Actions

Move the Workstation from page-local mock state toward a real domain-backed execution layer.

## Goals

- stop keeping workstation cards only in page-local state
- introduce a real workstation service/query boundary
- support real create, update, move, and complete actions through a canonical workstation layer

## Tasks

1. Review the current workstation domain, mocks, UI components, and page behavior.
2. Introduce or refine workstation services and queries for:
   - list board cards
   - create card
   - move card
   - update card
   - complete card
3. Bind the page to the workstation domain instead of mutating local arrays directly.
4. Keep mock adapters if needed, but centralize them in the workstation domain rather than the page.
5. Add or update:
   - `/docs/architecture/workstation_runtime_model.md`

## Rules

- preserve the existing premium workstation UI direction
- keep linked-object fields intact
- do not scatter persistence logic into UI components
- do not fully overbuild collaborative realtime yet

## Deliverable

- workstation actions no longer page-local only
- clearer workstation domain layer
- docs describing runtime behavior
