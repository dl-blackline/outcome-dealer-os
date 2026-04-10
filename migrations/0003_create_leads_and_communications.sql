-- Migration 0003: Create Leads and Communications
-- Purpose: Establish CRM tracking foundation for lead management and communication history
-- Dependencies: 0002 (households, customers)

-- =============================================================================
-- LEADS
-- =============================================================================
-- Lead record representing a potential sale opportunity
-- Tracks attribution, assignment, scoring, and current workflow status

create table leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  household_id uuid references households(id) on delete set null,
  lead_source text,
  source_campaign_id text,
  source_medium text,
  source_detail text,
  intent_type text,
  assigned_to_user_id uuid,
  assigned_team text,
  status text not null default 'new',
  lead_score numeric(5,2) not null default 0,
  appointment_status text not null default 'none',
  showroom_status text not null default 'none',
  sold_lost_status text not null default 'open',
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- COMMUNICATION_EVENTS
-- =============================================================================
-- Audit trail of all communications with customers across channels
-- Includes AI-generated summaries and consent tracking

create table communication_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  channel text,
  direction text,
  subject text,
  body text,
  transcript text,
  summary text,
  ai_generated boolean not null default false,
  ai_confidence numeric(5,2),
  consent_checked boolean not null default false,
  sent_by_user_id uuid,
  sent_by_agent text,
  created_at timestamptz not null default now()
);
