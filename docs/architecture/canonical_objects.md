# Canonical Objects

## Purpose

Every entity in Outcome Dealer OS has one canonical representation. No duplicate customer records. No orphaned leads. No ambiguous deal state. This document defines the core object families that form the system's foundation.

## Object Families

### Customer & Household Domain

**household**
- The foundational unit representing a customer family or entity
- Contains multiple customers, vehicles, and relationships
- Lifetime value tracking, loyalty scoring, communication preferences

**customer**
- Individual person within a household
- Contact info, preferences, credit profile stub, communication history
- Links to leads, deals, service visits

**lead**
- Interest signal from a potential customer
- Source attribution, scoring, assignment, contact attempts, conversion outcome
- Lifecycle: created → validated → scored → contacted → converted or archived

### Engagement & Appointment Domain

**communication_event**
- Every inbound/outbound touch: call, SMS, email, chat message
- Linked to household, customer, lead, or deal
- Sentiment, intent classification, AI-generated summaries

**appointment**
- Scheduled interaction: sales appointment, service appointment, delivery appointment
- Confirmation status, no-show tracking, reschedule history

**showroom_visit**
- Physical check-in event when customer arrives
- Links to appointment or walk-in, triggers desking flow

### Inventory & Appraisal Domain

**vehicle_catalog_item**
- Abstract vehicle definition: year, make, model, trim, features, MSRP
- Shared across inventory units and customer trade-ins

**inventory_unit**
- Specific vehicle in stock or incoming
- VIN, cost, pricing, location, aging status, frontline readiness
- Lifecycle: acquired → recon → frontline → sold or wholesaled

**trade_appraisal**
- Customer vehicle offered as trade
- Condition, mileage, book values, manager approval, accepted value
- Linked to deal or standalone appraisal request

### Sales Structure & Finance Domain

**desk_scenario**
- Sales manager's pencil: vehicle, trade, down payment, term, rate, payment
- Multiple scenarios per deal, presented vs. accepted

**quote**
- Formalized pricing output sent to customer
- Includes desking details, F&I products, disclaimers, expiration

**quick_app**
- Soft credit pull for initial credit decisioning
- Quick turnaround, minimal fields, preliminary approval range

**credit_app**
- Full credit application submitted to lenders
- Comprehensive financials, employment, residence history
- Linked to lender decisions

**lender_decision**
- Response from finance source: approved, countered, declined, stipulations
- Rate, term, advance, backend cap, stips required

**f_and_i_menu**
- F&I product presentation: warranty, GAP, service contract, theft protection
- Customer selections, pricing, product provider, commissions

**deal**
- The central transaction object
- Links household, customer, inventory unit, trade, desk scenario, credit app, lender decision, F&I menu
- Lifecycle: structured → quoted → signed → funded → delivered

**deal_document_package**
- Signed contracts, disclosures, titling docs, delivery checklist
- Compliance tracking, archive reference

**funding_exception**
- Issues blocking funding: missing stips, incorrect disclosure, title delay
- Resolution tracking, escalation path

### Service & Retention Domain

**service_event**
- Service lane visit: repair order, recommended work, customer acceptance/decline
- Links to household, vehicle, service advisor

**declined_work_event**
- Service work customer postponed or rejected
- Opportunity for follow-up campaign or sales referral if vehicle is aging

### Reconditioning & Exit Domain

**recon_job**
- Work required to make inventory unit frontline-ready
- Estimate, actual cost, vendor, completion date, delay reasons

### Marketing & Attribution Domain

**campaign**
- Outbound marketing effort: email blast, SMS promo, direct mail, digital ad
- Target audience, message, response tracking

**attribution_touch**
- Marketing touchpoint linked to a lead or deal
- Source, medium, campaign, timestamp, attribution weight

### Workflow & Control Domain

**task**
- Action item assigned to user or role
- Due date, priority, completion status, linked entity

**approval**
- Request for manager or role-based authorization
- Type (trade value, financial output, AI action), requester, approver, resolution

**audit_log**
- Immutable record of every state change
- Who, what, when, before/after, IP, user agent

**integration_sync_state**
- Status of external system synchronization (DMS, credit bureaus, lender portals)
- Last sync, errors, retry count, recovery state

### Event Infrastructure

**event_bus**
- Central event stream capturing all system activity
- Event name, payload, timestamp, actor, trace ID
- Foundation for analytics, AI training, audit reconstruction

---

## Design Principles

- **Canonical means one** — no duplicate representations of the same entity
- **Lineage is required** — every object knows its origin and relationships
- **State is event-sourced** — current state is derived from event history where possible
- **Audit is structural** — sensitive objects (deals, approvals, financials) auto-generate audit logs
- **AI writes to records** — every AI output becomes a structured record, not a chat message

---

**These objects form the complete chain. Build them right, build them once.**
