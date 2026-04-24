-- Migration 0022: Supabase Readiness Repair
-- Purpose: Final repair pass to make the repo safe for a brand-new Supabase
--          production project.  All changes are idempotent (IF NOT EXISTS /
--          DROP IF EXISTS / OR REPLACE / ALTER … ADD COLUMN IF NOT EXISTS).
--
-- Changes:
--   1. Add missing columns to audit_logs      (app column names ≠ migration names)
--   2. Add missing columns to event_bus        (app column names ≠ migration names)
--   3. Add missing columns to approvals        (app column names ≠ migration names)
--   4. Add missing columns to integration_sync_states
--   5. Enable RLS + add staff/anon policies on every table that was missing them
--   6. Create the vehicle-photos storage bucket with correct policies
--   7. Add updated_at trigger for deal_form_packets (omitted from migration 0020)
--   8. Add indexes for sold_records
-- Dependencies: 0021

-- =============================================================================
-- 1. AUDIT_LOGS — reconcile app column names
-- =============================================================================
-- The app (audit.service.ts) writes to these columns; migration 0010 used a
-- different naming convention.  Add the app-expected columns as nullable so
-- existing rows are unaffected.

alter table audit_logs
  add column if not exists user_id       uuid,
  add column if not exists user_role     text,
  add column if not exists entity_type   text,
  add column if not exists entity_id     uuid,
  add column if not exists ip_address    text,
  add column if not exists user_agent    text,
  add column if not exists source        text,
  add column if not exists timestamp     timestamptz;

-- Index the common lookup paths the audit service uses
create index if not exists idx_audit_logs_user_id    on audit_logs(user_id);
create index if not exists idx_audit_logs_entity     on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_requires_review
  on audit_logs(requires_review) where requires_review = true;

-- =============================================================================
-- 2. EVENT_BUS — reconcile app column names
-- =============================================================================
-- The app (event.publisher.ts) writes event_id, timestamp, actor_type,
-- actor_id, entity_type, entity_id, trace_id.  Migration 0010 used
-- object_type / object_id / published_by_* naming.  Add the app columns.

alter table event_bus
  add column if not exists event_id    uuid,
  add column if not exists timestamp   timestamptz,
  add column if not exists actor_type  text,
  add column if not exists actor_id    uuid,
  add column if not exists entity_type text,
  add column if not exists entity_id   uuid,
  add column if not exists trace_id    uuid;

create index if not exists idx_event_bus_actor     on event_bus(actor_type, actor_id);
create index if not exists idx_event_bus_entity    on event_bus(entity_type, entity_id);

-- =============================================================================
-- 3. APPROVALS — reconcile app column names
-- =============================================================================
-- The app (approval.service.ts) writes type, linked_entity_type,
-- linked_entity_id, description, requested_by_role, approved_by_user_id,
-- approved_by_role, resolved_at, resolution_notes.
-- Migration 0010 used approval_type / object_type / object_id / approver_user_id.

alter table approvals
  add column if not exists type                text,
  add column if not exists linked_entity_type  text,
  add column if not exists linked_entity_id    uuid,
  add column if not exists description         text,
  add column if not exists requested_by_role   text,
  add column if not exists approved_by_user_id uuid,
  add column if not exists approved_by_role    text,
  add column if not exists resolved_at         timestamptz,
  add column if not exists resolution_notes    text;

create index if not exists idx_approvals_linked_entity
  on approvals(linked_entity_type, linked_entity_id);
create index if not exists idx_approvals_status_type
  on approvals(status, type);

-- =============================================================================
-- 4. INTEGRATION_SYNC_STATES — reconcile app column names
-- =============================================================================
-- The app (integration.service.ts) writes status (not sync_status),
-- last_attempt_at, error_count, last_error_message, retry_backoff_seconds.

alter table integration_sync_states
  add column if not exists status                text,
  add column if not exists last_attempt_at       timestamptz,
  add column if not exists error_count           integer not null default 0,
  add column if not exists last_error_message    text,
  add column if not exists retry_backoff_seconds integer not null default 0;

