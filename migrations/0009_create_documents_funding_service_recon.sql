-- Migration 0009: Create Documents, Funding, Service, and Recon
-- Purpose: Establish deal documents, funding exceptions, service events, declined work, and recon tracking
-- Dependencies: 0008 (deals, lender_decisions), 0005 (inventory_units), 0002 (customers, households)

-- =============================================================================
-- DEAL_DOCUMENT_PACKAGES
-- =============================================================================
-- Signed contracts, disclosures, titling docs, delivery checklist
-- Tracks completion status and missing documentation for compliance

create table deal_document_packages (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  status text not null default 'incomplete',
  signed_at timestamptz,
  missing_docs_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- FUNDING_EXCEPTIONS
-- =============================================================================
-- Issues blocking deal funding: missing stips, incorrect disclosure, title delay
-- Tracks resolution status, assignment, and escalation

create table funding_exceptions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  lender_decision_id uuid references lender_decisions(id) on delete set null,
  exception_type text not null,
  severity text not null,
  description text not null,
  resolved boolean not null default false,
  resolved_at timestamptz,
  assigned_to_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- SERVICE_EVENTS
-- =============================================================================
-- Service lane visit: repair order, recommended work, customer acceptance/decline
-- Links to household, customer, and vehicle for retention tracking

create table service_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  vehicle_vin text,
  repair_order_number text,
  advisor_user_id uuid,
  visit_type text not null,
  total_ro_amount numeric(12,2),
  retention_stage text,
  next_service_due timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- DECLINED_WORK_EVENTS
-- =============================================================================
-- Service work customer postponed or rejected
-- Opportunity for follow-up campaign or sales referral if vehicle is aging

create table declined_work_events (
  id uuid primary key default gen_random_uuid(),
  service_event_id uuid references service_events(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  vehicle_vin text,
  declined_work_amount numeric(12,2),
  declined_work_reason text,
  follow_up_status text not null default 'open',
  sales_opportunity_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- RECON_JOBS
-- =============================================================================
-- Reconditioning work required to make inventory unit frontline-ready
-- Tracks stage, vendor, cost estimates vs actuals, bottlenecks, and manager alerts

create table recon_jobs (
  id uuid primary key default gen_random_uuid(),
  inventory_unit_id uuid references inventory_units(id) on delete cascade,
  stage text not null,
  vendor text,
  estimated_cost numeric(12,2),
  actual_cost numeric(12,2),
  started_at timestamptz,
  ready_at timestamptz,
  bottleneck_reason text,
  manager_alerted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
