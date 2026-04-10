# Prompt 03 — Workstation as a First-Class OS Pillar

Add the Workstation to Outcome Dealer OS as a first-class execution layer.

This is a required product pillar.

## Goals

- introduce a Trello-style workstation into the actual app navigation and route structure
- make workstation the central cross-department execution layer
- support linked cards for leads, quotes, approvals, deals, service opportunities, and recon work
- design it so auto-card creation can be centralized later

## Tasks

1. Add Workstation to sidebar and route map.
2. Create or refactor canonical workstation modules:
   - board
   - column
   - card
   - filters
   - card drawer
   - quick create
3. Make workstation cards support:
   - linkedObjectType
   - linkedObjectId
   - priority
   - queueType
   - dueAt
   - assignee
   - requiresApproval
   - sourceEventName
4. Add docs:
   - `/docs/architecture/workstation_execution_layer.md`
   - `/docs/architecture/workstation_auto_card_strategy.md`
5. If data services are not fully ready, use structured mock adapters that clearly match the future canonical shape.

## Rules

- do not leave workstation as an isolated toy board
- do not scatter auto-card rules in page code
- keep it premium and drag/drop ready
- workstation must feel native to Outcome Dealer OS

## Deliverable

- workstation route
- workstation in nav
- workstation UI and model foundation
- docs for how it ties into the rest of the OS
