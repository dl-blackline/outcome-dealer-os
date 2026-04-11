# Prompt 47 — Trade-In and Appointment Request Flows

Build the customer-facing trade-in intake and appointment/test-drive request flows.

## Goals

- let shoppers submit trade-in information and request appointments or test drives
- make these conversion flows clean, premium, and low-friction
- map customer-side actions into internal OS workflow and workstation execution

## Tasks

1. Build customer-facing trade-in intake flow.
2. Build appointment / test-drive request flow.
3. Ensure these flows can create or update internal objects such as:
   - trade-in inquiry record or linked lead context
   - appointment request record
   - event entries
   - workstation cards for follow-up
4. Add or update:
   - `/docs/architecture/trade_in_customer_flow.md`
   - `/docs/architecture/appointment_request_flow.md`
   - `/docs/ux/trade_and_appointment_customer_experience.md`

## Rules

- do not create separate shadow objects disconnected from the internal OS
- keep customer steps simple and conversion-focused
- preserve trust and clarity around next steps

## Deliverable

- trade-in intake flow
- appointment/test-drive request flow
- docs for customer and internal handoff behavior
