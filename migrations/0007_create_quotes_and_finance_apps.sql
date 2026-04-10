-- Migration 0007: Create Quotes and Finance Apps
-- Purpose: Establish quote generation, quick credit apps, and full credit applications
-- Dependencies: 0003 (leads), 0002 (customers), 0006 (desk_scenarios)

-- =============================================================================
-- QUOTES
-- =============================================================================
-- Formalized pricing output sent to customer
-- Links to lead, customer, and optionally to a desk scenario
-- Tracks delivery channel, acceptance status, and expiration

create table quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  desk_scenario_id uuid references desk_scenarios(id) on delete set null,
  quote_type text not null,
  quote_amount numeric(12,2),
  explanation text,
  status text not null default 'draft',
  sent_channel text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- QUICK_APPS
-- =============================================================================
-- Quick credit application for soft pull / initial decisioning
-- Minimal fields, quick turnaround, preliminary approval range
-- Can route to finance connectors or be used internally

create table quick_apps (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  consent_version text,
  identity_status text not null default 'unknown',
  status text not null default 'started',
  routed_to_connector boolean not null default false,
  connector_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- CREDIT_APPS
-- =============================================================================
-- Full credit application submitted to lenders
-- Comprehensive financials, employment, residence history
-- Links to quick_app if workflow started there, stores sensitive data reference

create table credit_apps (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  quick_app_id uuid references quick_apps(id) on delete set null,
  finance_connector text,
  status text not null default 'started',
  consent_version text,
  sensitive_data_token_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
