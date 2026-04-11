# Prompt 34 — Approval, Event, and Audit Runtime Unification

Finish the runtime unification of approvals, events, and audit so these systems read from one authoritative operating loop.

## Goals

- remove hybrid approval flows that still start from mock lists or local state
- make approval queue, event explorer, and audit explorer read from runtime sources
- improve trust in governance surfaces

## Tasks

1. Refactor approval loading and mutation flows to use runtime-backed hooks/services as the source of truth.
2. Ensure event and audit explorer pages also read through the runtime query layer.
3. Reduce or remove approval and explorer dependence on direct mock arrays.
4. Make approval resolution, resulting events, and audit entries visibly consistent across UI surfaces.
5. Add or update:
   - `/docs/architecture/governance_runtime_loop.md`

## Rules

- do not leave local-only fallback resolution paths as the primary flow
- preserve current UX where reasonable
- prioritize correctness and trust

## Deliverable

- approval, event, and audit surfaces more fully runtime-backed
- stronger governance loop consistency
- docs for runtime governance behavior
