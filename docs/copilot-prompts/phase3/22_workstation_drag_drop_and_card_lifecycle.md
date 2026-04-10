# Prompt 22 — Workstation Drag/Drop and Card Lifecycle

Complete the Workstation so it behaves like a real execution layer rather than a partially interactive demo board.

## Goals

- add proper drag-and-drop behavior
- formalize card lifecycle transitions
- strengthen card editing, movement, completion, and linked-object visibility

## Tasks

1. Review the current workstation board and card components.
2. Implement true drag-and-drop movement between columns with runtime updates.
3. Formalize card lifecycle actions for:
   - create
   - move
   - update
   - complete
   - reopen if appropriate
4. Improve card metadata visibility for:
   - linked object
   - queue type
   - due date
   - assignee
   - requires approval
   - source event
5. Add or update:
   - `/docs/architecture/workstation_card_lifecycle.md`
   - `/docs/ux/workstation_interaction_model.md`

## Rules

- keep the workstation premium and fast
- do not scatter lifecycle logic into unrelated components
- preserve the workstation as a first-class OS pillar

## Deliverable

- drag-and-drop workstation
- clearer card lifecycle model
- stronger card runtime behavior