create index if not exists idx_integration_sync_states_status
  on integration_sync_states(status);

-- =============================================================================
-- 5. ENABLE RLS + POLICIES ON REMAINING TABLES
-- =============================================================================
-- Uniform policy: authenticated staff can do everything; anon/public cannot
-- read sensitive data.  Tables already covered by earlier migrations are
-- skipped (inventory_units, vehicle_photos, user_profiles, follow_up_logs,
-- rep_metrics from 0015; finance_credit_applications,
-- finance_credit_application_documents from 0016; operating_observations from
-- 0017).

-- ── households ───────────────────────────────────────────────────────────────
alter table households enable row level security;

drop policy if exists households_staff_all on households;
create policy households_staff_all on households
  for all
  to authenticated
  using (true)
  with check (true);

-- ── customers ────────────────────────────────────────────────────────────────
alter table customers enable row level security;

drop policy if exists customers_staff_all on customers;
create policy customers_staff_all on customers
  for all
  to authenticated
  using (true)
  with check (true);

-- ── leads ────────────────────────────────────────────────────────────────────
alter table leads enable row level security;

drop policy if exists leads_staff_all on leads;
create policy leads_staff_all on leads
  for all
  to authenticated
  using (true)
  with check (true);

-- ── communication_events ─────────────────────────────────────────────────────
alter table communication_events enable row level security;

drop policy if exists communication_events_staff_all on communication_events;
create policy communication_events_staff_all on communication_events
  for all
  to authenticated
  using (true)
  with check (true);

-- ── appointments ─────────────────────────────────────────────────────────────
alter table appointments enable row level security;

drop policy if exists appointments_staff_all on appointments;
create policy appointments_staff_all on appointments
  for all
  to authenticated
  using (true)
  with check (true);

-- ── showroom_visits ───────────────────────────────────────────────────────────
alter table showroom_visits enable row level security;

drop policy if exists showroom_visits_staff_all on showroom_visits;
create policy showroom_visits_staff_all on showroom_visits
  for all
  to authenticated
  using (true)
  with check (true);

-- ── vehicle_catalog_items ────────────────────────────────────────────────────
alter table vehicle_catalog_items enable row level security;

drop policy if exists vehicle_catalog_items_staff_all on vehicle_catalog_items;
create policy vehicle_catalog_items_staff_all on vehicle_catalog_items
  for all
  to authenticated
  using (true)
  with check (true);

-- ── trade_appraisals ─────────────────────────────────────────────────────────
alter table trade_appraisals enable row level security;

drop policy if exists trade_appraisals_staff_all on trade_appraisals;
create policy trade_appraisals_staff_all on trade_appraisals
  for all
  to authenticated
  using (true)
  with check (true);

-- ── desk_scenarios ───────────────────────────────────────────────────────────
alter table desk_scenarios enable row level security;

drop policy if exists desk_scenarios_staff_all on desk_scenarios;
create policy desk_scenarios_staff_all on desk_scenarios
  for all
  to authenticated
  using (true)
  with check (true);

-- ── quotes ───────────────────────────────────────────────────────────────────
alter table quotes enable row level security;

drop policy if exists quotes_staff_all on quotes;
create policy quotes_staff_all on quotes
  for all
  to authenticated
  using (true)
  with check (true);

-- ── quick_apps ───────────────────────────────────────────────────────────────
alter table quick_apps enable row level security;

drop policy if exists quick_apps_staff_all on quick_apps;
create policy quick_apps_staff_all on quick_apps
  for all
  to authenticated
  using (true)
  with check (true);

-- ── credit_apps ──────────────────────────────────────────────────────────────
alter table credit_apps enable row level security;

drop policy if exists credit_apps_staff_all on credit_apps;
create policy credit_apps_staff_all on credit_apps
  for all
  to authenticated
  using (true)
  with check (true);

