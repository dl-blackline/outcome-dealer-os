-- Migration 0008: Create Lender Decisions, F&I Menus, and Deals
-- Purpose: Establish lender response tracking, F&I product menus, and deal records
-- Dependencies: 0007 (credit_apps), 0006 (trade_appraisals, desk_scenarios), 0005 (inventory_units), 0003 (leads), 0002 (customers)
-- Note: Circular FK between deals.fi_menu_id and fi_menus.deal_id will be finalized in migration 0011

-- =============================================================================
-- LENDER_DECISIONS
-- =============================================================================
-- Lender response to credit application: approved, countered, declined
-- Tracks approval terms, stipulations, and missing documentation

create table lender_decisions (
  id uuid primary key default gen_random_uuid(),
  credit_app_id uuid references credit_apps(id) on delete cascade,
  lender_name text not null,
  decision_status text not null,
  approval_terms_json jsonb not null default '{}'::jsonb,
  stip_status text not null default 'none',
  missing_items_json jsonb not null default '[]'::jsonb,
  confidence_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- FI_MENUS
-- =============================================================================
-- F&I product presentation: warranty, GAP, service contract, theft protection
-- Links to deal (added in migration 0011) and lender decision
-- Tracks product selections, reserve amounts, and presentation timing

create table fi_menus (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid,  -- FK constraint will be added in migration 0011 after deals table exists
  lender_decision_id uuid references lender_decisions(id) on delete set null,
  reserve_amount numeric(12,2),
  vsc_selected boolean not null default false,
  gap_selected boolean not null default false,
  ancillary_products_json jsonb not null default '[]'::jsonb,
  menu_presented_at timestamptz,
  accepted_products_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- DEALS
-- =============================================================================
-- Central transaction object linking all deal components
-- Tracks lifecycle from structured → quoted → signed → funded → delivered
-- Links household, customer, inventory, trade, desk scenario, credit app, lender decision, F&I menu

create table deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  inventory_unit_id uuid references inventory_units(id) on delete cascade,
  trade_appraisal_id uuid references trade_appraisals(id) on delete set null,
  desk_scenario_id uuid references desk_scenarios(id) on delete set null,
  credit_app_id uuid references credit_apps(id) on delete set null,
  lender_decision_id uuid references lender_decisions(id) on delete set null,
  fi_menu_id uuid,  -- FK constraint will be added in migration 0011 to avoid circular dependency
  status text not null default 'open',
  funded_status text not null default 'not_funded',
  funding_exception_count integer not null default 0,
  front_gross_actual numeric(12,2),
  back_gross_actual numeric(12,2),
  sold_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Note: Migration 0011 will add FK constraints for:
-- - fi_menus.deal_id → deals.id
-- - deals.fi_menu_id → fi_menus.id
