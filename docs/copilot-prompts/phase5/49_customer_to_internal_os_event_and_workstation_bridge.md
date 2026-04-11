# Prompt 49 — Customer-to-Internal OS Event and Workstation Bridge

Finish the bridge between buyer-hub actions and the internal Outcome Dealer OS.

## Goals

- ensure customer-side actions create or update internal records reliably
- connect customer-facing conversion events into workstation execution and operating signals
- preserve one operating picture across buyer hub and internal OS

## Tasks

1. Review all customer-facing flows added in phase 5.
2. Ensure customer events create or update internal objects such as:
   - lead / inquiry
   - household/customer
   - appointment request
   - quick app / finance entry
   - trade intake
   - workstation cards
   - event entries
3. Define or implement the customer-side to internal-side event bridge for:
   - unit inquiry submitted
   - quick app started/submitted
   - appointment requested
   - trade-in submitted
   - favorite saved
   - payment scenario viewed where relevant
4. Add or update:
   - `/docs/architecture/customer_event_bridge.md`
   - `/docs/architecture/customer_to_workstation_rules.md`

## Rules

- do not create disconnected customer-only records that bypass internal objects
- keep automation rules centralized
- preserve workstation as the internal execution sink

## Deliverable

- customer-to-internal event bridge
- workstation and record update mapping
- docs for customer/internal operating continuity
