# Phase 3 Migration Notes

## Overview

PR 3 establishes the **second layer of canonical database structure** for Outcome Dealer OS. This extends the foundation from PR 2 into sales structure, finance operations, fixed ops, and orchestration infrastructure, creating a complete enterprise-grade schema for dealership operations.

## Migration Order

The migrations **must be applied in this exact order**:

1. `0001_enable_extensions.sql` *(from PR 1)*
2. `0002_create_households_and_customers.sql` *(from PR 2)*
3. `0003_create_leads_and_communications.sql` *(from PR 2)*
4. `0004_create_appointments_and_showroom.sql` *(from PR 2)*
5. `0005_create_vehicle_catalog_and_inventory.sql` *(from PR 2)*
6. **`0006_create_trade_appraisals_and_desk_scenarios.sql`** *(PR 3 - NEW)*
7. **`0007_create_quotes_and_finance_apps.sql`** *(PR 3 - NEW)*
8. **`0008_create_lender_decisions_fi_and_deals.sql`** *(PR 3 - NEW)*
9. **`0009_create_documents_funding_service_recon.sql`** *(PR 3 - NEW)*
10. **`0010_create_marketing_tasks_approvals_audit_sync_eventbus.sql`** *(PR 3 - NEW)*

## Why Order Matters

### Dependency Chain

```
0001 (pgcrypto extension)
  ↓
0002 (households, customers)
  ↓
0003 (leads, communication_events)
  ↓
0004 (appointments, showroom_visits)
  ↓
0005 (vehicle_catalog_items, inventory_units)
  ↓
0006 (trade_appraisals, desk_scenarios) — references leads, customers, inventory_units
  ↓
0007 (quotes, quick_apps, credit_apps) — references leads, customers, desk_scenarios
  ↓
0008 (lender_decisions, fi_menus, deals) — references credit_apps, and all deal components
  ↓
0009 (deal_documents, funding_exceptions, service_events, declined_work, recon_jobs) — references deals, service domain
  ↓
0010 (campaigns, attribution_touches, tasks, approvals, audit_logs, sync_states, event_bus) — references leads, customers for orchestration
```

### Key Dependencies

#### Migration 0006
- **trade_appraisals** references `leads`, `customers`, `inventory_units`
- **desk_scenarios** references `leads`, `customers`, `inventory_units`, `trade_appraisals`

#### Migration 0007
- **quotes** references `leads`, `customers`, `desk_scenarios`
- **quick_apps** references `leads`, `customers`
- **credit_apps** references `leads`, `customers`, `quick_apps`

#### Migration 0008
- **lender_decisions** references `credit_apps`
- **fi_menus** references `lender_decisions` (and will reference `deals` in migration 0011)
- **deals** references `leads`, `customers`, `inventory_units`, `trade_appraisals`, `desk_scenarios`, `credit_apps`, `lender_decisions` (and will reference `fi_menus` in migration 0011)

#### Migration 0009
- **deal_document_packages** references `deals`
- **funding_exceptions** references `deals`, `lender_decisions`
- **service_events** references `customers`, `households`
- **declined_work_events** references `service_events`, `customers`
- **recon_jobs** references `inventory_units`

#### Migration 0010
- **campaigns** (independent)
- **attribution_touches** references `campaigns`, `leads`, `customers`
- **tasks** (polymorphic references via object_type + object_id)
- **approvals** (polymorphic references via object_type + object_id)
- **audit_logs** (polymorphic references via object_type + object_id)
- **integration_sync_states** (polymorphic references via object_type + object_id)
- **event_bus** (polymorphic references via object_type + object_id)

### Circular Dependency Handling

**Problem**: `deals.fi_menu_id` should reference `fi_menus.id`, and `fi_menus.deal_id` should reference `deals.id`. Both tables need to exist before FK constraints can be added.

**Solution**: In migration 0008, both columns are created as **nullable UUIDs without FK constraints**. Migration 0011 (scheduled for PR 4) will add both FK constraints after both tables are fully established.

**Additional Note**: The same pattern was used in PR 2 for `households.primary_customer_id → customers.id`, which will also be finalized in migration 0011.

## Objects Created After PR 3

### Sales & Appraisal Domain
- **trade_appraisals**: Customer vehicle trade-in appraisal with valuation and manager approval
- **desk_scenarios**: Sales manager desking pencil with payment structure and front gross estimates

### Quote & Application Domain
- **quotes**: Formalized pricing output sent to customers
- **quick_apps**: Quick credit applications for soft pull / initial decisioning
- **credit_apps**: Full credit applications submitted to lenders

