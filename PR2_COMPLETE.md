# PR 2 Complete: Database Schema Foundation

## Summary

PR 2 establishes the **first layer of canonical database structure** for Outcome Dealer OS, creating a real foundation for identity, CRM, appointments, showroom events, vehicle catalog, and inventory.

## Deliverables

### Migration Files Created

All migrations created in strict order as specified:

1. ✅ `/migrations/0001_enable_extensions.sql`
2. ✅ `/migrations/0002_create_households_and_customers.sql`
3. ✅ `/migrations/0003_create_leads_and_communications.sql`
4. ✅ `/migrations/0004_create_appointments_and_showroom.sql`
5. ✅ `/migrations/0005_create_vehicle_catalog_and_inventory.sql`

### Documentation Created

- ✅ `/docs/architecture/phase2_migration_notes.md` - Comprehensive migration strategy and dependency documentation
- ✅ `/migrations/README.md` - Updated with PR 2 status
- ✅ `/migrations/TYPE_GENERATION_TODO.md` - Type generation instructions

---

## Migration Summaries

### 0001_enable_extensions.sql
**Purpose**: Enable PostgreSQL extensions required for the application

**Objects Created**:
- `pgcrypto` extension (provides `gen_random_uuid()` function)

**Dependencies**: None (first migration)

**Notes**: Deterministic and idempotent using `create extension if not exists`

---

### 0002_create_households_and_customers.sql
**Purpose**: Establish identity foundation

**Objects Created**:
- `households` table - Core identity container representing buying households
- `customers` table - Individual contacts within households

**Key Fields (households)**:
- `id` (UUID, PK)
- `primary_customer_id` (UUID, nullable - FK added in future migration)
- `household_name` (text)
- `household_type` (text, default 'consumer')
- `preferred_store_id` (UUID)
- `notes` (text)
- Standard timestamps

**Key Fields (customers)**:
- `id` (UUID, PK)
- `household_id` (UUID, FK → households)
- `first_name`, `last_name`, `full_name`, `email`, `phone`
- `address`, `city`, `state`, `zip`
- `source`, `lifecycle_stage` (default 'lead')
- `current_vehicle_summary`
- `preferred_contact_method`
- `opt_in_sms`, `opt_in_email` (booleans)
- Standard timestamps

**Dependencies**: 0001 (pgcrypto)

**Notes**: 
- `households.primary_customer_id` remains nullable without FK constraint to avoid circular dependency
- FK will be added in future migration after both tables are established

---

### 0003_create_leads_and_communications.sql
**Purpose**: Establish CRM tracking foundation

**Objects Created**:
- `leads` table - Sales opportunity tracking
- `communication_events` table - Communication audit trail

**Key Fields (leads)**:
- `id` (UUID, PK)
- `customer_id` (UUID, FK → customers, cascade)
- `household_id` (UUID, FK → households, set null)
- Attribution: `lead_source`, `source_campaign_id`, `source_medium`, `source_detail`
- `intent_type`
- Assignment: `assigned_to_user_id`, `assigned_team`
- `status` (default 'new')
- `lead_score` (numeric 5,2, default 0)
- Status tracking: `appointment_status`, `showroom_status`, `sold_lost_status`
- `lost_reason`
- Standard timestamps

**Key Fields (communication_events)**:
- `id` (UUID, PK)
- `lead_id` (UUID, FK → leads, cascade)
- `customer_id` (UUID, FK → customers, cascade)
- `channel`, `direction`
- `subject`, `body`, `transcript`, `summary`
- AI fields: `ai_generated`, `ai_confidence`
- `consent_checked` (boolean)
- `sent_by_user_id`, `sent_by_agent`
- `created_at` (no updated_at for audit trail)

**Dependencies**: 0002 (households, customers)

---

### 0004_create_appointments_and_showroom.sql
**Purpose**: Track scheduled appointments and showroom activity

**Objects Created**:
- `appointments` table - Scheduled customer appointments
- `showroom_visits` table - Walk-in showroom activity

**Key Fields (appointments)**:
- `id` (UUID, PK)
- `lead_id` (UUID, FK → leads, cascade)
- `customer_id` (UUID, FK → customers, cascade)
- `appointment_type`
- `scheduled_for` (timestamptz)
- `status` (default 'scheduled')
- `assigned_user_id` (UUID)
- `notes`, `show_result`
- Standard timestamps

**Key Fields (showroom_visits)**:
- `id` (UUID, PK)
- `lead_id` (UUID, FK → leads, cascade)
- `customer_id` (UUID, FK → customers, cascade)
- `check_in_at` (timestamptz, default now())
- `checked_in_by_user_id` (UUID)
- `demo_vehicle_id` (UUID)
- `test_drive_completed` (boolean)
- `notes`
- `created_at` only (no updated_at)

**Dependencies**: 0003 (leads)

---

### 0005_create_vehicle_catalog_and_inventory.sql
**Purpose**: Establish vehicle catalog and inventory tracking

**Objects Created**:
- `vehicle_catalog_items` table - Vehicle reference catalog
- `inventory_units` table - Physical inventory units

**Key Fields (vehicle_catalog_items)**:
- `id` (UUID, PK)
- `year`, `make`, `model`, `trim`
- `package_data` (jsonb, default {})
- `powertrain`, `body_style`, `segment`
- `competitive_set` (jsonb, default [])
- `ownership_notes`
- Standard timestamps

