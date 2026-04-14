# Outcome Dealer OS Copilot Prompt Pack — Phase 6

This folder contains the **Phase 6** prompt pack for Outcome Dealer OS.

Phase 5 established the buyer-hub shell and customer-facing route structure. The biggest remaining gap is that the buyer hub is still largely powered by mock inventory and placeholder customer flows.

Phase 6 is about turning the buyer hub into a **real conversion-capable customer platform** tied directly to the internal OS.

## Run order

1. `51_phase6_truth_and_inventory_feed_plan.md`
2. `52_inventory_csv_ingest_and_media_pipeline.md`
3. `53_public_inventory_runtime_and_vehicle_gallery.md`
4. `54_buyer_hub_runtime_search_favorites_and_compare.md`
5. `55_customer_inquiry_quick_app_trade_and_appointment_capture.md`
6. `56_customer_identity_next_steps_and_return_flow.md`
7. `57_products_services_finance_and_protection_surfaces.md`
8. `58_customer_to_internal_workstation_and_automation_bridge.md`
9. `59_conversion_telemetry_funnel_and_ops_reporting.md`
10. `60_phase6_hardening_import_review_and_release_prep.md`
11. `99_master_run_order_prompt_phase6.md`

## Phase 6 outcomes

By the end of this sequence, Outcome Dealer OS should have:

- a truthful runtime plan for the buyer hub
- an inventory import path prepared for CSV + photo assets
- a runtime-backed public inventory and vehicle detail experience
- real capture flows for inquiry, quick app, trade-in, and appointment requests
- customer return-state and next-steps continuity
- products/services/finance content surfaces that support conversion
- a bridge from customer activity into internal records, events, and workstation execution
- conversion telemetry and reporting that show what the buyer hub is producing
- stronger release readiness for the customer-facing side

## Notes

- Keep Outcome Dealer OS as one unified platform.
- Do not build the buyer hub as a disconnected marketing site.
- The inventory CSV + photos workflow is a first-class concern in this phase.
- Preserve canonical object continuity between customer-facing and staff-facing layers.
