# Complete Schema Overview (After PR 3)

## Schema Visualization

This document provides a high-level overview of the complete canonical schema after PR 3.

## Core Domain Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                     IDENTITY & CRM FOUNDATION                        │
└─────────────────────────────────────────────────────────────────────┘

    households ←──────┐
         ↓            │
    customers ────────┘ (circular FK - resolved in 0011)
         ↓
      leads ──────────→ communication_events
         ↓
    appointments
         ↓
  showroom_visits

┌─────────────────────────────────────────────────────────────────────┐
│                     VEHICLE & INVENTORY DOMAIN                       │
└─────────────────────────────────────────────────────────────────────┘

  vehicle_catalog_items
         ↓
  inventory_units ──────→ recon_jobs
         ↓
   (referenced by
    trade_appraisals,
    desk_scenarios,
    deals)

┌─────────────────────────────────────────────────────────────────────┐
│                       SALES STRUCTURE DOMAIN                         │
└─────────────────────────────────────────────────────────────────────┘

      leads
         ↓
  trade_appraisals ──────┐
         ↓               │
  desk_scenarios ←───────┘
         ↓
      quotes

┌─────────────────────────────────────────────────────────────────────┐
│                      FINANCE FOUNDATION DOMAIN                       │
└─────────────────────────────────────────────────────────────────────┘

      leads
         ↓
   quick_apps
         ↓
   credit_apps
         ↓
lender_decisions ──────→ funding_exceptions
         ↓
    fi_menus ←──────┐
         ↓          │
      deals ────────┘ (circular FK - resolved in 0011)

┌─────────────────────────────────────────────────────────────────────┐
│                      DEAL MANAGEMENT DOMAIN                          │
└─────────────────────────────────────────────────────────────────────┘

      deals
         ├──→ deal_document_packages
         └──→ funding_exceptions

┌─────────────────────────────────────────────────────────────────────┐
│                      FIXED OPS FOUNDATION DOMAIN                     │
└─────────────────────────────────────────────────────────────────────┘

   customers/households
         ↓
  service_events ──────→ declined_work_events

┌─────────────────────────────────────────────────────────────────────┐
│                    MARKETING & ATTRIBUTION DOMAIN                    │
└─────────────────────────────────────────────────────────────────────┘

    campaigns
         ↓
attribution_touches ──────→ leads/customers

┌─────────────────────────────────────────────────────────────────────┐
│                   WORKFLOW & ORCHESTRATION DOMAIN                    │
└─────────────────────────────────────────────────────────────────────┘

  tasks ──────────────→ (any object via polymorphic reference)
  approvals ──────────→ (any object via polymorphic reference)
  audit_logs ─────────→ (any object via polymorphic reference)
  integration_sync_states → (any object via polymorphic reference)
  event_bus ──────────→ (any object via polymorphic reference)
