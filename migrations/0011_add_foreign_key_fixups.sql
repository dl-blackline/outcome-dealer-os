-- Migration 0011: Add Foreign Key Fixups
-- Purpose: Resolve circular dependencies by adding deferred foreign key constraints
-- Dependencies: 0010 (all base tables now exist)
-- 
-- This migration finalizes the relational integrity by adding FK constraints
-- that were intentionally omitted in earlier migrations to avoid circular dependencies.

-- =============================================================================
-- HOUSEHOLDS.PRIMARY_CUSTOMER_ID → CUSTOMERS.ID
-- =============================================================================
-- Add foreign key from households to customers for primary customer designation
-- Uses SET NULL to preserve household record if primary customer is deleted

alter table households
  add constraint fk_households_primary_customer
  foreign key (primary_customer_id)
  references customers(id)
  on delete set null;

-- =============================================================================
-- FI_MENUS.DEAL_ID → DEALS.ID
-- =============================================================================
-- Add foreign key from F&I menus to deals
-- Uses CASCADE to remove F&I menu if deal is deleted

alter table fi_menus
  add constraint fk_fi_menus_deal
  foreign key (deal_id)
  references deals(id)
  on delete cascade;

-- =============================================================================
-- DEALS.FI_MENU_ID → FI_MENUS.ID
-- =============================================================================
-- Add foreign key from deals to F&I menus for bidirectional relationship
-- Uses SET NULL to preserve deal record if F&I menu is deleted

alter table deals
  add constraint fk_deals_fi_menu
  foreign key (fi_menu_id)
  references fi_menus(id)
  on delete set null;

-- Note: These three constraints complete the relational integrity model.
-- All other foreign keys were established in migrations 0002-0010.