### Finance & Deal Domain
- **lender_decisions**: Lender responses with approval terms and stipulations
- **fi_menus**: F&I product presentations with customer selections
- **deals**: Central transaction object linking all deal components

### Documentation & Funding Domain
- **deal_document_packages**: Contract and compliance document tracking
- **funding_exceptions**: Issues blocking deal funding with resolution tracking

### Service & Retention Domain
- **service_events**: Service lane visits with repair orders and retention tracking
- **declined_work_events**: Service work postponed or rejected, opportunity for follow-up

### Reconditioning Domain
- **recon_jobs**: Reconditioning work tracking with cost, vendor, and bottleneck management

### Marketing & Attribution Domain
- **campaigns**: Marketing campaigns with channel, spend, and timeline tracking
- **attribution_touches**: Marketing touchpoints linked to leads with attribution weighting

### Workflow & Orchestration Domain
- **tasks**: Action items assigned to users or roles with priority and due dates
- **approvals**: Authorization requests with approval workflow tracking

### System Infrastructure Domain
- **audit_logs**: Immutable change tracking for compliance and debugging
- **integration_sync_states**: External system synchronization status and error tracking
- **event_bus**: Central event stream for analytics, AI training, and workflow triggers

## Complete Object Inventory After PR 3

After applying migrations 0001-0010, the database contains:

### Identity & CRM (PR 2)
- households
- customers
- leads
- communication_events

### Activity & Engagement (PR 2)
- appointments
- showroom_visits

### Vehicle & Inventory (PR 2)
- vehicle_catalog_items
- inventory_units

### Sales Structure (PR 3)
- trade_appraisals
- desk_scenarios
- quotes

### Finance Foundation (PR 3)
- quick_apps
- credit_apps
- lender_decisions
- fi_menus

### Deal Management (PR 3)
- deals
- deal_document_packages
- funding_exceptions

### Fixed Ops Foundation (PR 3)
- service_events
- declined_work_events
- recon_jobs

### Growth & Orchestration (PR 3)
- campaigns
- attribution_touches
- tasks
- approvals
- audit_logs
- integration_sync_states
- event_bus

**Total: 27 tables** providing complete canonical structure for dealership operations.

## What Remains for Later Migrations (PR 4)

### Migration 0011: Foreign Key Fixups
- Add FK constraint: `households.primary_customer_id → customers.id`
- Add FK constraint: `fi_menus.deal_id → deals.id`
- Add FK constraint: `deals.fi_menu_id → fi_menus.id`

### Migration 0012: Indexes
Create performance indexes on frequently queried columns:

**Identity & CRM**
- `customers.email`, `customers.phone`, `customers.household_id`
- `leads.customer_id`, `leads.status`, `leads.assigned_to_user_id`, `leads.lead_source`
- `communication_events.lead_id`, `communication_events.customer_id`, `communication_events.channel`

**Inventory & Sales**
- `inventory_units.vin`, `inventory_units.stock_number`, `inventory_units.status`
- `trade_appraisals.lead_id`, `trade_appraisals.customer_id`, `trade_appraisals.vin`
- `desk_scenarios.lead_id`, `desk_scenarios.inventory_unit_id`

**Finance & Deals**
- `credit_apps.lead_id`, `credit_apps.customer_id`, `credit_apps.status`
- `lender_decisions.credit_app_id`, `lender_decisions.decision_status`
- `deals.lead_id`, `deals.customer_id`, `deals.status`, `deals.funded_status`

**Service & Fixed Ops**
- `service_events.customer_id`, `service_events.household_id`, `service_events.vehicle_vin`
- `recon_jobs.inventory_unit_id`, `recon_jobs.stage`

**Workflow & System**
- `tasks.linked_object_type + linked_object_id`, `tasks.assigned_to_user_id`, `tasks.status`
- `approvals.object_type + object_id`, `approvals.status`, `approvals.approver_user_id`
- `audit_logs.object_type + object_id`, `audit_logs.actor_id`, `audit_logs.created_at`
- `event_bus.event_name`, `event_bus.status`, `event_bus.created_at`

### Migration 0013: Updated_at Triggers
Add automatic timestamp update triggers for all tables with `updated_at` columns.

Pattern:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Migration 0014: Seed Demo Data
Create realistic seed data for demonstration and testing:
- Sample households and customers
- Sample leads with various statuses
- Sample inventory units
- Sample appointments and showroom visits
- Sample desk scenarios and quotes
- Sample deals in various stages
- Sample service events
- Sample tasks and approvals

## Design Principles Maintained