```

## Table Inventory by Domain

### Identity & CRM (4 tables)
1. **households** - Buying households or business entities
2. **customers** - Individual contacts within households
3. **leads** - Sales opportunities with attribution and scoring
4. **communication_events** - Audit trail of all customer communications

### Activity & Engagement (2 tables)
5. **appointments** - Scheduled customer appointments
6. **showroom_visits** - Walk-in showroom activity tracking

### Vehicle & Inventory (2 tables)
7. **vehicle_catalog_items** - Reference catalog of vehicle specs
8. **inventory_units** - Physical inventory units with costing and pricing

### Sales Structure (3 tables)
9. **trade_appraisals** - Customer vehicle trade-in appraisals
10. **desk_scenarios** - Sales manager desking pencils
11. **quotes** - Formalized pricing output sent to customers

### Finance Foundation (4 tables)
12. **quick_apps** - Quick credit applications for soft pull
13. **credit_apps** - Full credit applications submitted to lenders
14. **lender_decisions** - Lender responses with approval terms
15. **fi_menus** - F&I product presentations

### Deal Management (3 tables)
16. **deals** - Central transaction object linking all deal components
17. **deal_document_packages** - Contract and compliance document tracking
18. **funding_exceptions** - Issues blocking deal funding

### Fixed Ops Foundation (3 tables)
19. **service_events** - Service lane visits with repair orders
20. **declined_work_events** - Service work postponed or rejected
21. **recon_jobs** - Reconditioning work tracking

### Marketing & Attribution (2 tables)
22. **campaigns** - Marketing campaigns with spend and timeline
23. **attribution_touches** - Marketing touchpoints linked to leads

### Workflow & Orchestration (6 tables)
24. **tasks** - Action items assigned to users or roles
25. **approvals** - Authorization requests with approval workflow
26. **audit_logs** - Immutable change tracking for compliance
27. **integration_sync_states** - External system sync status
28. **event_bus** - Central event stream for analytics and workflows

**Total: 27 tables**

## Key Foreign Key Relationships

### Strong Cascading Relationships
- `customers` → `leads` (cascade)
- `leads` → `communication_events` (cascade)
- `leads` → `appointments` (cascade)
- `leads` → `trade_appraisals` (cascade)
- `leads` → `desk_scenarios` (cascade)
- `leads` → `quotes` (cascade)
- `leads` → `quick_apps` (cascade)
- `leads` → `credit_apps` (cascade)
- `credit_apps` → `lender_decisions` (cascade)
- `deals` → `deal_document_packages` (cascade)
- `deals` → `funding_exceptions` (cascade)
- `service_events` → `declined_work_events` (cascade)
- `inventory_units` → `recon_jobs` (cascade)

### Optional Associations (Set Null)
- `households` → `customers` (set null on household_id)
- `inventory_units` → `trade_appraisals` (set null)
- `desk_scenarios` → `trade_appraisals` (set null)
- `quotes` → `desk_scenarios` (set null)
- `credit_apps` → `quick_apps` (set null)
- `fi_menus` → `lender_decisions` (set null)
- `deals` → `trade_appraisals` (set null)
- `deals` → `desk_scenarios` (set null)
- `deals` → `credit_apps` (set null)
- `deals` → `lender_decisions` (set null)

### Circular Dependencies (Deferred to Migration 0011)
- `households.primary_customer_id` ↔ `customers.id`
- `deals.fi_menu_id` ↔ `fi_menus.deal_id`

## Polymorphic Reference Pattern

Several tables use polymorphic references to link to any object type:

- **tasks**: `linked_object_type` + `linked_object_id`
- **approvals**: `object_type` + `object_id`
- **audit_logs**: `object_type` + `object_id`
- **integration_sync_states**: `object_type` + `object_id`
- **event_bus**: `object_type` + `object_id`

Example usage:
```sql
-- Task linked to a deal
INSERT INTO tasks (linked_object_type, linked_object_id, ...)
VALUES ('deal', '123e4567-e89b-12d3-a456-426614174000', ...);

-- Approval for a trade appraisal
INSERT INTO approvals (object_type, object_id, approval_type, ...)
VALUES ('trade_appraisal', '123e4567-e89b-12d3-a456-426614174001', 'manager_approval', ...);

-- Audit log for a lender decision
INSERT INTO audit_logs (object_type, object_id, action, ...)
VALUES ('lender_decision', '123e4567-e89b-12d3-a456-426614174002', 'status_changed', ...);
```

## Data Type Standards

### Primary Keys
- All primary keys: `uuid primary key default gen_random_uuid()`

### Timestamps
- All timestamps: `timestamptz not null default now()`
- Created timestamps: `created_at timestamptz not null default now()`
- Updated timestamps: `updated_at timestamptz not null default now()`

### Monetary Values
- Standard money: `numeric(12,2)` (up to $9,999,999,999.99)
- Examples: sale_price, down_payment, taxes, fees, front_gross_actual

### Percentages & Rates
- APR: `numeric(6,3)` (up to 999.999%)
- Scores: `numeric(5,2)` (up to 999.99)
- Attribution weights: `numeric(8,4)` (up to 9999.9999)

### Counts & Quantities
- Standard counts: `integer`
- Examples: mileage, term_months, funding_exception_count, attempts

### Semi-Structured Data
- All JSONB: `jsonb not null default '{}'::jsonb` or `'[]'::jsonb`
- Examples: incentive_snapshot, approval_terms_json, missing_items_json

## Index Strategy (Migration 0012)

Indexes will be added in PR 4 for:

### High-Volume Lookups
- `customers.email`, `customers.phone`
- `inventory_units.vin`, `inventory_units.stock_number`
- `service_events.vehicle_vin`

### Status Filtering
- `leads.status`, `leads.assigned_to_user_id`
- `deals.status`, `deals.funded_status`
- `tasks.status`, `tasks.assigned_to_user_id`

### Time-Based Queries
- `audit_logs.created_at`
- `event_bus.created_at`, `event_bus.status`
- `attribution_touches.touch_timestamp`

### Polymorphic Lookups
- Composite indexes on `(object_type, object_id)` for tasks, approvals, audit_logs, sync_states

## Trigger Strategy (Migration 0013)

Automatic `updated_at` triggers will be added for all tables with `updated_at` columns.

Pattern:
```sql
CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Seed Data Strategy (Migration 0014)

Demo seed data will include:
- 2-3 sample households with customers
- 4-5 sample leads in various stages
- 3-4 sample inventory units
- 2-3 sample appointments and showroom visits
- Sample desk scenarios and quotes
- Sample deals in various stages
- Sample service events
- Sample tasks and approvals

---

**This schema provides complete enterprise-grade coverage for dealership operations. Ready for optimization in PR 4.**
