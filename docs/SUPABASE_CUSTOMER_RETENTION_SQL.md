# Supabase SQL Required for Customer Retention

This document contains all Supabase DDL/DML SQL needed to properly retain customer
information going forward in Outcome Dealer OS, along with migration SQL for
transitioning from the prior mock/demo setup.

---

## 1. Core Customer Retention Tables

The existing migrations already define the following production-grade tables.
They are listed here with all columns and constraints for reference. Where
columns or indexes are missing they are added in the recommended migration at
the end of this document.

---

### `households`

```sql
create table if not exists households (
  id                  uuid primary key default gen_random_uuid(),
  household_name      text,
  household_type      text not null default 'consumer'
                          check (household_type in ('consumer', 'business', 'fleet')),
  primary_customer_id uuid references customers(id) on delete set null,
  preferred_store_id  uuid,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_households_type on households(household_type);
create index if not exists idx_households_primary_customer on households(primary_customer_id);
```

---

### `customers`

```sql
create table if not exists customers (
  id                        uuid primary key default gen_random_uuid(),
  household_id              uuid references households(id) on delete set null,
  first_name                text,
  last_name                 text,
  full_name                 text generated always as (
                              coalesce(first_name, '') || ' ' || coalesce(last_name, '')
                            ) stored,
  email                     text,
  phone                     text,
  address                   text,
  city                      text,
  state                     char(2),
  zip                       text,
  source                    text,            -- 'website','service_lane','referral','repeat', etc.
  lifecycle_stage           text not null default 'prospect'
                                check (lifecycle_stage in (
                                  'prospect','active','customer','inactive','lost'
                                )),
  current_vehicle_summary   text,
  preferred_contact_method  text
                                check (preferred_contact_method in ('phone','email','sms','mail')),
  opt_in_sms                boolean not null default false,
  opt_in_email              boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists idx_customers_household on customers(household_id);
create index if not exists idx_customers_email     on customers(email);
create index if not exists idx_customers_phone     on customers(phone);
create index if not exists idx_customers_lifecycle on customers(lifecycle_stage);
```

---

### `leads`

```sql
create table if not exists leads (
  id                    uuid primary key default gen_random_uuid(),
  customer_id           uuid not null references customers(id) on delete cascade,
  household_id          uuid references households(id) on delete set null,
  lead_source           text,
  source_campaign_id    text,
  source_medium         text,
  source_detail         text,
  intent_type           text
                            check (intent_type in ('purchase','service','trade','research','financing')),
  assigned_to_user_id   uuid,
  assigned_team         text,
  status                text not null default 'new'
                            check (status in ('new','working','contacted','qualified','sold','lost')),
  lead_score            numeric(5,2) default 0,
  appointment_status    text not null default 'none'
                            check (appointment_status in ('none','scheduled','completed','no_show')),
  showroom_status       text not null default 'none'
                            check (showroom_status in ('none','visited','test_drive')),
  sold_lost_status      text not null default 'open'
                            check (sold_lost_status in ('open','sold','lost')),
  lost_reason           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_leads_customer     on leads(customer_id);
create index if not exists idx_leads_household    on leads(household_id);
create index if not exists idx_leads_status       on leads(status);
create index if not exists idx_leads_assigned     on leads(assigned_to_user_id);
create index if not exists idx_leads_score        on leads(lead_score desc);
```

---

### `deals`

