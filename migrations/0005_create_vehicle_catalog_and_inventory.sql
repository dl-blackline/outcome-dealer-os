-- Migration 0005: Create Vehicle Catalog and Inventory
-- Purpose: Establish vehicle catalog reference data and inventory unit tracking
-- Dependencies: None (independent domain)

-- =============================================================================
-- VEHICLE_CATALOG_ITEMS
-- =============================================================================
-- Reference catalog of vehicle specifications and competitive positioning
-- Used for inventory tagging, search, and competitive set analysis

create table vehicle_catalog_items (
  id uuid primary key default gen_random_uuid(),
  year integer,
  make text,
  model text,
  trim text,
  package_data jsonb not null default '{}'::jsonb,
  powertrain text,
  body_style text,
  segment text,
  competitive_set jsonb not null default '[]'::jsonb,
  ownership_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- INVENTORY_UNITS
-- =============================================================================
-- Individual inventory units representing physical vehicles in stock
-- Tracks acquisition, costing, pricing, reconditioning status, and aging

create table inventory_units (
  id uuid primary key default gen_random_uuid(),
  vin text,
  stock_number text,
  year integer,
  make text,
  model text,
  trim text,
  mileage integer,
  vehicle_catalog_item_id uuid references vehicle_catalog_items(id) on delete set null,
  unit_type text not null default 'retail_vehicle',
  acquisition_source text,
  acquisition_cost numeric(12,2),
  reconditioning_cost numeric(12,2),
  total_cost_basis numeric(12,2),
  list_price numeric(12,2),
  sale_price numeric(12,2),
  status text not null default 'inventory',
  recon_status text not null default 'not_started',
  frontline_ready_at timestamptz,
  aging_days integer not null default 0,
  wholesale_recommended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