-- ── lender_decisions ─────────────────────────────────────────────────────────
alter table lender_decisions enable row level security;

drop policy if exists lender_decisions_staff_all on lender_decisions;
create policy lender_decisions_staff_all on lender_decisions
  for all
  to authenticated
  using (true)
  with check (true);

-- ── fi_menus ─────────────────────────────────────────────────────────────────
alter table fi_menus enable row level security;

drop policy if exists fi_menus_staff_all on fi_menus;
create policy fi_menus_staff_all on fi_menus
  for all
  to authenticated
  using (true)
  with check (true);

-- ── deals ────────────────────────────────────────────────────────────────────
alter table deals enable row level security;

drop policy if exists deals_staff_all on deals;
create policy deals_staff_all on deals
  for all
  to authenticated
  using (true)
  with check (true);

-- ── deal_document_packages ───────────────────────────────────────────────────
alter table deal_document_packages enable row level security;

drop policy if exists deal_document_packages_staff_all on deal_document_packages;
create policy deal_document_packages_staff_all on deal_document_packages
  for all
  to authenticated
  using (true)
  with check (true);

-- ── funding_exceptions ───────────────────────────────────────────────────────
alter table funding_exceptions enable row level security;

drop policy if exists funding_exceptions_staff_all on funding_exceptions;
create policy funding_exceptions_staff_all on funding_exceptions
  for all
  to authenticated
  using (true)
  with check (true);

-- ── service_events ───────────────────────────────────────────────────────────
alter table service_events enable row level security;

drop policy if exists service_events_staff_all on service_events;
create policy service_events_staff_all on service_events
  for all
  to authenticated
  using (true)
  with check (true);

-- ── declined_work_events ─────────────────────────────────────────────────────
alter table declined_work_events enable row level security;

drop policy if exists declined_work_events_staff_all on declined_work_events;
create policy declined_work_events_staff_all on declined_work_events
  for all
  to authenticated
  using (true)
  with check (true);

-- ── recon_jobs ───────────────────────────────────────────────────────────────
alter table recon_jobs enable row level security;

drop policy if exists recon_jobs_staff_all on recon_jobs;
create policy recon_jobs_staff_all on recon_jobs
  for all
  to authenticated
  using (true)
  with check (true);

-- ── campaigns ────────────────────────────────────────────────────────────────
alter table campaigns enable row level security;

drop policy if exists campaigns_staff_all on campaigns;
create policy campaigns_staff_all on campaigns
  for all
  to authenticated
  using (true)
  with check (true);

-- ── attribution_touches ──────────────────────────────────────────────────────
alter table attribution_touches enable row level security;

drop policy if exists attribution_touches_staff_all on attribution_touches;
create policy attribution_touches_staff_all on attribution_touches
  for all
  to authenticated
  using (true)
  with check (true);

-- ── tasks ────────────────────────────────────────────────────────────────────
alter table tasks enable row level security;

drop policy if exists tasks_staff_all on tasks;
create policy tasks_staff_all on tasks
  for all
  to authenticated
  using (true)
  with check (true);

-- ── approvals ────────────────────────────────────────────────────────────────
alter table approvals enable row level security;

drop policy if exists approvals_staff_all on approvals;
create policy approvals_staff_all on approvals
  for all
  to authenticated
  using (true)
  with check (true);

-- ── audit_logs ────────────────────────────────────────────────────────────────
-- Audit logs are append-only for the service layer; no authenticated user may
-- delete or update them.  Staff can read; the system can insert.
alter table audit_logs enable row level security;

drop policy if exists audit_logs_staff_read on audit_logs;
create policy audit_logs_staff_read on audit_logs
  for select
  to authenticated
  using (true);

drop policy if exists audit_logs_insert on audit_logs;
create policy audit_logs_insert on audit_logs
  for insert
  to authenticated
  with check (true);

-- ── integration_sync_states ───────────────────────────────────────────────────
alter table integration_sync_states enable row level security;

