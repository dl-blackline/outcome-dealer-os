-- Migration 0020: Create Deal Form Packets
-- Purpose: Persist generated form-packet records linked to deals so staff can
--          re-open, reprint, or audit previously generated document packets.
-- Dependencies: 0008 (deals)

-- =============================================================================
-- DEAL_FORM_PACKETS
-- =============================================================================
-- Each row records a packet that was built and optionally saved from the
-- Deal Forms workflow.  The packet captures which form templates were included,
-- any manual field overrides, and audit metadata (who generated it, when).

create table if not exists deal_form_packets (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  deal_label text not null,
  -- Array of form template IDs included in this packet
  form_ids text[] not null default '{}',
  -- Human-readable list of form names for display without re-resolving templates
  forms_included text[] not null default '{}',
  -- Optional name of the preset used (e.g. "Retail Basic Pack"), null for custom
  preset_name text,
  -- Staff user identifier who generated the packet (username / user_id string)
  created_by text,
  -- Monotonically increasing version counter; regenerated packets increment this
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deal_form_packets_deal_id_idx on deal_form_packets(deal_id);
create index if not exists deal_form_packets_created_at_idx on deal_form_packets(created_at desc);
