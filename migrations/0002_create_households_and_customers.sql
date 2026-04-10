-- Migration 0002: Create Households and Customers
-- Purpose: Establish identity foundation with households and customers
-- Dependencies: 0001 (pgcrypto for gen_random_uuid)

-- =============================================================================
-- HOUSEHOLDS
-- =============================================================================
-- Core identity container representing a buying household or business entity
-- NOTE: primary_customer_id remains nullable for now to avoid circular FK
-- A future migration will add the FK constraint after both tables exist

create table households (
  id uuid primary key default gen_random_uuid(),
  primary_customer_id uuid,
  household_name text,
  household_type text not null default 'consumer',
  notes text,
  preferred_store_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- CUSTOMERS
-- =============================================================================
-- Individual person record linked to a household
-- Represents a contact point within the household identity

create table customers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete set null,
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  source text,
  lifecycle_stage text not null default 'lead',
  current_vehicle_summary text,
  preferred_contact_method text,
  opt_in_sms boolean not null default false,
  opt_in_email boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- NOTE: Future migration will add households.primary_customer_id FK constraint
-- after the customers table is fully established
