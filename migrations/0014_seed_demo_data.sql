-- Migration 0014: Seed Demo Data
-- Purpose: Create coherent demo data representing realistic dealership operations
-- Dependencies: 0013 (all triggers established)
--
-- DEMO STORY:
-- - Johnson Family: SUV buyer, completed deal with F&I products, funded with minor exception
-- - Martinez Work Truck: Cash buyer, quick turnaround, delivered
-- - Thompson Sedan: Aging inventory with recon delays, service lane opportunity
-- - Supporting data: campaigns, tasks, approvals, audit trail, sync states, events

-- =============================================================================
-- 1. HOUSEHOLDS
-- =============================================================================

insert into households (id, household_name, household_type, notes, created_at, updated_at) values
  ('11111111-1111-1111-1111-111111111111', 'Johnson Family', 'consumer', 'Young family upgrading from sedan to SUV', now() - interval '45 days', now() - interval '45 days'),
  ('22222222-2222-2222-2222-222222222222', 'Martinez Landscaping', 'business', 'Small business owner, reliable service customer', now() - interval '30 days', now() - interval '30 days'),
  ('33333333-3333-3333-3333-333333333333', 'Thompson Household', 'consumer', 'Longtime customer, vehicle aging, service lane regular', now() - interval '180 days', now() - interval '180 days');

-- =============================================================================
-- 2. CUSTOMERS
-- =============================================================================

insert into customers (id, household_id, first_name, last_name, full_name, email, phone, address, city, state, zip, source, lifecycle_stage, current_vehicle_summary, preferred_contact_method, opt_in_sms, opt_in_email, created_at, updated_at) values
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Sarah', 'Johnson', 'Sarah Johnson', 'sarah.johnson@email.com', '555-0101', '123 Oak Street', 'Springfield', 'IL', '62701', 'website', 'customer', '2018 Honda Accord', 'sms', true, true, now() - interval '45 days', now() - interval '3 days'),
  ('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Carlos', 'Martinez', 'Carlos Martinez', 'carlos@martinezlandscaping.com', '555-0202', '456 Elm Avenue', 'Springfield', 'IL', '62702', 'service_lane', 'customer', '2016 Ford F-150', 'phone', true, true, now() - interval '30 days', now() - interval '5 days'),
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Robert', 'Thompson', 'Robert Thompson', 'rthompson@email.com', '555-0303', '789 Maple Drive', 'Springfield', 'IL', '62703', 'repeat', 'active', '2014 Toyota Camry', 'email', false, true, now() - interval '180 days', now() - interval '7 days');

-- Update households with primary customer
update households set primary_customer_id = 'c1111111-1111-1111-1111-111111111111' where id = '11111111-1111-1111-1111-111111111111';
update households set primary_customer_id = 'c2222222-2222-2222-2222-222222222222' where id = '22222222-2222-2222-2222-222222222222';
update households set primary_customer_id = 'c3333333-3333-3333-3333-333333333333' where id = '33333333-3333-3333-3333-333333333333';

-- =============================================================================
-- 3. LEADS
-- =============================================================================

