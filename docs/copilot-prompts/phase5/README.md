# Outcome Dealer OS Copilot Prompt Pack — Phase 5

This folder contains the **Phase 5** prompt pack for Outcome Dealer OS.

Phase 4 should make the internal OS more runtime-trustworthy. Phase 5 expands Outcome Dealer OS into the **customer-facing buyer hub**: the conversion surface where shoppers browse units, estimate payments, inquire, start finance, submit trade information, request appointments, and track next steps.

## Run order

1. `41_customer_buyer_hub_foundation.md`
2. `42_public_inventory_and_search_surface.md`
3. `43_vehicle_detail_page_payment_and_inquiry.md`
4. `44_favorites_compare_and_saved_shopping_state.md`
5. `45_finance_products_and_affordability_tools.md`
6. `46_quick_app_and_customer_inquiry_capture.md`
7. `47_trade_in_and_appointment_request_flows.md`
8. `48_customer_next_steps_portal_and_status_tracking.md`
9. `49_customer_to_internal_os_event_and_workstation_bridge.md`
10. `50_phase5_hardening_conversion_telemetry_and_release_prep.md`
11. `99_master_run_order_prompt_phase5.md`

## Phase 5 outcomes

By the end of this sequence, Outcome Dealer OS should have:

- a clear customer-facing buyer hub architecture
- public inventory browse and unit detail surfaces
- inquiry, finance, trade, and appointment entry flows
- save/favorite/compare shopping utilities
- customer-facing progress and next-step visibility
- customer-side event tracking mapped into internal records and workstation execution
- a believable buyer conversion funnel that connects directly into the internal OS

## Notes

- Keep Outcome Dealer OS as one unified platform.
- Do not build the buyer hub as a disconnected marketing site.
- Preserve canonical object continuity between customer-facing and staff-facing layers.
- Prioritize trust, speed, clarity, and conversion.
