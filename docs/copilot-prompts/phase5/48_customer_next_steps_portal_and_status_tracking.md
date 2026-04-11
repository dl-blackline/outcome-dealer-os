# Prompt 48 — Customer Next-Steps Portal and Status Tracking

Build the customer-facing next-steps portal so buyers can see what to do next after inquiry, application, or appointment request.

## Goals

- reduce uncertainty after a shopper engages
- create a premium customer-facing progress/status surface
- keep the portal tied to the same internal state progression used by staff

## Tasks

1. Build a customer-facing next-steps/progress page.
2. Show customer-relevant states such as:
   - inquiry received
   - awaiting contact
   - appointment requested / confirmed
   - quick app started / submitted
   - trade info received
   - next recommended action
3. Define the mapping from internal state to customer-safe state labels.
4. Add or update:
   - `/docs/architecture/customer_status_projection_model.md`
   - `/docs/ux/customer_next_steps_portal.md`

## Rules

- do not expose sensitive internal-only operational details
- keep the customer language calm, clear, and confidence-building
- use the portal to drive conversion and completion, not just status display

## Deliverable

- customer next-steps portal
- customer-safe status model
- docs for state projection and UX
