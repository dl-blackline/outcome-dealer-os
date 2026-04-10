# Phase 2 Migration Notes

## Overview

PR 2 establishes the **first layer of canonical database structure** for Outcome Dealer OS. This creates a real foundation for identity, CRM, appointments, showroom events, vehicle catalog, and inventory before building deeper service logic.

## Migration Order

The migrations **must be applied in this exact order**:

1. `0001_enable_extensions.sql`
2. `0002_create_households_and_customers.sql`
3. `0003_create_leads_and_communications.sql`
4. `0004_create_appointments_and_showroom.sql`
5. `0005_create_vehicle_catalog_and_inventory.sql`

## Why Order Matters

### Dependency Chain

```
0001 (pgcrypto extension)
  ↓
0002 (households, customers)
  ↓
0003 (leads, communication_events) — references customers, households
  ↓
0004 (appointments, showroom_visits) — references leads, customers
  ↓
0005 (vehicle_catalog_items, inventory_units) — independent domain
```

### Key Dependencies

- **0001** enables `pgcrypto` which provides `gen_random_uuid()` used in all subsequent migrations
- **0002** creates the identity foundation (`households`, `customers`) that all CRM entities depend on
- **0003** creates `leads` which reference `customers` and `households`
- **0004** creates appointment/showroom entities that reference `leads` and `customers`
- **0005** is independent but logically follows to complete the core domain foundation

### Circular Dependency Handling

**Problem**: `households.primary_customer_id` should reference `customers.id`, but `customers` needs `households` to exist first.

**Solution**: The `primary_customer_id` column is created as a **nullable UUID without the FK constraint** in migration 0002. A future migration (likely 0006 or later) will add the FK constraint after both tables are fully established and populated.

## Objects Created After PR 2

### Identity Domain
- **households**: Represents buying households or business entities
- **customers**: Individual contacts within households

### CRM Domain
- **leads**: Sales opportunities with attribution, scoring, and status tracking
- **communication_events**: Audit trail of all customer communications

### Activity Domain
- **appointments**: Scheduled customer appointments (test drives, deliveries, etc.)
- **showroom_visits**: Walk-in showroom activity tracking

### Vehicle Domain
- **vehicle_catalog_items**: Reference catalog of vehicle specs and competitive data
- **inventory_units**: Physical inventory units with costing, pricing, and recon status

## What Remains for Later Migrations

### Structural Improvements (Likely PR 3)
- Add FK constraint for `households.primary_customer_id → customers.id`
- Create indexes on frequently queried columns:
  - `customers.email`, `customers.phone`, `customers.household_id`
  - `leads.customer_id`, `leads.status`, `leads.assigned_to_user_id`
  - `inventory_units.vin`, `inventory_units.stock_number`, `inventory_units.status`
- Add `updated_at` triggers to automatically maintain timestamp columns

### Additional Domains (Future PRs)
- **Trades & Appraisals**: `trade_appraisals`, `appraisal_photos`
- **Desking & Quotes**: `desk_scenarios`, `quotes`, `desk_structure_items`
- **Finance**: `quick_apps`, `credit_apps`, `lender_decisions`, `stip_events`
- **F&I**: `f_and_i_menus`, `f_and_i_products_accepted`
- **Deals**: `deals`, `deal_document_packages`, `funding_exceptions`
- **Service**: `service_events`, `declined_work_events`
- **Recon**: `recon_jobs`, `recon_estimate_changes`
- **Marketing**: `campaigns`, `attribution_touches`
- **System**: `tasks`, `approvals`, `audit_logs`, `event_bus`, `integration_sync_states`

### Generated Types
After applying these migrations to a real PostgreSQL database, TypeScript types should be generated from the schema and placed in:
- `src/types/database.generated.ts` (or similar canonical location)

**Important**: Do not hand-edit generated database types. Regenerate them after each migration.

## Design Principles

### Naming Conventions
- **snake_case** for all column names
- **Descriptive, unambiguous names** (e.g., `assigned_to_user_id` not just `user_id`)
- **Consistent suffixes**: `_at` for timestamps, `_id` for UUIDs

### Data Types
- **UUID** for all primary keys using `gen_random_uuid()`
- **timestamptz** for all timestamps to preserve timezone information
- **numeric(12,2)** for monetary values (12 digits total, 2 decimal places)
- **jsonb** for semi-structured data (package specs, competitive sets, etc.)

### Defaults
- `created_at` always defaults to `now()`
- `updated_at` always defaults to `now()` (triggers will be added later)
- Status columns have sensible defaults (e.g., `status default 'new'`)
- Boolean flags default to `false` for opt-in scenarios

### Deletion Behavior
- **cascade** for strong parent-child relationships (e.g., lead → communication_events)
- **set null** for optional associations (e.g., household_id on customers)

## Verification Checklist

After applying migrations, verify:

- [ ] All tables exist with correct column names and types
- [ ] Primary keys are UUID with `gen_random_uuid()` default
- [ ] Foreign keys enforce correct relationships
- [ ] Default values are set correctly
- [ ] Timestamps use `timestamptz` not `timestamp`
- [ ] No typos in column names (double-check against canonical object docs)

## Next Steps (PR 3)

1. **Add indexes** for query performance on high-traffic columns
2. **Add updated_at triggers** to automatically maintain timestamp columns
3. **Add households.primary_customer_id FK constraint** after validating circular dependency resolution
4. **Generate TypeScript types** from the database schema
5. **Create migration for trades and appraisals** (next domain layer)

## Notes

- These migrations are **deterministic** and safe to run multiple times (using `create table` not `create table if not exists`)
- No data manipulation or seeds are included in PR 2 (schema-only)
- No experimental or undocumented columns have been added
- All column names match the canonical object definitions from Phase 1 docs
