-- Migration 0012: Create Indexes
-- Purpose: Add comprehensive lookup indexes for query performance optimization
-- Dependencies: 0011 (all foreign keys now established)
--
-- This migration creates indexes on foreign key columns, status fields,
-- lookup keys (VIN, stock_number), and polymorphic reference fields.

-- =============================================================================
-- CUSTOMERS: Foreign Key Lookups
-- =============================================================================

create index idx_customers_household_id on customers(household_id);

-- =============================================================================
-- LEADS: Foreign Keys and Status Filtering
-- =============================================================================

create index idx_leads_customer_id on leads(customer_id);
create index idx_leads_assigned_to_user_id on leads(assigned_to_user_id);
create index idx_leads_status on leads(status);

-- =============================================================================
-- COMMUNICATION_EVENTS: Foreign Key Lookups
-- =============================================================================

create index idx_communication_events_lead_id on communication_events(lead_id);

-- =============================================================================
-- APPOINTMENTS: Foreign Key Lookups
-- =============================================================================

create index idx_appointments_lead_id on appointments(lead_id);

-- =============================================================================
-- INVENTORY_UNITS: Unique Identifiers and Stock Lookups
-- =============================================================================

create index idx_inventory_units_vin on inventory_units(vin);
create index idx_inventory_units_stock_number on inventory_units(stock_number);

-- =============================================================================
-- TRADE_APPRAISALS: Foreign Key Lookups
-- =============================================================================

create index idx_trade_appraisals_lead_id on trade_appraisals(lead_id);

-- =============================================================================
-- DESK_SCENARIOS: Foreign Key Lookups
-- =============================================================================

create index idx_desk_scenarios_lead_id on desk_scenarios(lead_id);

-- =============================================================================
-- QUOTES: Foreign Key Lookups
-- =============================================================================

create index idx_quotes_lead_id on quotes(lead_id);

-- =============================================================================
-- CREDIT_APPS: Foreign Key Lookups
-- =============================================================================

create index idx_credit_apps_lead_id on credit_apps(lead_id);

-- =============================================================================
-- LENDER_DECISIONS: Foreign Key Lookups
-- =============================================================================

create index idx_lender_decisions_credit_app_id on lender_decisions(credit_app_id);

-- =============================================================================
-- DEALS: Foreign Key Lookups
-- =============================================================================

create index idx_deals_lead_id on deals(lead_id);

-- =============================================================================
-- SERVICE_EVENTS: Foreign Key Lookups
-- =============================================================================

create index idx_service_events_customer_id on service_events(customer_id);

-- =============================================================================
-- RECON_JOBS: Foreign Key Lookups
-- =============================================================================

create index idx_recon_jobs_inventory_unit_id on recon_jobs(inventory_unit_id);

-- =============================================================================
-- TASKS: Polymorphic Lookups and Assignment
-- =============================================================================

create index idx_tasks_linked_object on tasks(linked_object_type, linked_object_id);
create index idx_tasks_assigned_to_user_id on tasks(assigned_to_user_id);

-- =============================================================================
-- APPROVALS: Polymorphic Lookups
-- =============================================================================

create index idx_approvals_object on approvals(object_type, object_id);

-- =============================================================================
-- AUDIT_LOGS: Polymorphic Lookups
-- =============================================================================

create index idx_audit_logs_object on audit_logs(object_type, object_id);

-- =============================================================================
-- EVENT_BUS: Status and Event Name Filtering
-- =============================================================================

create index idx_event_bus_status on event_bus(status);
create index idx_event_bus_event_name on event_bus(event_name);

-- =============================================================================
-- INTEGRATION_SYNC_STATES: Polymorphic Lookups
-- =============================================================================

create index idx_integration_sync_states_object on integration_sync_states(object_type, object_id);

-- Note: These indexes significantly improve query performance for foreign key joins,
-- status filtering, polymorphic lookups, and unique identifier searches.
