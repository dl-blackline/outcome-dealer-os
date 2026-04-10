-- Migration 0004: Create Appointments and Showroom Visits
-- Purpose: Track scheduled appointments and walk-in showroom activity
-- Dependencies: 0003 (leads)

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
-- Scheduled appointments for test drives, trade appraisals, delivery, etc.
-- Tracks booking, assignment, and outcome

create table appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  appointment_type text,
  scheduled_for timestamptz,
  status text not null default 'scheduled',
  assigned_user_id uuid,
  notes text,
  show_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- SHOWROOM_VISITS
-- =============================================================================
-- Walk-in showroom visit tracking for customers who arrive without appointment
-- Captures demo vehicles, test drives, and visit notes

create table showroom_visits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  check_in_at timestamptz not null default now(),
  checked_in_by_user_id uuid,
  demo_vehicle_id uuid,
  test_drive_completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
