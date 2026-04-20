-- Migration 0018: Remove Demo Seed Data
-- Purpose: Delete all placeholder/demo rows seeded by migration 0014_seed_demo_data.sql.
--          Inventory records (inventory_units, vehicle_catalog_items) are intentionally
--          preserved because they represent real-world stock data used by the buyer hub
--          and reporting features.
--
-- Safe to run multiple times (all DELETEs are id-specific or keyed on seed UUIDs).
-- Dependency order: children before parents to avoid FK violations.

-- ─── Event Bus ────────────────────────────────────────────────────────────────
delete from event_bus where id in (
  'evt11111-1111-1111-1111-111111111111',
  'evt11112-1111-1111-1111-111111111111',
  'evt22221-2222-2222-2222-222222222222',
  'evt33331-3333-3333-3333-333333333333',
  'evt44441-4444-4444-4444-444444444444',
  'evt55551-5555-5555-5555-555555555555'
);

-- ─── Integration Sync States ──────────────────────────────────────────────────
delete from integration_sync_states where id in (
  'sync1111-1111-1111-1111-111111111111',
  'sync2222-2222-2222-2222-222222222222',
  'sync3333-3333-3333-3333-333333333333',
  'sync4444-4444-4444-4444-444444444444'
);

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
delete from audit_logs where id in (
  'aud11111-1111-1111-1111-111111111111',
  'aud11112-1111-1111-1111-111111111111',
  'aud11113-1111-1111-1111-111111111111',
  'aud22221-2222-2222-2222-222222222222',
  'aud33331-3333-3333-3333-333333333333'
);

-- ─── Approvals ────────────────────────────────────────────────────────────────
delete from approvals where id in (
  'apv11111-1111-1111-1111-111111111111',
  'apv22222-2222-2222-2222-222222222222',
  'apv33333-3333-3333-3333-333333333333'
);

-- ─── Tasks ────────────────────────────────────────────────────────────────────
delete from tasks where id in (
  'tsk11111-1111-1111-1111-111111111111',
  'tsk22222-2222-2222-2222-222222222222',
  'tsk33333-3333-3333-3333-333333333333'
);

-- ─── Attribution Touches ──────────────────────────────────────────────────────
delete from attribution_touches where id in (
  'att11111-1111-1111-1111-111111111111',
  'att22222-2222-2222-2222-222222222222'
);

-- ─── Campaigns ────────────────────────────────────────────────────────────────
delete from campaigns where id in (
  'camp-001',
  'camp-002'
);

-- ─── Recon Jobs ───────────────────────────────────────────────────────────────
delete from recon_jobs where id in (
  'rcn33333-3333-3333-3333-333333333333'
);

-- ─── Declined Work Events ────────────────────────────────────────────────────
delete from declined_work_events where id in (
  'dwe33333-3333-3333-3333-333333333333'
);

-- ─── Service Events ───────────────────────────────────────────────────────────
delete from service_events where id in (
  'sev11111-1111-1111-1111-111111111111',
  'sev33333-3333-3333-3333-333333333333'
);

-- ─── Funding Exceptions ───────────────────────────────────────────────────────
delete from funding_exceptions where id in (
  'fex11111-1111-1111-1111-111111111111'
);

-- ─── Deal Document Packages ──────────────────────────────────────────────────
delete from deal_document_packages where id in (
  'ddp11111-1111-1111-1111-111111111111',
  'ddp22222-2222-2222-2222-222222222222'
);

-- ─── F&I Menus ────────────────────────────────────────────────────────────────
delete from fi_menus where id in (
  'fi111111-1111-1111-1111-111111111111'
);

-- ─── Deals ────────────────────────────────────────────────────────────────────
delete from deals where id in (
  'dl111111-1111-1111-1111-111111111111',
  'dl222222-2222-2222-2222-222222222222'
);

-- ─── Lender Decisions ────────────────────────────────────────────────────────
delete from lender_decisions where id in (
  'ld111111-1111-1111-1111-111111111111'
);

-- ─── Credit Apps ─────────────────────────────────────────────────────────────
delete from credit_apps where id in (
  'ca111111-1111-1111-1111-111111111111'
);

-- ─── Quick Apps ──────────────────────────────────────────────────────────────
delete from quick_apps where id in (
  'qa111111-1111-1111-1111-111111111111'
);

-- ─── Quotes ──────────────────────────────────────────────────────────────────
delete from quotes where id in (
  'qt111111-1111-1111-1111-111111111111',
  'qt222222-2222-2222-2222-222222222222'
);

-- ─── Desk Scenarios ──────────────────────────────────────────────────────────
delete from desk_scenarios where id in (
  'dsk11111-1111-1111-1111-111111111111',
  'dsk22222-2222-2222-2222-222222222222'
);

-- ─── Trade Appraisals ────────────────────────────────────────────────────────
delete from trade_appraisals where id in (
  'trd11111-1111-1111-1111-111111111111',
  'trd22222-2222-2222-2222-222222222222'
);

-- ─── Appointments ────────────────────────────────────────────────────────────
delete from appointments where id in (
  'apt11111-1111-1111-1111-111111111111',
  'apt22221-2222-2222-2222-222222222222',
  'apt33331-3333-3333-3333-333333333333'
);

-- ─── Communication Events ────────────────────────────────────────────────────
delete from communication_events where id in (
  'com11111-1111-1111-1111-111111111111',
  'com11112-1111-1111-1111-111111111111',
  'com22221-2222-2222-2222-222222222222',
  'com33331-3333-3333-3333-333333333333'
);

-- ─── Leads ───────────────────────────────────────────────────────────────────
delete from leads where id in (
  'l1111111-1111-1111-1111-111111111111',
  'l2222222-2222-2222-2222-222222222222',
  'l3333333-3333-3333-3333-333333333333'
);

-- ─── Customers ───────────────────────────────────────────────────────────────
delete from customers where id in (
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
);

-- ─── Households ──────────────────────────────────────────────────────────────
delete from households where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- NOTE: inventory_units (inv11111, inv22222, inv33333) and vehicle_catalog_items
-- (vcat1111, vcat2222, vcat3333) are intentionally NOT deleted here.
-- Inventory data is a core operational asset — remove only through the
-- inventory management UI or a separate deliberate migration.