```sql
create table if not exists deals (
  id                       uuid primary key default gen_random_uuid(),
  lead_id                  uuid references leads(id) on delete set null,
  customer_id              uuid not null references customers(id) on delete restrict,
  inventory_unit_id        uuid,            -- references inventory_units(id)
  trade_appraisal_id       uuid,            -- references trade_appraisals(id)
  desk_scenario_id         uuid,            -- references desk_scenarios(id)
  credit_app_id            uuid,            -- references credit_apps(id)
  lender_decision_id       uuid,            -- references lender_decisions(id)
  fi_menu_id               uuid,            -- references fi_menus(id)
  status                   text not null default 'open'
                               check (status in (
                                 'open','structured','quoted','signed','delivered','cancelled'
                               )),
  funded_status            text not null default 'pending'
                               check (funded_status in (
                                 'pending','funded','not_applicable','exception'
                               )),
  funding_exception_count  int not null default 0,
  front_gross_actual       numeric(12,2),
  back_gross_actual        numeric(12,2),
  sold_at                  timestamptz,
  delivered_at             timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_deals_customer     on deals(customer_id);
create index if not exists idx_deals_lead         on deals(lead_id);
create index if not exists idx_deals_status       on deals(status);
create index if not exists idx_deals_funded       on deals(funded_status);
create index if not exists idx_deals_sold_at      on deals(sold_at desc);
```

> **Migration note (mock_deals → deals):** The app previously wrote simplified
> deal records to a localStorage key `outcome.db:mock_deals`. That key is now
> cleared on app load (see `src/main.tsx`) and the deal service now writes to the
> `deals` table. No Supabase migration is needed because `mock_deals` was never
> a real Supabase table — it only existed in local browser storage.

---

### `communication_events`

```sql
create table if not exists communication_events (
  id               uuid primary key default gen_random_uuid(),
  lead_id          uuid references leads(id) on delete set null,
  customer_id      uuid not null references customers(id) on delete cascade,
  channel          text check (channel in ('sms','email','phone','chat','mail','in_person')),
  direction        text check (direction in ('inbound','outbound')),
  subject          text,
  body             text,
  transcript       text,
  summary          text,
  ai_generated     boolean not null default false,
  ai_confidence    numeric(5,2),
  consent_checked  boolean not null default false,
  sent_by_user_id  uuid,
  sent_by_agent    text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_comm_events_customer on communication_events(customer_id);
create index if not exists idx_comm_events_lead     on communication_events(lead_id);
create index if not exists idx_comm_events_channel  on communication_events(channel);
create index if not exists idx_comm_events_created  on communication_events(created_at desc);
```

---

### `appointments`

```sql
create table if not exists appointments (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid references leads(id) on delete set null,
  customer_id         uuid not null references customers(id) on delete cascade,
  appointment_type    text check (appointment_type in (
                        'test_drive','appraisal','trade_appraisal','service','financing','delivery'
                      )),
  scheduled_for       timestamptz,
  status              text not null default 'scheduled'
                          check (status in ('scheduled','completed','cancelled','no_show')),
  assigned_user_id    uuid,
  notes               text,
  show_result         text check (show_result in ('showed','no_show','rescheduled')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_appointments_customer    on appointments(customer_id);
create index if not exists idx_appointments_lead        on appointments(lead_id);
create index if not exists idx_appointments_scheduled   on appointments(scheduled_for);
create index if not exists idx_appointments_status      on appointments(status);
```

---

### `tasks`

```sql
create table if not exists tasks (
  id                    uuid primary key default gen_random_uuid(),
  linked_object_type    text,
  linked_object_id      uuid,
  queue_type            text check (queue_type in (
                          'sales','funding','recon','service','back_office','general'
                        )),
  title                 text not null,
  description           text,
  priority              text not null default 'medium'
                            check (priority in ('low','medium','high','critical')),
  assigned_to_user_id   uuid,
  assigned_team         text,
  status                text not null default 'open'
                            check (status in ('open','in_progress','completed','cancelled')),
  due_at                timestamptz,
  completed_at          timestamptz,
  created_by_user_id    uuid,
  created_by_agent      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_tasks_linked     on tasks(linked_object_type, linked_object_id);
create index if not exists idx_tasks_assigned   on tasks(assigned_to_user_id);
create index if not exists idx_tasks_status     on tasks(status);
create index if not exists idx_tasks_due        on tasks(due_at);
```

---

### `service_events`