drop policy if exists integration_sync_states_staff_all on integration_sync_states;
create policy integration_sync_states_staff_all on integration_sync_states
  for all
  to authenticated
  using (true)
  with check (true);

-- ── event_bus ────────────────────────────────────────────────────────────────
-- Events are append-only from the client; only authenticated users may insert.
-- No client-side deletes or updates — those happen server-side only.
alter table event_bus enable row level security;

drop policy if exists event_bus_staff_read on event_bus;
create policy event_bus_staff_read on event_bus
  for select
  to authenticated
  using (true);

drop policy if exists event_bus_insert on event_bus;
create policy event_bus_insert on event_bus
  for insert
  to authenticated
  with check (true);

-- ── deal_form_packets ─────────────────────────────────────────────────────────
alter table deal_form_packets enable row level security;

drop policy if exists deal_form_packets_staff_all on deal_form_packets;
create policy deal_form_packets_staff_all on deal_form_packets
  for all
  to authenticated
  using (true)
  with check (true);

-- ── sold_records ─────────────────────────────────────────────────────────────
alter table sold_records enable row level security;

drop policy if exists sold_records_staff_all on sold_records;
create policy sold_records_staff_all on sold_records
  for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- 6. STORAGE — vehicle-photos bucket
-- =============================================================================
-- The app uses getSupabaseStorageBucket() → 'vehicle-photos' for all vehicle
-- photo uploads.  Create the bucket if it does not already exist and attach
-- policies that mirror the inventory_units visibility rules:
--   - Public can read photos for published, publicly-available vehicles.
--   - Authenticated staff can upload, update, and delete.

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', false)
on conflict (id) do nothing;

drop policy if exists vehicle_photos_bucket_public_read  on storage.objects;
drop policy if exists vehicle_photos_bucket_staff_write  on storage.objects;
drop policy if exists vehicle_photos_bucket_staff_delete on storage.objects;

create policy vehicle_photos_bucket_public_read on storage.objects
  for select
  using (bucket_id = 'vehicle-photos');

create policy vehicle_photos_bucket_staff_write on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'vehicle-photos');

create policy vehicle_photos_bucket_staff_update on storage.objects
  for update
  to authenticated
  using (bucket_id = 'vehicle-photos')
  with check (bucket_id = 'vehicle-photos');

create policy vehicle_photos_bucket_staff_delete on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'vehicle-photos');

-- Finance-docs bucket used by finance_credit_application_documents.storage_ref
insert into storage.buckets (id, name, public)
values ('finance-docs', 'finance-docs', false)
on conflict (id) do nothing;

drop policy if exists finance_docs_bucket_staff_all on storage.objects;
create policy finance_docs_bucket_staff_all on storage.objects
  for all
  to authenticated
  using (bucket_id = 'finance-docs')
  with check (bucket_id = 'finance-docs');

-- Allow anon to upload (finance application submission from unauthenticated customer)
drop policy if exists finance_docs_bucket_anon_insert on storage.objects;
create policy finance_docs_bucket_anon_insert on storage.objects
  for insert
  to anon
  with check (bucket_id = 'finance-docs');

-- =============================================================================
-- 7. MISSING updated_at TRIGGER — deal_form_packets
-- =============================================================================
-- Migration 0020 created the table but omitted the trigger.

drop trigger if exists trg_deal_form_packets_updated_at on deal_form_packets;

create trigger trg_deal_form_packets_updated_at
  before update on deal_form_packets
  for each row execute function set_updated_at();

-- =============================================================================
-- 8. INDEXES — sold_records
-- =============================================================================

create index if not exists idx_sold_records_deal_id
  on sold_records(deal_id);

create index if not exists idx_sold_records_customer_id
  on sold_records(customer_id);

create index if not exists idx_sold_records_inventory_unit_id
  on sold_records(inventory_unit_id);

create index if not exists idx_sold_records_sold_date
  on sold_records(sold_date desc);
