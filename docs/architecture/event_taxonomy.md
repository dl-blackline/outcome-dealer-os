# Event Taxonomy

## Purpose

Outcome Dealer OS is event-driven. Every meaningful state change, user action, and system decision emits an event to the central event stream. This taxonomy defines the canonical event types that flow through the system.

Events power:
- Audit trails
- AI training datasets
- Analytics and reporting
- Workflow triggers
- Integration syncing
- State reconstruction

## Event Categories

### Lead & CRM Events

**lead_created**
- A new lead enters the system (web form, phone call, chat, walk-in)

**lead_validated**
- Lead data quality confirmed (real email, valid phone, not duplicate)

**lead_scored**
- AI or rules engine assigns priority score

**lead_contacted**
- First outreach attempt logged (call, SMS, email)

**appointment_booked**
- Customer schedules a visit (sales or service)

**appointment_rescheduled**
- Appointment time changed by customer or staff

**appointment_no_show**
- Customer failed to appear for scheduled appointment

**showroom_visit_checked_in**
- Customer physically arrives at dealership

---

### Appraisal & Sales Structure Events

**trade_submitted**
- Customer provides trade-in vehicle details

**appraisal_started**
- Trade evaluation begins (inspection, valuation)

**appraisal_completed**
- Initial appraisal value determined

**appraisal_manager_approved**
- Manager signs off on trade value (if required by policy)

**desk_scenario_created**
- Sales manager builds a pencil (payment structure)

**desk_scenario_presented**
- Scenario shown to customer

**quote_sent**
- Formal pricing delivered to customer (email, SMS, printed)

**quote_explained**
- F&I or sales rep walks customer through quote details

**quote_accepted**
- Customer agrees to quote terms

---

### Finance & Funding Events

**quick_app_started**
- Soft credit pull initiated

**quick_app_completed**
- Soft pull results received

**credit_app_submitted**
- Full credit application sent to lender(s)

**lender_decision_received**
- Lender responds with approval, counter, or decline

**lender_declined**
- Specific lender rejects application

**stip_missing**
- Required documentation not provided by customer

**funding_missing_item**
- Funding held up by missing contract, incorrect disclosure, etc.

**fi_menu_presented**
- F&I products offered to customer

**fi_products_accepted**
- Customer selects F&I products (warranty, GAP, etc.)

**deal_signed**
- All contracts executed by customer

**deal_funded**
- Lender confirms funding, deal financially complete

---

### Delivery & Retention Events

**vehicle_delivered**
- Customer takes possession of vehicle

**review_requested**
- Customer asked to provide feedback (Google, dealer survey, etc.)

**referral_requested**
- Customer asked for referral to friends/family

---

### Service & Recon Events

**service_appointment_booked**
- Service lane appointment scheduled

**service_visit_completed**
- Service work finished, customer checked out

**service_customer_declined_work**
- Recommended service rejected by customer (follow-up opportunity)

**service_to_sales_opportunity_created**
- Service advisor flags customer as potential buyer (aging vehicle, high mileage)

**recon_job_created**
- Work order opened for inventory unit

**recon_estimate_changed**
- Recon cost or timeline revised

**unit_frontline_ready**
- Inventory unit cleared for sale

**unit_hit_aging_threshold**
- Inventory unit crosses aging threshold (30/60/90 days)

**wholesale_recommended**
- Inventory unit flagged for wholesale exit

---

### Marketing & Growth Events

**campaign_touch_recorded**
- Customer interacted with marketing campaign (open, click, reply)

---

### System & Control Events

**ai_output_persisted**
- AI-generated content (lead score, message draft, lender recommendation) saved to record

**approval_requested**
- Action requiring manager approval submitted to queue

**approval_granted**
- Approval request authorized

**approval_denied**
- Approval request rejected

**integration_sync_failed**
- External system sync error (DMS, credit bureau, lender portal)

**integration_sync_recovered**
- Previously failed sync succeeded on retry

---

## Event Design Principles

1. **Events are immutable** — once written, never modified
2. **Events are facts** — they describe what happened, not what should happen
3. **Events carry context** — actor, timestamp, trace ID, related entity IDs
4. **Events enable reconstruction** — current state derivable from event history
5. **Events feed AI** — training data for scoring, routing, prediction models
6. **Events power compliance** — audit trails for regulatory review

---

## Event Schema Structure

Every event includes:
- **event_name**: Canonical name from this taxonomy
- **event_id**: Unique identifier
- **timestamp**: ISO 8601 UTC
- **actor_type**: 'user' | 'agent' | 'system'
- **actor_id**: User ID, agent ID, or system identifier
- **entity_type**: Object family (lead, deal, inventory_unit, etc.)
- **entity_id**: Specific record ID
- **payload**: Event-specific data (structured JSON)
- **trace_id**: Request correlation ID for distributed tracing

---

**The event stream is the memory of the system. Design events carefully.**
