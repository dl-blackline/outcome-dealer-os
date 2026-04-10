# Prompt 23 — Approval Queue Real Resolution Flow

Finish the approval queue so approval resolution is no longer a mixed local-state and service-call experience.

## Goals

- make approvals load from a real runtime source
- make approve and deny actions authoritative
- ensure approval UI reflects persisted state, not only optimistic local UI

## Tasks

1. Review the current Approval Queue page and approval service.
2. Refactor approval loading to come from the approval domain or runtime query layer.
3. Ensure approval actions:
   - update persisted approval state
   - update UI from runtime source of truth
   - emit approval events
   - write audit entries
4. Remove or minimize fallback patterns that make approval resolution succeed only visually.
5. Add or update:
   - `/docs/architecture/approval_queue_runtime_contract.md`

## Rules

- keep the current premium UI direction
- do not leave approval resolution as a local illusion
- preserve human-in-the-loop clarity

## Deliverable

- real approval queue flow
- runtime-backed approval resolution
- docs for approval queue contract
