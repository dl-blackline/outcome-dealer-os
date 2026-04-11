# Prompt 46 — Quick App and Customer Inquiry Capture

Build the customer-facing inquiry and quick-app capture layer.

## Goals

- let shoppers inquire on units cleanly
- let shoppers start quick app / finance entry from the buyer hub
- map these customer-side actions into internal leads, approvals, events, and workstation execution

## Tasks

1. Build customer-facing inquiry forms and quick app entry surfaces.
2. Support at minimum:
   - unit inquiry submission
   - general contact/inquiry
   - quick app start / submission entry
3. Define and implement how these create or update internal OS objects such as:
   - lead / inquiry record
   - household/customer record when identified
   - event entries
   - workstation cards where appropriate
4. Add or update:
   - `/docs/architecture/customer_inquiry_to_internal_flow.md`
   - `/docs/architecture/quick_app_capture_flow.md`

## Rules

- do not build a disconnected form stack
- do not overpromise full lender automation in the first buyer-hub release
- prioritize conversion and trust

## Deliverable

- inquiry capture flow
- quick app entry flow
- docs for customer-to-internal handoff
