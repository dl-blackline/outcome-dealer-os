-- Migration 0021: Create Sold Records
-- Purpose: Persistent sold history tied to deal / customer / inventory unit.
--          This is the durable record created when a deal transitions to sold.
-- Dependencies: 0008 (deals, inventory_units)

-- =============================================================================
-- SOLD_RECORDS
-- =============================================================================
-- One row per sold/delivered deal.  Created atomically alongside the deal
-- status change and inventory status transition.

create table if not exists sold_records (
  id uuid primary key default gen_random_uuid(),

  -- Core relationships
  deal_id uuid references deals(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  co_buyer_id uuid references customers(id) on delete set null,
  inventory_unit_id uuid references inventory_units(id) on delete set null,

  -- Sale details
  sold_status text not null default 'sold_pending_delivery',
  sold_date timestamptz not null default now(),
  delivery_date timestamptz,
  agreed_sale_price numeric(12,2),
  front_gross numeric(12,2),
  back_gross numeric(12,2),

  -- Personnel
  salesperson text,
  fi_manager text,

  -- Finance
  lender text,
  amount_financed numeric(12,2),
  down_payment numeric(12,2),
  trade_amount numeric(12,2),
  payoff numeric(12,2),

  -- Vehicle snapshot at time of sale (preserved forever)
  snapshot_year integer,
  snapshot_make text,
  snapshot_model text,
  snapshot_trim text,
  snapshot_body_style text,
  snapshot_stock_number text,
  snapshot_vin text,
  snapshot_vin_last6 text,
  snapshot_mileage integer,
  snapshot_exterior_color text,
  snapshot_interior_color text,
  snapshot_primary_image_url text,
  snapshot_asking_price numeric(12,2),
  snapshot_acquisition_cost numeric(12,2),
  snapshot_inventory_status_at_sale text,

  -- Audit / transition metadata
  marked_sold_by text,
  previous_inventory_status text,
  is_inventory_linked boolean not null default true,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to keep updated_at current
create trigger sold_records_set_updated_at
  before update on sold_records
  for each row execute function set_updated_at();