**Key Fields (inventory_units)**:
- `id` (UUID, PK)
- `vin`, `stock_number`
- `year`, `make`, `model`, `trim`, `mileage`
- `vehicle_catalog_item_id` (UUID, FK → vehicle_catalog_items, set null)
- `unit_type` (default 'retail_vehicle')
- Costing: `acquisition_source`, `acquisition_cost`, `reconditioning_cost`, `total_cost_basis`
- Pricing: `list_price`, `sale_price`
- Status: `status` (default 'inventory'), `recon_status` (default 'not_started')
- `frontline_ready_at` (timestamptz)
- `aging_days` (integer, default 0)
- `wholesale_recommended` (boolean)
- Standard timestamps

**Dependencies**: None (independent domain)

---

## Assumptions Made

1. **Migration Tool**: Migrations are written for raw PostgreSQL and assume a migration runner (Supabase, Flyway, or similar) will apply them in order

2. **No Triggers Yet**: `updated_at` columns are created but triggers are not added in PR 2. They will be added in a future PR for consistency.

3. **No Indexes Yet**: Per instructions, indexes are deferred to a future migration unless they were explicitly required in 0001-0005 (none were specified).

4. **User ID References**: Fields like `assigned_to_user_id`, `sent_by_user_id` are UUID type but do not have FK constraints yet because the `users` table doesn't exist in PR 2. These will be added when the auth/users schema is established.

5. **Store References**: `preferred_store_id` on households is UUID without FK because multi-store schema is out of scope for PR 2.

6. **No Enums**: Status fields use `text` type rather than PostgreSQL enums for flexibility during development. This can be migrated to enums later if needed.

7. **Timezone Handling**: All timestamps use `timestamptz` to preserve timezone information as per enterprise best practices.

8. **Soft Deletes Not Implemented**: Hard deletion with cascade/set null is used. Soft delete patterns can be added in future migrations if required.

---

## Database Types Status

### Generated Types: ⏳ Not Yet Generated

This environment does not have direct database access, so TypeScript types could not be auto-generated.

**Manual Action Required**:
1. Apply migrations 0001-0005 to a PostgreSQL database
2. Run type generation tool (Supabase CLI, Prisma, etc.)
3. Output types to `src/types/database.generated.ts`

See `/migrations/TYPE_GENERATION_TODO.md` for detailed instructions.

---

## Schema Validation

All migrations validated against:
- ✅ `/docs/architecture/canonical_objects.md`
- ✅ `/docs/architecture/phase1_schema_map.md`
- ✅ PR 2 specification in user prompt
- ✅ Naming consistency (snake_case, descriptive names)
- ✅ Data type consistency (UUID PKs, timestamptz, numeric for money)
- ✅ FK relationship correctness

---

## What PR 3 Should Build Next

Based on the asset document and logical progression:

### 1. Structural Improvements (Migration 0006)
- Add indexes on high-traffic columns:
  - `customers.email`, `customers.phone`, `customers.household_id`
  - `leads.customer_id`, `leads.status`, `leads.assigned_to_user_id`
  - `inventory_units.vin`, `inventory_units.stock_number`, `inventory_units.status`
  - `communication_events.customer_id`, `communication_events.lead_id`
  - `appointments.customer_id`, `appointments.scheduled_for`
- Add `updated_at` triggers for all tables with `updated_at` columns
- Add FK constraint for `households.primary_customer_id → customers.id`

### 2. Next Domain Layer (Migrations 0007-0009)
Following the dealership flow progression:
- **Migration 0007**: Trades and appraisals
  - `trade_appraisals` table
  - `appraisal_photos` table (if needed)
- **Migration 0008**: Desking and quotes
  - `desk_scenarios` table
  - `quotes` table
  - `desk_structure_items` table (payment breakdown)
- **Migration 0009**: Finance applications
  - `quick_apps` table
  - `credit_apps` table
  - `lender_decisions` table
  - `stip_events` table

### 3. Continue Domain Expansion (Migrations 0010+)
- F&I products and menus
- Deals and deal documents
- Service events and declined work
- Recon jobs and estimates
- Marketing campaigns and attribution

### 4. System Infrastructure (Later Migrations)
- Tasks and workflow
- Approvals and approval workflows
- Audit logs
- Event bus
- Integration sync states

---

## Notes

- ✅ No advanced feature UI built (as instructed)
- ✅ No domain CRUD service layers built yet (as instructed)
- ✅ No integrations added (as instructed)
- ✅ Migration order strictly followed
- ✅ Asset document followed exactly
- ✅ All SQL is deterministic and enterprise-ready
- ✅ Comments added where future FK fixups will happen

---

## Repository Status

**PR 1 Status**: ✅ Complete
- Premium app shell with role-aware navigation
- Canonical roles, permissions, events defined
- Policy helpers implemented
- Foundational documentation complete

**PR 2 Status**: ✅ Complete
- Migrations 0001-0005 created
- Migration documentation complete
- Schema foundation ready for development
- Type generation instructions documented

**Next**: PR 3 should add indexes, triggers, FK fixups, and continue with trades/appraisals domain
