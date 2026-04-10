# Prompt 13 — Event Bus and Auto-Card Execution

Turn workstation auto-card rules from static definitions into executed behavior tied to the event layer.

## Goals

- connect the event taxonomy to workstation automation
- centralize auto-card generation from meaningful events
- keep event-driven continuity visible and real in the codebase

## Tasks

1. Review the current event constants, event shapes, explorer pages, and workstation auto-card rules.
2. Introduce a clear execution path so events can generate or update workstation cards.
3. At minimum support runtime handling for:
   - lead_created
   - appointment_booked
   - appointment_no_show
   - approval_requested
   - quote_sent
   - funding_missing_item
   - service_customer_declined_work
   - recon_estimate_changed
   - unit_hit_aging_threshold
4. Ensure generated cards preserve:
   - linkedObjectType
   - linkedObjectId
   - sourceEventName
   - queueType
   - priority
5. Add or update:
   - `/docs/architecture/event_to_workstation_flow.md`

## Rules

- keep auto-card logic centralized
- do not put automation rules in page bodies
- do not create duplicate event naming systems

## Deliverable

- event-to-workstation execution path
- centralized auto-card runtime behavior
- docs for the event-to-card flow
