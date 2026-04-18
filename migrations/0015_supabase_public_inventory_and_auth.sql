-- Migration 0015: Supabase auth bridge and public inventory publishing
-- Purpose: Extend the existing inventory schema for public storefront use and add
-- supporting tables for Supabase-backed auth profiles, photo storage, and follow-up tracking.

alter table inventory_units
  add column if not exists source_listing_id text,
  add column if not exists body_style text,
  add column if not exists available_publicly boolean not null default true,
  add column if not exists is_published boolean not null default false,
  add column if not exists is_featured boolean not null default false,
  add column if not exists public_description text,
  add column if not exists features jsonb not null default '[]'::jsonb,
  add column if not exists color text,
  add column if not exists vehicle_condition text,
  add column if not exists drivetrain text,
  add column if not exists engine text,
  add column if not exists transmission text;

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  app_role text not null default 'sales_manager',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  inventory_unit_id uuid not null references inventory_units(id) on delete cascade,
  photo_url text,
  storage_path text,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_photos_source_check check (photo_url is not null or storage_path is not null)
);

create table if not exists follow_up_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  inventory_unit_id uuid references inventory_units(id) on delete set null,
  performed_by_user_id uuid references auth.users(id) on delete set null,
  channel text not null,
  outcome text not null,
  notes text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rep_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  leads_contacted integer not null default 0,
  appointments_set integer not null default 0,
  appointments_shown integer not null default 0,
  applications_started integer not null default 0,
  deals_closed integer not null default 0,
  gross_profit numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_date)
);

create index if not exists idx_inventory_units_published on inventory_units (is_published, available_publicly, status);
create index if not exists idx_inventory_units_listing_id on inventory_units (source_listing_id);
create index if not exists idx_vehicle_photos_unit_sort on vehicle_photos (inventory_unit_id, sort_order);
create index if not exists idx_follow_up_logs_due_at on follow_up_logs (due_at);
create index if not exists idx_rep_metrics_user_date on rep_metrics (user_id, metric_date desc);

alter table inventory_units enable row level security;
alter table vehicle_photos enable row level security;
alter table user_profiles enable row level security;
alter table follow_up_logs enable row level security;
alter table rep_metrics enable row level security;

drop policy if exists inventory_public_read on inventory_units;
create policy inventory_public_read on inventory_units
  for select
  using (is_published = true and available_publicly = true);

drop policy if exists inventory_staff_manage on inventory_units;
create policy inventory_staff_manage on inventory_units
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists vehicle_photos_public_read on vehicle_photos;
create policy vehicle_photos_public_read on vehicle_photos
  for select
  using (
    exists (
      select 1
      from inventory_units
      where inventory_units.id = vehicle_photos.inventory_unit_id
        and inventory_units.is_published = true
        and inventory_units.available_publicly = true
    )
  );

drop policy if exists vehicle_photos_staff_manage on vehicle_photos;
create policy vehicle_photos_staff_manage on vehicle_photos
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists user_profiles_self_read on user_profiles;
create policy user_profiles_self_read on user_profiles
  for select
  using (auth.uid() = id or auth.role() = 'authenticated');

drop policy if exists user_profiles_self_write on user_profiles;
create policy user_profiles_self_write on user_profiles
  for all
  using (auth.uid() = id or auth.role() = 'authenticated')
  with check (auth.uid() = id or auth.role() = 'authenticated');

drop policy if exists follow_up_logs_staff_only on follow_up_logs;
create policy follow_up_logs_staff_only on follow_up_logs
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists rep_metrics_staff_only on rep_metrics;
create policy rep_metrics_staff_only on rep_metrics
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');