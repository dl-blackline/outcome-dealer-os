# Prompt 07 — Workstation Auto-Card Rules and Linked-Object Continuity

Finish the workstation integration by adding centralized linked-object and auto-card behavior for Outcome Dealer OS.

## Goals

- make workstation cards aware of core record types
- centralize auto-card generation logic
- prepare the OS for lead, quote, approval, deal, service, and recon execution flows

## Tasks

1. Create centralized workstation automation rules for:
   - new lead
   - appointment booked or no-show
   - approval requested
   - quote sent
   - funding exception
   - service declined work
   - recon bottleneck
2. Ensure cards are linked to canonical object identities.
3. Ensure workstation docs clearly explain:
   - source event
   - linked object
   - approval sensitivity
   - assignment and escalation expectations
4. Keep rules modular and easy to extend.

## Rules

- no scattered page-level automation
- no permission bypass through workstation
- preserve the product’s one-operating-system feel

## Deliverable

- centralized workstation rule layer
- linked-object continuity
- cards that reflect real operating work
