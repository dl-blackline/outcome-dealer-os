# Master Run-Order Prompt for Copilot — Phase 5

Use this exact prompt with Copilot:

---

Work only in this repo: `dl-blackline/outcome-dealer-os`.

Do not touch Power Prospect.

Read the files in `docs/copilot-prompts/phase5/` and execute them **in order**.

Required order:

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

Execution rules:

- Before each step, inspect the current repo files relevant to that prompt.
- Preserve what is already good.
- Refactor carefully instead of rewriting recklessly.
- Keep Outcome Dealer OS as one coherent premium dealership operating system.
- Do not build the buyer hub as a disconnected marketing site.
- Preserve canonical object continuity between customer-facing and staff-facing layers.
- Keep the workstation as the internal execution sink for customer-generated work.
- Do not create duplicate role, permission, event, record, or customer identity systems.
- Update docs as you go.
- After each step, summarize:
  - what was changed
  - what was preserved
  - assumptions made
  - risks or deferred items
- Then move to the next numbered prompt.

Final output after all prompts are complete:

1. final file tree changes
2. buyer-hub systems implemented
3. how customer-facing actions map into internal OS records and workstation execution
4. remaining MVP-only or placeholder areas
5. recommended focus areas for the next repo review

If any prompt conflicts with the current implemented repo reality, preserve the current working system where reasonable, document the conflict clearly, and continue in the spirit of Outcome Dealer OS rather than reverting to earlier scaffold behavior.
