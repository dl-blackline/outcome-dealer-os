-- Migration 0013: Create Updated_At Triggers
-- Purpose: Automatically maintain updated_at timestamps on all tables
-- Dependencies: 0012 (indexes complete)
--
-- This migration creates a reusable trigger function and attaches it to every table
-- with an updated_at column to ensure timestamps are automatically maintained.

-- =============================================================================
-- TRIGGER FUNCTION: set_updated_at()
-- =============================================================================
-- Reusable function that sets updated_at to current timestamp on row update

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- ATTACH TRIGGERS TO ALL TABLES WITH UPDATED_AT
-- =============================================================================

-- Households and Customers
create trigger trigger_households_updated_at
  before update on households
  for each row
  execute function set_updated_at();

create trigger trigger_customers_updated_at
  before update on customers
  for each row
  execute function set_updated_at();

-- Leads and Communications
create trigger trigger_leads_updated_at
  before update on leads
  for each row
  execute function set_updated_at();

create trigger trigger_communication_events_updated_at
  before update on communication_events
  for each row
  execute function set_updated_at();

-- Appointments
create trigger trigger_appointments_updated_at
  before update on appointments
  for each row
  execute function set_updated_at();

-- Vehicle Catalog and Inventory
create trigger trigger_vehicle_catalog_items_updated_at
  before update on vehicle_catalog_items
  for each row
  execute function set_updated_at();

create trigger trigger_inventory_units_updated_at
  before update on inventory_units
  for each row
  execute function set_updated_at();

-- Trade Appraisals and Desk Scenarios
create trigger trigger_trade_appraisals_updated_at
  before update on trade_appraisals
  for each row
  execute function set_updated_at();

create trigger trigger_desk_scenarios_updated_at
  before update on desk_scenarios
  for each row
  execute function set_updated_at();

-- Quotes and Finance Apps
create trigger trigger_quotes_updated_at
  before update on quotes
  for each row
  execute function set_updated_at();

create trigger trigger_quick_apps_updated_at
  before update on quick_apps
  for each row
  execute function set_updated_at();

create trigger trigger_credit_apps_updated_at
  before update on credit_apps
  for each row
  execute function set_updated_at();

-- Lender Decisions and F&I
create trigger trigger_lender_decisions_updated_at
  before update on lender_decisions
  for each row
  execute function set_updated_at();

create trigger trigger_fi_menus_updated_at
  before update on fi_menus
  for each row
  execute function set_updated_at();

-- Deals
create trigger trigger_deals_updated_at
  before update on deals
  for each row
  execute function set_updated_at();

-- Deal Documents and Funding
create trigger trigger_deal_document_packages_updated_at
  before update on deal_document_packages
  for each row
  execute function set_updated_at();

create trigger trigger_funding_exceptions_updated_at
  before update on funding_exceptions
  for each row
  execute function set_updated_at();

-- Service and Recon
create trigger trigger_service_events_updated_at
  before update on service_events
  for each row
  execute function set_updated_at();

create trigger trigger_declined_work_events_updated_at
  before update on declined_work_events
  for each row
  execute function set_updated_at();

create trigger trigger_recon_jobs_updated_at
  before update on recon_jobs
  for each row
  execute function set_updated_at();

-- Marketing and Tasks
create trigger trigger_campaigns_updated_at
  before update on campaigns
  for each row
  execute function set_updated_at();

create trigger trigger_tasks_updated_at
  before update on tasks
  for each row
  execute function set_updated_at();

-- Approvals and Integration Sync
create trigger trigger_approvals_updated_at
  before update on approvals
  for each row
  execute function set_updated_at();

create trigger trigger_integration_sync_states_updated_at
  before update on integration_sync_states
  for each row
  execute function set_updated_at();

-- Note: audit_logs and event_bus are intentionally immutable and do not have updated_at columns.
-- attribution_touches and showroom_visits also do not have updated_at columns.