### Naming Conventions
- **snake_case** for all column names
- **Descriptive, unambiguous names** (e.g., `assigned_to_user_id` not just `user_id`)
- **Consistent suffixes**: `_at` for timestamps, `_id` for UUIDs, `_json` for JSONB columns

### Data Types
- **UUID** for all primary keys using `gen_random_uuid()`
- **timestamptz** for all timestamps to preserve timezone information
- **numeric(12,2)** for monetary values (12 digits total, 2 decimal places)
- **numeric(6,3)** for APR (allows up to 999.999%)
- **numeric(5,2)** for scores and confidence values
- **numeric(8,4)** for attribution weights
- **integer** for counts, days, months
- **jsonb** for semi-structured data (terms, products, metadata, etc.)

### Defaults
- `created_at` always defaults to `now()`
- `updated_at` always defaults to `now()` (triggers will be added in migration 0013)
- Status columns have sensible defaults (e.g., `status default 'draft'`, `status default 'open'`)
- Boolean flags default to `false` for opt-in scenarios
- Counters default to `0`
- JSONB columns default to appropriate empty structures (`'{}'::jsonb` or `'[]'::jsonb`)

### Deletion Behavior
- **cascade** for strong parent-child relationships (e.g., `deal_id → deal_document_packages`)
- **set null** for optional associations (e.g., `campaign_id` on attribution touches)

### Polymorphic References
Several tables use polymorphic references via `object_type` + `object_id` pattern:
- **tasks**: Can link to any object type (leads, deals, service events, etc.)
- **approvals**: Can require approval for any object type
- **audit_logs**: Can track changes to any object type
- **integration_sync_states**: Can sync any object type with external systems
- **event_bus**: Can publish events for any object type

This provides flexibility without creating dozens of optional FK columns.

## Migration Safety

All migrations follow these safety rules:

✅ **Deterministic SQL** - Same result every time
✅ **No DROP TABLE** - Never destroy existing data
✅ **No business logic** - Pure schema definition
✅ **Clear dependencies** - Foreign keys enforce correct order
✅ **Documented edge cases** - Comments explain circular dependencies
✅ **Consistent naming** - Matches canonical object definitions

## Verification Checklist

After applying migrations 0006-0010, verify:

- [ ] All 10 new tables exist with correct column names and types
- [ ] Primary keys are UUID with `gen_random_uuid()` default
- [ ] Foreign keys enforce correct relationships (except deferred circular FKs)
- [ ] Default values are set correctly
- [ ] Timestamps use `timestamptz` not `timestamp`
- [ ] Numeric precision is appropriate (12,2 for money, 6,3 for APR, etc.)
- [ ] JSONB columns have appropriate default empty structures
- [ ] Boolean columns have appropriate defaults
- [ ] Integer columns use `integer` not `int` for consistency
- [ ] No typos in column names (cross-reference with canonical_objects.md)

## Generated Types

After applying these migrations to a PostgreSQL database, TypeScript types should be regenerated from the schema and placed in:
- `src/types/database.generated.ts`

**Important**: Do not hand-edit generated database types. Regenerate them after each migration batch.

See `migrations/TYPE_GENERATION_TODO.md` for detailed instructions.

## Next Steps (PR 4)

PR 4 should focus on **schema refinement and optimization**, not feature development:

1. **Migration 0011**: Foreign key fixups for circular dependencies
   - `households.primary_customer_id → customers.id`
   - `fi_menus.deal_id → deals.id`
   - `deals.fi_menu_id → fi_menus.id`

2. **Migration 0012**: Comprehensive index pack for query performance
   - Add indexes on all frequently queried columns
   - Add composite indexes for common query patterns
   - Document index strategy and maintenance

3. **Migration 0013**: Updated_at triggers for automatic timestamp maintenance
   - Create trigger function
   - Apply to all tables with `updated_at` columns
   - Test trigger behavior

4. **Migration 0014**: Seed demo data for testing and demonstration
   - Create realistic sample data across all domains
   - Ensure referential integrity
   - Document seed data assumptions

5. **Update TYPE_GENERATION_TODO.md** with latest table count and schema state

**After PR 4, the database schema will be complete and ready for application layer development.**

## Notes

- These migrations are **deterministic** and safe to run on empty databases
- No data manipulation or business logic is included (schema-only)
- All column names match canonical object definitions from `docs/architecture/canonical_objects.md`
- Circular dependencies are documented and will be resolved in migration 0011
- Indexes are intentionally deferred to migration 0012 for dedicated performance tuning
- Triggers are intentionally deferred to migration 0013 for dedicated automation setup
- The schema is now enterprise-ready and can support full dealership operations
