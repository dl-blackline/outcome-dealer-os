# Prompt 14 — Approval Actions, Audit, and Event Persistence

Move approvals from local demo actions to real governed state transitions.

## Goals

- ensure approval approve/deny actions use real service logic
- tie approval state changes to audit and event continuity
- make approval surfaces reflect the trust model described in the product docs

## Tasks

1. Review the current Approval Queue page, approval domain, and event/audit helpers.
2. Refactor approval actions so approve and deny do not only mutate page-local state.
3. Ensure approval changes can:
   - update approval state
   - emit relevant events
   - write audit entries
4. Surface approval history or state summaries where appropriate on records and workstation cards.
5. Add or update:
   - `/docs/architecture/approval_runtime_flow.md`

## Rules

- do not keep approval resolution as a page-only illusion
- preserve the current UI where possible
- maintain human-in-the-loop clarity

## Deliverable

- real approval action flow
- approval state tied to audit and events
- docs for approval runtime behavior