```sql
create table if not exists service_events (
  id                   uuid primary key default gen_random_uuid(),
  customer_id          uuid not null references customers(id) on delete cascade,
  household_id         uuid references households(id) on delete set null,
  vehicle_vin          text,
  repair_order_number  text,
  advisor_user_id      uuid,
  visit_type           text check (visit_type in ('maintenance','repair','recall','warranty','inspection')),
  total_ro_amount      numeric(12,2),
  retention_stage      text check (retention_stage in ('new','loyal','at_risk','churned')),
  next_service_due     timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_service_events_customer on service_events(customer_id);
create index if not exists idx_service_events_vin      on service_events(vehicle_vin);
```

---

### `document_records` (customer document retention)

```sql
create table if not exists document_records (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references customers(id) on delete set null,
  deal_id         uuid references deals(id) on delete set null,
  document_type   text not null,   -- 'drivers_license','proof_of_income','insurance', etc.
  file_path       text,
  storage_bucket  text,
  verified        boolean not null default false,
  verified_by     uuid,
  verified_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_docs_customer on document_records(customer_id);
create index if not exists idx_docs_deal     on document_records(deal_id);
create index if not exists idx_docs_type     on document_records(document_type);
```

---

### `audit_logs`

```sql
create table if not exists audit_logs (
  id               uuid primary key default gen_random_uuid(),
  actor_type       text check (actor_type in ('user','agent','system')),
  actor_id         text,
  action           text not null,
  object_type      text not null,
  object_id        uuid,
  before_json      jsonb,
  after_json       jsonb,
  ip_address       inet,
  user_agent       text,
  confidence_score numeric(5,2),
  requires_review  boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists idx_audit_object   on audit_logs(object_type, object_id);
create index if not exists idx_audit_actor    on audit_logs(actor_type, actor_id);
create index if not exists idx_audit_created  on audit_logs(created_at desc);
```

---

## 2. Relationship Summary

```
households
  └── customers (household_id → households.id)
       ├── leads (customer_id → customers.id)
       │    ├── deals (lead_id → leads.id, customer_id → customers.id)
       │    │    ├── fi_menus
       │    │    ├── deal_document_packages
       │    │    ├── funding_exceptions
       │    │    └── lender_decisions
       │    ├── communication_events (lead_id, customer_id)
       │    ├── appointments (lead_id, customer_id)
       │    └── desk_scenarios
       ├── service_events (customer_id)
       ├── document_records (customer_id)
       └── tasks (linked_object_type='customer', linked_object_id=customer.id)
```

---

## 3. Rename mock_deals → deals (already done in code)

The application previously used a localStorage-only table named `mock_deals`.
The service layer has been updated to use the real `deals` table. No Supabase
migration is needed since `mock_deals` never existed in Supabase.

If you see residual data under the `mock_deals` key in any Supabase instance
you managed manually, you can drop it:

```sql
-- Only run if you manually created this table in Supabase (it is not in migrations):
drop table if exists mock_deals;
drop table if exists mock_leads;
```

---

## 4. Recommended Row-Level Security (RLS) Policies

Enable RLS on all customer-facing tables and restrict reads/writes to
authenticated users with the correct role:

```sql
-- Example for customers table (repeat pattern for other tables)
alter table customers enable row level security;

-- Allow authenticated app users to read all customers
create policy "customers_select_authenticated"
  on customers for select
  using (auth.role() = 'authenticated');

-- Allow mutations only for users with sales/manager roles
create policy "customers_insert_sales"
  on customers for insert
  with check (auth.jwt() ->> 'app_role' in ('sales_rep','sales_manager','gm','owner'));

create policy "customers_update_sales"
  on customers for update
  using  (auth.jwt() ->> 'app_role' in ('sales_rep','sales_manager','gm','owner'))
  with check (auth.jwt() ->> 'app_role' in ('sales_rep','sales_manager','gm','owner'));

-- Only managers and above can hard-delete customers
create policy "customers_delete_managers"
  on customers for delete
  using (auth.jwt() ->> 'app_role' in ('sales_manager','gm','owner'));
```