insert into leads (id, customer_id, household_id, lead_source, source_campaign_id, source_medium, source_detail, intent_type, assigned_to_user_id, assigned_team, status, lead_score, appointment_status, showroom_status, sold_lost_status, created_at, updated_at) values
  ('l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'website', 'camp-001', 'organic_search', 'SUV comparison page', 'purchase', 'user-sales-01', 'sales', 'sold', 85.5, 'completed', 'visited', 'sold', now() - interval '45 days', now() - interval '3 days'),
  ('l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'service_lane', null, 'internal', 'Service advisor referral', 'purchase', 'user-sales-02', 'sales', 'sold', 92.0, 'completed', 'visited', 'sold', now() - interval '30 days', now() - interval '5 days'),
  ('l3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'service_lane', null, 'internal', 'Declined work follow-up', 'research', 'user-sales-01', 'sales', 'working', 68.0, 'none', 'none', 'open', now() - interval '14 days', now() - interval '2 days');

-- =============================================================================
-- 4. COMMUNICATION_EVENTS
-- =============================================================================

insert into communication_events (id, lead_id, customer_id, channel, direction, subject, body, transcript, summary, ai_generated, ai_confidence, consent_checked, created_at) values
  ('com11111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'sms', 'inbound', 'SUV inquiry', 'Hi, I saw your inventory online. Do you have the 2023 Highlander in blue?', null, 'Customer inquired about 2023 Highlander availability, color preference blue', true, 94.5, true, now() - interval '45 days'),
  ('com11112-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'phone', 'outbound', 'Appointment confirmation', null, 'Confirmed test drive appointment for Saturday 10am', 'Confirmed Saturday 10am appointment, customer excited about Highlander', false, null, true, now() - interval '43 days'),
  ('com22221-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'phone', 'inbound', 'Work truck need', null, 'Service advisor connected customer to sales for F-150 replacement discussion', 'Customer needs F-150 replacement, current truck at 180k miles, business use', true, 88.2, true, now() - interval '30 days'),
  ('com33331-3333-3333-3333-333333333333', 'l3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'email', 'outbound', 'Trade-in opportunity', 'Hi Robert, based on your recent service visit, we wanted to reach out about trade-in options for your 2014 Camry.', null, 'Outbound trade-in opportunity email following service visit with declined work', false, null, true, now() - interval '14 days');

-- =============================================================================
-- 5. APPOINTMENTS
-- =============================================================================

insert into appointments (id, lead_id, customer_id, appointment_type, scheduled_for, status, assigned_user_id, notes, show_result, created_at, updated_at) values
  ('apt11111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'test_drive', now() - interval '42 days', 'completed', 'user-sales-01', 'Family interested in third-row seating', 'showed', now() - interval '43 days', now() - interval '42 days'),
  ('apt22221-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'appraisal', now() - interval '28 days', 'completed', 'user-sales-02', 'Business customer needs payload specs', 'showed', now() - interval '29 days', now() - interval '28 days'),
  ('apt33331-3333-3333-3333-333333333333', 'l3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'trade_appraisal', now() + interval '3 days', 'scheduled', 'user-sales-01', 'Follow-up from service lane', null, now() - interval '2 days', now() - interval '2 days');

-- =============================================================================
-- 6. VEHICLE_CATALOG_ITEMS
-- =============================================================================

insert into vehicle_catalog_items (id, year, make, model, trim, package_data, powertrain, body_style, segment, competitive_set, ownership_notes, created_at, updated_at) values
  ('vcat1111-1111-1111-1111-111111111111', 2023, 'Toyota', 'Highlander', 'XLE', '{"packages": ["Convenience Package", "Weather Package"]}', 'Hybrid', 'SUV', 'Midsize SUV', '["Honda Pilot", "Mazda CX-9", "Nissan Pathfinder"]', 'Strong family vehicle, hybrid powertrain popular', now() - interval '90 days', now() - interval '90 days'),
  ('vcat2222-2222-2222-2222-222222222222', 2023, 'Ford', 'F-150', 'XLT', '{"packages": ["Heavy Duty Payload Package", "Max Trailer Tow Package"]}', 'V6 EcoBoost', 'Pickup', 'Full-Size Truck', '["Chevrolet Silverado", "Ram 1500"]', 'Commercial fleet favorite, best-in-class towing', now() - interval '90 days', now() - interval '90 days'),
  ('vcat3333-3333-3333-3333-333333333333', 2019, 'Honda', 'Accord', 'Sport', '{}', 'I4 Turbo', 'Sedan', 'Midsize Sedan', '["Toyota Camry", "Mazda6", "Nissan Altima"]', 'Sporty trim, good reliability scores', now() - interval '180 days', now() - interval '180 days');

-- =============================================================================
-- 7. INVENTORY_UNITS
-- =============================================================================

insert into inventory_units (id, vin, stock_number, year, make, model, trim, mileage, vehicle_catalog_item_id, unit_type, acquisition_source, acquisition_cost, reconditioning_cost, total_cost_basis, list_price, sale_price, status, days_in_stock, location, created_at, updated_at) values
  ('inv11111-1111-1111-1111-111111111111', '5TDJZRFH7PS123456', 'H23001', 2023, 'Toyota', 'Highlander', 'XLE', 12, 'vcat1111-1111-1111-1111-111111111111', 'retail_vehicle', 'manufacturer', 42500.00, 800.00, 43300.00, 48995.00, 46500.00, 'sold', 18, 'lot_a', now() - interval '50 days', now() - interval '3 days'),
  ('inv22222-2222-2222-2222-222222222222', '1FTFW1E50PFA12345', 'F23045', 2023, 'Ford', 'F-150', 'XLT', 8, 'vcat2222-2222-2222-2222-222222222222', 'retail_vehicle', 'manufacturer', 38000.00, 500.00, 38500.00, 44995.00, 43200.00, 'sold', 12, 'lot_b', now() - interval '35 days', now() - interval '5 days'),
  ('inv33333-3333-3333-3333-333333333333', '1HGCV1F39KA123456', 'U19088', 2019, 'Honda', 'Accord', 'Sport', 48200, 'vcat3333-3333-3333-3333-333333333333', 'retail_vehicle', 'trade_in', 14500.00, 2200.00, 16700.00, 21995.00, 21995.00, 'recon', 87, 'service_bay', now() - interval '87 days', now() - interval '2 days');

-- =============================================================================
-- 8. TRADE_APPRAISALS
-- =============================================================================

insert into trade_appraisals (id, lead_id, customer_id, inventory_unit_id, vin, year, make, model, trim, mileage, condition_notes, appraisal_value, recon_estimate, market_exit_value, valuation_explanation, appraised_by_user_id, manager_approved, manager_approved_by_user_id, created_at, updated_at) values
  ('trd11111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', null, '1HGCV1F45JA098765', 2018, 'Honda', 'Accord', 'LX', 62000, 'Good condition, minor door dings, clean interior', 15500.00, 1200.00, 16800.00, 'Clean Carfax, one owner, market strong for Accords', 'user-sales-01', true, 'user-mgr-01', now() - interval '40 days', now() - interval '40 days'),
  ('trd22222-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', null, '1FTFW1E85GFC56789', 2016, 'Ford', 'F-150', 'XLT', 180000, 'Heavy commercial use, bed liner worn, mechanical sound', 12000.00, 2500.00, 14200.00, 'High miles but maintained, work truck market buyer available', 'user-sales-02', true, 'user-mgr-02', now() - interval '28 days', now() - interval '28 days');

-- =============================================================================
-- 9. DESK_SCENARIOS
-- =============================================================================

insert into desk_scenarios (id, lead_id, customer_id, inventory_unit_id, trade_appraisal_id, scenario_type, sale_price, down_payment, trade_value, payoff, taxes, fees, term_months, apr, monthly_payment, incentive_snapshot, front_gross_estimate, payment_explanation, customer_summary, presented_by_user_id, created_at, updated_at) values
  ('dsk11111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'inv11111-1111-1111-1111-111111111111', 'trd11111-1111-1111-1111-111111111111', 'finance', 46500.00, 3000.00, 15500.00, 12800.00, 2558.00, 495.00, 72, 5.49, 512.00, '{"manufacturer_rebate": 1000, "loyalty_bonus": 500}', 3200.00, 'Payment includes tax, title, doc fee. 72 months at 5.49% APR with approved credit.', 'Family loves the Highlander, comfortable with payment, approved at preferred tier', 'user-sales-01', now() - interval '38 days', now() - interval '38 days'),
  ('dsk22222-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'inv22222-2222-2222-2222-222222222222', 'trd22222-2222-2222-2222-222222222222', 'cash', 43200.00, 43200.00, 12000.00, 0.00, 2376.00, 350.00, 0, 0.00, 0.00, '{"commercial_discount": 800}', 4500.00, 'Cash purchase, no financing needed. Commercial discount applied.', 'Business customer, cash buyer, needs truck immediately for spring season', 'user-sales-02', now() - interval '27 days', now() - interval '27 days');

-- =============================================================================
-- 10. QUOTES
-- =============================================================================

insert into quotes (id, lead_id, customer_id, desk_scenario_id, quote_type, quote_amount, explanation, status, sent_channel, accepted_at, created_at, updated_at) values
  ('qt111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'dsk11111-1111-1111-1111-111111111111', 'finance', 512.00, 'Monthly payment for 72 months including all taxes and fees', 'accepted', 'sms', now() - interval '35 days', now() - interval '37 days', now() - interval '35 days'),
  ('qt222222-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'dsk22222-2222-2222-2222-222222222222', 'cash', 33926.00, 'Net cash price after trade and commercial discount', 'accepted', 'email', now() - interval '26 days', now() - interval '27 days', now() - interval '26 days');

-- =============================================================================
-- 11. QUICK_APPS
-- =============================================================================

insert into quick_apps (id, lead_id, customer_id, consent_version, identity_status, status, routed_to_connector, connector_name, created_at, updated_at) values
  ('qa111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'v1.2', 'verified', 'completed', true, 'RouteOne', now() - interval '39 days', now() - interval '38 days');

-- =============================================================================
-- 12. CREDIT_APPS
-- =============================================================================

insert into credit_apps (id, lead_id, customer_id, quick_app_id, finance_connector, status, consent_version, sensitive_data_token_ref, created_at, updated_at) values
  ('ca111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'qa111111-1111-1111-1111-111111111111', 'RouteOne', 'approved', 'v1.2', 'token_encrypted_abc123xyz', now() - interval '38 days', now() - interval '35 days');

-- =============================================================================
-- 13. LENDER_DECISIONS
-- =============================================================================

insert into lender_decisions (id, credit_app_id, lender_name, decision_status, approval_terms_json, stip_status, missing_items_json, confidence_notes, created_at, updated_at) values
  ('ld111111-1111-1111-1111-111111111111', 'ca111111-1111-1111-1111-111111111111', 'Toyota Financial Services', 'approved', '{"amount": 30000, "term": 72, "apr": 5.49, "tier": "A"}', 'received', '[]', 'Tier A approval, all stips received, ready to fund', now() - interval '35 days', now() - interval '10 days');

-- =============================================================================
-- 14. DEALS
-- =============================================================================

insert into deals (id, lead_id, customer_id, inventory_unit_id, trade_appraisal_id, desk_scenario_id, credit_app_id, lender_decision_id, fi_menu_id, status, funded_status, funding_exception_count, front_gross_actual, back_gross_actual, sold_at, delivered_at, created_at, updated_at) values
  ('dl111111-1111-1111-1111-111111111111', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'inv11111-1111-1111-1111-111111111111', 'trd11111-1111-1111-1111-111111111111', 'dsk11111-1111-1111-1111-111111111111', 'ca111111-1111-1111-1111-111111111111', 'ld111111-1111-1111-1111-111111111111', 'fi111111-1111-1111-1111-111111111111', 'delivered', 'funded', 1, 3200.00, 2850.00, now() - interval '34 days', now() - interval '3 days', now() - interval '34 days', now() - interval '3 days'),
  ('dl222222-2222-2222-2222-222222222222', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'inv22222-2222-2222-2222-222222222222', 'trd22222-2222-2222-2222-222222222222', 'dsk22222-2222-2222-2222-222222222222', null, null, null, 'delivered', 'not_applicable', 0, 4500.00, 0.00, now() - interval '25 days', now() - interval '5 days', now() - interval '25 days', now() - interval '5 days');

-- =============================================================================
-- 15. FI_MENUS
-- =============================================================================

insert into fi_menus (id, deal_id, lender_decision_id, reserve_amount, vsc_selected, gap_selected, ancillary_products_json, menu_presented_at, accepted_products_json, created_at, updated_at) values
  ('fi111111-1111-1111-1111-111111111111', 'dl111111-1111-1111-1111-111111111111', 'ld111111-1111-1111-1111-111111111111', 1200.00, true, true, '[{"name": "Tire & Wheel Protection", "price": 895}, {"name": "Paint Protection", "price": 1295}]', now() - interval '32 days', '[{"name": "VSC", "price": 2495}, {"name": "GAP", "price": 695}, {"name": "Tire & Wheel Protection", "price": 895}]', now() - interval '32 days', now() - interval '32 days');

-- Update deals with F&I menu reference
update deals set fi_menu_id = 'fi111111-1111-1111-1111-111111111111' where id = 'dl111111-1111-1111-1111-111111111111';

-- =============================================================================
-- 16. DEAL_DOCUMENT_PACKAGES
-- =============================================================================

insert into deal_document_packages (id, deal_id, status, signed_at, missing_docs_json, created_at, updated_at) values
  ('ddp11111-1111-1111-1111-111111111111', 'dl111111-1111-1111-1111-111111111111', 'complete', now() - interval '30 days', '[]', now() - interval '31 days', now() - interval '10 days'),
  ('ddp22222-2222-2222-2222-222222222222', 'dl222222-2222-2222-2222-222222222222', 'complete', now() - interval '24 days', '[]', now() - interval '25 days', now() - interval '5 days');

-- =============================================================================
-- 17. FUNDING_EXCEPTIONS
-- =============================================================================

insert into funding_exceptions (id, deal_id, lender_decision_id, exception_type, severity, description, resolved, resolved_at, assigned_to_user_id, created_at, updated_at) values
  ('fex11111-1111-1111-1111-111111111111', 'dl111111-1111-1111-1111-111111111111', 'ld111111-1111-1111-1111-111111111111', 'missing_stip', 'medium', 'Proof of insurance missing from funding package', true, now() - interval '10 days', 'user-funding-01', now() - interval '15 days', now() - interval '10 days');

-- =============================================================================
-- 18. SERVICE_EVENTS
-- =============================================================================

insert into service_events (id, customer_id, household_id, vehicle_vin, repair_order_number, advisor_user_id, visit_type, total_ro_amount, retention_stage, next_service_due, created_at, updated_at) values
  ('sev11111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '1FTFW1E85GFC56789', 'RO-2023-05678', 'user-service-01', 'maintenance', 425.00, 'loyal', now() + interval '90 days', now() - interval '120 days', now() - interval '120 days'),
  ('sev33333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '2T2BK1BA5EC123456', 'RO-2024-01234', 'user-service-02', 'repair', 2850.00, 'at_risk', now() + interval '30 days', now() - interval '15 days', now() - interval '15 days');

-- =============================================================================
-- 19. DECLINED_WORK_EVENTS
-- =============================================================================

insert into declined_work_events (id, service_event_id, customer_id, vehicle_vin, declined_work_amount, declined_work_reason, follow_up_status, sales_opportunity_flag, created_at, updated_at) values
  ('dwe33333-3333-3333-3333-333333333333', 'sev33333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '2T2BK1BA5EC123456', 1850.00, 'Customer declined transmission service and brake replacement due to cost', 'contacted', true, now() - interval '15 days', now() - interval '14 days');

-- =============================================================================
-- 20. RECON_JOBS
-- =============================================================================

insert into recon_jobs (id, inventory_unit_id, stage, vendor, estimated_cost, actual_cost, started_at, ready_at, bottleneck_reason, manager_alerted, created_at, updated_at) values
  ('rcn33333-3333-3333-3333-333333333333', 'inv33333-3333-3333-3333-333333333333', 'body_shop', 'Premier Auto Body', 1800.00, null, now() - interval '45 days', null, 'Parts on backorder from supplier, ETA 2 weeks', true, now() - interval '60 days', now() - interval '2 days');

-- =============================================================================
-- 21. CAMPAIGNS
-- =============================================================================

insert into campaigns (id, name, channel, objective, spend, start_date, end_date, status, attribution_model, created_at, updated_at) values
  ('camp-001', 'Spring SUV Event', 'digital', 'Drive SUV test drives and sales', 5000.00, (now() - interval '60 days')::date, (now() - interval '15 days')::date, 'completed', 'first_touch', now() - interval '65 days', now() - interval '15 days'),
  ('camp-002', 'Service Lane Conquest', 'internal', 'Convert service customers to sales leads', 0.00, (now() - interval '90 days')::date, (now() + interval '90 days')::date, 'active', 'last_touch', now() - interval '90 days', now() - interval '1 day');

-- =============================================================================
-- 22. ATTRIBUTION_TOUCHES
-- =============================================================================

insert into attribution_touches (id, campaign_id, lead_id, customer_id, touch_type, touch_timestamp, value_weight, metadata_json, created_at) values
  ('att11111-1111-1111-1111-111111111111', 'camp-001', 'l1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'ad_click', now() - interval '46 days', 1.0, '{"ad_creative": "Family SUV Safety", "platform": "Google Ads"}', now() - interval '46 days'),
  ('att22222-2222-2222-2222-222222222222', 'camp-002', 'l2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'internal_referral', now() - interval '30 days', 1.0, '{"referrer": "service_advisor", "referrer_id": "user-service-01"}', now() - interval '30 days');

-- =============================================================================
-- 23. TASKS
-- =============================================================================

insert into tasks (id, linked_object_type, linked_object_id, queue_type, title, description, priority, assigned_to_user_id, assigned_team, status, due_at, created_by_user_id, created_by_agent, created_at, updated_at) values
  ('tsk11111-1111-1111-1111-111111111111', 'deal', 'dl111111-1111-1111-1111-111111111111', 'funding', 'Submit funding package to TFS', 'All documents signed, ready for lender submission', 'high', 'user-funding-01', 'funding', 'completed', now() - interval '20 days', 'user-sales-01', null, now() - interval '30 days', now() - interval '15 days'),
  ('tsk22222-2222-2222-2222-222222222222', 'inventory_unit', 'inv33333-3333-3333-3333-333333333333', 'recon', 'Expedite body shop work for aging unit', 'Unit at 87 days, body shop backorder holding up recon', 'high', 'user-recon-01', 'recon', 'open', now() + interval '3 days', 'user-mgr-01', null, now() - interval '5 days', now() - interval '2 days'),
  ('tsk33333-3333-3333-3333-333333333333', 'lead', 'l3333333-3333-3333-3333-333333333333', 'sales', 'Follow up on trade appraisal appointment', 'Appointment scheduled for 3 days out, confirm attendance', 'medium', 'user-sales-01', 'sales', 'open', now() + interval '2 days', null, 'ai_agent_followup', now() - interval '2 days', now() - interval '2 days');

-- =============================================================================
-- 24. APPROVALS
-- =============================================================================

insert into approvals (id, object_type, object_id, approval_type, status, requested_by_user_id, requested_by_agent, approver_user_id, approved_at, denied_at, notes, created_at, updated_at) values
  ('apv11111-1111-1111-1111-111111111111', 'trade_appraisal', 'trd11111-1111-1111-1111-111111111111', 'trade_value', 'approved', 'user-sales-01', null, 'user-mgr-01', now() - interval '40 days', null, 'Trade value within acceptable ACV range', now() - interval '40 days', now() - interval '40 days'),
  ('apv22222-2222-2222-2222-222222222222', 'trade_appraisal', 'trd22222-2222-2222-2222-222222222222', 'trade_value', 'approved', 'user-sales-02', null, 'user-mgr-02', now() - interval '28 days', null, 'High mileage but work truck market strong', now() - interval '28 days', now() - interval '28 days'),
  ('apv33333-3333-3333-3333-333333333333', 'deal', 'dl111111-1111-1111-1111-111111111111', 'discount', 'approved', 'user-sales-01', null, 'user-mgr-01', now() - interval '35 days', null, 'Additional discount approved to close deal same day', now() - interval '35 days', now() - interval '35 days');

-- =============================================================================
-- 25. AUDIT_LOGS
-- =============================================================================

insert into audit_logs (id, actor_type, actor_id, action, object_type, object_id, before_json, after_json, confidence_score, requires_review, created_at) values
  ('aud11111-1111-1111-1111-111111111111', 'user', 'user-sales-01', 'created', 'lead', 'l1111111-1111-1111-1111-111111111111', null, '{"status": "new", "lead_source": "website"}', null, false, now() - interval '45 days'),
  ('aud11112-1111-1111-1111-111111111111', 'user', 'user-sales-01', 'updated', 'lead', 'l1111111-1111-1111-1111-111111111111', '{"status": "new"}', '{"status": "working"}', null, false, now() - interval '43 days'),
  ('aud11113-1111-1111-1111-111111111111', 'user', 'user-sales-01', 'updated', 'lead', 'l1111111-1111-1111-1111-111111111111', '{"status": "working"}', '{"status": "sold"}', null, false, now() - interval '34 days'),
  ('aud22221-2222-2222-2222-222222222222', 'user', 'user-sales-02', 'created', 'deal', 'dl222222-2222-2222-2222-222222222222', null, '{"status": "open", "customer_id": "c2222222-2222-2222-2222-222222222222"}', null, false, now() - interval '25 days'),
  ('aud33331-3333-3333-3333-333333333333', 'agent', 'ai_agent_followup', 'created', 'task', 'tsk33333-3333-3333-3333-333333333333', null, '{"title": "Follow up on trade appraisal appointment", "priority": "medium"}', 92.5, false, now() - interval '2 days');

-- =============================================================================
-- 26. INTEGRATION_SYNC_STATES
-- =============================================================================

insert into integration_sync_states (id, object_type, object_id, source_system, source_record_id, target_system, target_record_id, sync_status, sync_error, last_synced_at, created_at, updated_at) values
  ('sync1111-1111-1111-1111-111111111111', 'deal', 'dl111111-1111-1111-1111-111111111111', 'outcome_dealer', 'dl111111-1111-1111-1111-111111111111', 'CDK_DMS', 'CDK-DEAL-789012', 'synced', null, now() - interval '3 days', now() - interval '34 days', now() - interval '3 days'),
  ('sync2222-2222-2222-2222-222222222222', 'deal', 'dl222222-2222-2222-2222-222222222222', 'outcome_dealer', 'dl222222-2222-2222-2222-222222222222', 'CDK_DMS', 'CDK-DEAL-789013', 'synced', null, now() - interval '5 days', now() - interval '25 days', now() - interval '5 days'),
  ('sync3333-3333-3333-3333-333333333333', 'credit_app', 'ca111111-1111-1111-1111-111111111111', 'outcome_dealer', 'ca111111-1111-1111-1111-111111111111', 'RouteOne', 'R1-APP-456789', 'synced', null, now() - interval '35 days', now() - interval '38 days', now() - interval '35 days'),
  ('sync4444-4444-4444-4444-444444444444', 'inventory_unit', 'inv33333-3333-3333-3333-333333333333', 'outcome_dealer', 'inv33333-3333-3333-3333-333333333333', 'vAuto', 'VAUTO-12345', 'error', 'Connection timeout to vAuto API', now() - interval '7 days', now() - interval '87 days', now() - interval '1 day');

-- =============================================================================
-- 27. EVENT_BUS
-- =============================================================================

insert into event_bus (id, event_name, object_type, object_id, payload, published_by_user_id, published_by_agent, status, attempts, last_error, created_at, processed_at) values
  ('evt11111-1111-1111-1111-111111111111', 'deal.created', 'deal', 'dl111111-1111-1111-1111-111111111111', '{"deal_id": "dl111111-1111-1111-1111-111111111111", "customer_name": "Sarah Johnson", "vehicle": "2023 Toyota Highlander"}', 'user-sales-01', null, 'processed', 1, null, now() - interval '34 days', now() - interval '34 days'),
  ('evt11112-1111-1111-1111-111111111111', 'deal.funded', 'deal', 'dl111111-1111-1111-1111-111111111111', '{"deal_id": "dl111111-1111-1111-1111-111111111111", "funded_amount": 30000, "lender": "Toyota Financial Services"}', 'user-funding-01', null, 'processed', 1, null, now() - interval '15 days', now() - interval '15 days'),
  ('evt22221-2222-2222-2222-222222222222', 'deal.delivered', 'deal', 'dl222222-2222-2222-2222-222222222222', '{"deal_id": "dl222222-2222-2222-2222-222222222222", "customer_name": "Carlos Martinez", "vehicle": "2023 Ford F-150"}', 'user-sales-02', null, 'processed', 1, null, now() - interval '5 days', now() - interval '5 days'),
  ('evt33331-3333-3333-3333-333333333333', 'task.assigned', 'task', 'tsk33333-3333-3333-3333-333333333333', '{"task_id": "tsk33333-3333-3333-3333-333333333333", "assigned_to": "user-sales-01", "due_date": "in 2 days"}', null, 'ai_agent_followup', 'processed', 1, null, now() - interval '2 days', now() - interval '2 days'),
  ('evt44441-4444-4444-4444-444444444444', 'recon.delayed', 'inventory_unit', 'inv33333-3333-3333-3333-333333333333', '{"inventory_unit_id": "inv33333-3333-3333-3333-333333333333", "days_in_stock": 87, "bottleneck": "Parts on backorder"}', 'user-recon-01', null, 'processed', 1, null, now() - interval '2 days', now() - interval '2 days'),
  ('evt55551-5555-5555-5555-555555555555', 'sync.failed', 'inventory_unit', 'inv33333-3333-3333-3333-333333333333', '{"object_id": "inv33333-3333-3333-3333-333333333333", "target_system": "vAuto", "error": "Connection timeout"}', null, 'sync_service', 'pending', 3, 'Connection timeout to vAuto API after 3 attempts', now() - interval '1 day', null);

-- =============================================================================
-- SEED DATA COMPLETE
-- =============================================================================
-- This seed data represents a coherent dealership story:
-- 
-- 1. Johnson Family (SUV Buyer): 
--    - Complete deal lifecycle from lead → test drive → financing → F&I → funding → delivery
--    - One minor funding exception (resolved)
--    - Strong attribution from digital campaign
-- 
-- 2. Martinez Landscaping (Work Truck Buyer):
--    - Service lane conquest lead
--    - Cash purchase, quick turnaround
--    - Clean delivery, no complications
-- 
-- 3. Thompson Household (Service Lane Opportunity):
--    - Longtime customer with aging vehicle
--    - Declined expensive service work
--    - Sales follow-up in progress with scheduled trade appraisal
--    - Aging trade-in unit stuck in recon with parts backorder
-- 
-- Supporting Infrastructure:
--    - Marketing campaigns driving attribution
--    - Task queue with AI-generated follow-ups
--    - Manager approvals for trade values and discounts
--    - Complete audit trail of state changes
--    - Integration sync states (one with error condition)
--    - Event bus capturing system activity
