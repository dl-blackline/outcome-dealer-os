-- Migration 0006: Create Trade Appraisals and Desk Scenarios
-- Purpose: Establish trade-in appraisal tracking and sales desking scenarios
-- Dependencies: 0003 (leads), 0002 (customers), 0005 (inventory_units)

-- =============================================================================
-- TRADE_APPRAISALS
-- =============================================================================
-- Customer vehicle offered as trade-in
-- Tracks condition assessment, valuation, manager approval, and recon estimates
-- Links to lead/customer and optionally to inventory if kept for stock

create table trade_appraisals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  inventory_unit_id uuid references inventory_units(id) on delete set null,
  vin text,
  year integer,
  make text,
  model text,
  trim text,
  mileage integer,
  condition_notes text,
  appraisal_value numeric(12,2),
  recon_estimate numeric(12,2),
  market_exit_value numeric(12,2),
  valuation_explanation text,
  appraised_by_user_id uuid,
  manager_approved boolean not null default false,
  manager_approved_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- DESK_SCENARIOS
-- =============================================================================
-- Sales manager desking pencil showing vehicle, trade, payment structure
-- Multiple scenarios can exist per deal as negotiations progress
-- Links to lead, customer, inventory unit, and optionally trade appraisal

create table desk_scenarios (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  inventory_unit_id uuid references inventory_units(id) on delete cascade,
  trade_appraisal_id uuid references trade_appraisals(id) on delete set null,
  scenario_type text not null,
  sale_price numeric(12,2),
  down_payment numeric(12,2),
  trade_value numeric(12,2),
  payoff numeric(12,2),
  taxes numeric(12,2),
  fees numeric(12,2),
  term_months integer,
  apr numeric(6,3),
  monthly_payment numeric(12,2),
  incentive_snapshot jsonb not null default '{}'::jsonb,
  front_gross_estimate numeric(12,2),
  payment_explanation text,
  customer_summary text,
  presented_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
