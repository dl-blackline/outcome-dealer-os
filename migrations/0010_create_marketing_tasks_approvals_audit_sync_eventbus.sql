-- Migration 0010: Create Marketing, Tasks, Approvals, Audit, Sync, and Event Bus
-- Purpose: Establish marketing attribution, workflow management, audit trail, integration sync, and event infrastructure
-- Dependencies: 0003 (leads), 0002 (customers)

-- =============================================================================
-- CAMPAIGNS
-- =============================================================================
-- Outbound marketing effort: email blast, SMS promo, direct mail, digital ad
-- Tracks channel, spend, timeline, status, and attribution model

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  objective text,
  spend numeric(12,2),
  start_date date,
  end_date date,
  status text not null default 'draft',
  attribution_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- ATTRIBUTION_TOUCHES
-- =============================================================================
-- Marketing touchpoint linked to a lead or deal
-- Tracks source, medium, campaign, timestamp, and attribution weight

create table attribution_touches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  lead_id uuid references leads(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  touch_type text not null,
  touch_timestamp timestamptz not null default now(),
  value_weight numeric(8,4) not null default 1,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- TASKS
-- =============================================================================
-- Action item assigned to user or role
-- Links to any object type via polymorphic reference
-- Tracks priority, status, assignment, and due date

create table tasks (
  id uuid primary key default gen_random_uuid(),
  linked_object_type text not null,
  linked_object_id uuid not null,
  queue_type text not null,
  title text not null,
  description text,
  priority text not null default 'medium',
  assigned_to_user_id uuid,
  assigned_team text,
  status text not null default 'open',
  due_at timestamptz,
  created_by_user_id uuid,
  created_by_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- APPROVALS
-- =============================================================================
-- Request for manager or role-based authorization
-- Tracks type (trade value, financial output, AI action), requester, approver, resolution

create table approvals (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,
  object_id uuid not null,
  approval_type text not null,
  status text not null default 'requested',
  requested_by_user_id uuid,
  requested_by_agent text,
  approver_user_id uuid,
  approved_at timestamptz,
  denied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- AUDIT_LOGS
-- =============================================================================
-- Immutable record of every state change
-- Captures who, what, when, before/after for compliance and debugging

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id uuid,
  action text not null,
  object_type text not null,
  object_id uuid not null,
  before_json jsonb,
  after_json jsonb,
  confidence_score numeric(5,2),
  requires_review boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INTEGRATION_SYNC_STATES
-- =============================================================================
-- Status of external system synchronization (DMS, credit bureaus, lender portals)
-- Tracks sync status, errors, retry count, and last sync timestamp

create table integration_sync_states (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,
  object_id uuid not null,
  source_system text not null,
  source_record_id text,
  target_system text not null,
  target_record_id text,
  sync_status text not null default 'pending',
  sync_error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- EVENT_BUS
-- =============================================================================
-- Central event stream capturing all system activity
-- Foundation for analytics, AI training, audit reconstruction, and workflow triggers

create table event_bus (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  object_type text,
  object_id uuid,
  payload jsonb not null default '{}'::jsonb,
  published_by_user_id uuid,
  published_by_agent text,
  status text not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
