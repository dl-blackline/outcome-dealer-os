# Prompt 04 — Records and Ops Real Surfaces

Replace placeholder Records and Operations pages with real Outcome Dealer OS surfaces.

## Goals

- make the repo feel like a real operating system, not a dashboard mock
- build real record pages and operational explorer pages
- connect them to canonical shapes or structured mock adapters

## Tasks

1. Build:
   - `HouseholdRecordPage`
   - `LeadRecordPage`
   - `DealRecordPage`
   - `InventoryUnitPage`
   - `EventExplorerPage`
   - `ApprovalQueuePage`
   - `AuditExplorerPage`
2. Each page must include:
   - loading state
   - empty state
   - error state
   - record header
   - status indicators
   - linked-record summary sections
   - audit section or placeholder
   - approval banner where relevant
3. Ops pages must look like real internal control surfaces, not placeholder blank cards.
4. Keep all pages aligned with the current premium shell language.

## Rules

- do not overbuild mutations yet
- do not duplicate mock logic inline in every page
- use reusable components and adapters

## Deliverable

- real record surfaces
- real ops explorer surfaces
- better structure for future domain wiring