Apply equivalent policies to: `households`, `leads`, `deals`, `communication_events`,
`appointments`, `tasks`, `service_events`, `document_records`.

---

## 5. Updated_at Triggers

All tables already have `updated_at` auto-update triggers applied in migration
`0013_create_updated_at_triggers.sql`. Ensure any new tables added for customer
retention also have the trigger applied:

```sql
-- Template for new tables
create trigger set_updated_at
  before update on <new_table>
  for each row execute function moddatetime(updated_at);
```

---

## 6. Recommended Migration Execution Order

Run these migrations in order against your Supabase project:

| Step | File | Purpose |
|------|------|---------|
| 1 | `0001_enable_extensions.sql` | uuid-ossp, moddatetime, pg_trgm |
| 2 | `0002_create_households_and_customers.sql` | Core CRM tables |
| 3 | `0003_create_leads_and_communications.sql` | Leads + comms |
| 4 | `0004_create_appointments_and_showroom.sql` | Appointments |
| 5 | `0005_create_vehicle_catalog_and_inventory.sql` | Inventory (preserve) |
| 6 | `0006_create_trade_appraisals_and_desk_scenarios.sql` | Desk |
| 7 | `0007_create_quotes_and_finance_apps.sql` | Quotes + credit |
| 8 | `0008_create_lender_decisions_fi_and_deals.sql` | Deals |
| 9 | `0009_create_documents_funding_service_recon.sql` | Documents, service |
| 10 | `0010_create_marketing_tasks_approvals_audit_sync_eventbus.sql` | Supporting tables |
| 11 | `0011_add_foreign_key_fixups.sql` | FK cleanup |
| 12 | `0012_create_indexes.sql` | Performance indexes |
| 13 | `0013_create_updated_at_triggers.sql` | updated_at automation |
| 14 | `0014_seed_demo_data.sql` | Demo data (**skip on production**) |
| 15 | `0015_supabase_public_inventory_and_auth.sql` | Public inventory + auth |
| 16 | `0016_create_finance_credit_application_tables.sql` | Finance applications |
| 17 | `0017_create_operating_observations.sql` | Ops review |
| 18 | `0018_remove_demo_seed_data.sql` | **Remove all demo rows** |

> On a fresh production instance, skip step 14 (`0014_seed_demo_data.sql`)
> entirely so demo rows are never created.

---

## 7. Data Cleanup Summary

The following data has been cleaned up as part of this change:

### Code-level cleanup
- `src/lib/mockData.ts` — arrays were already empty; `MockDeal`/`MockLead` types retained for TypeScript compatibility with existing hooks
- `src/domains/deals/deal.service.ts` — table name changed from `mock_deals` → `deals`; lead lookup table changed from `mock_leads` → `leads`
- `src/app/pages/ops/ReportsPage.tsx` — `generateMockRows()` function removed; `DashboardTab` hardcoded fake metrics replaced with empty state; `ReportResultDialog` now shows proper empty state instead of fake rows

### localStorage cleanup
- `src/main.tsx` — on app bootstrap, `outcome.db:mock_deals` and `outcome.db:mock_leads` are removed from `localStorage`

### Supabase cleanup
- `migrations/0018_remove_demo_seed_data.sql` — removes all demo rows seeded by `0014_seed_demo_data.sql` (households, customers, leads, deals, communications, tasks, approvals, events, etc.)

### Intentionally preserved
- `inventory_units` (inv11111, inv22222, inv33333) — real stock data used by buyer hub and reporting
- `vehicle_catalog_items` (vcat1111, vcat2222, vcat3333) — vehicle catalog entries used by inventory features
- All `outcome.inventory.*` localStorage keys — inventory overrides, imports, and photo data
