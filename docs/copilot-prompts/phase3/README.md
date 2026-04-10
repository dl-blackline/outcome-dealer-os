# Outcome Dealer OS Copilot Prompt Pack — Phase 3

This folder contains the **Phase 3** prompt pack for Outcome Dealer OS.

Phase 2 made the product structurally real: auth is mounted, routes are real, workstation exists, route enforcement exists, command palette and notifications gained useful behavior, and the repo is much more coherent.

Phase 3 is about removing the remaining hybrid state and making the OS operationally trustworthy.

## Run order

1. `20_phase3_truth_and_hybrid_state_cleanup.md`
2. `21_mock_to_runtime_data_transition.md`
3. `22_workstation_drag_drop_and_card_lifecycle.md`
4. `23_approval_queue_real_resolution_flow.md`
5. `24_event_audit_notification_unification.md`
6. `25_record_linkage_and_cross_surface_continuity.md`
7. `26_domain_runtime_services_for_core_entities.md`
8. `27_dashboard_operating_intelligence_pass.md`
9. `28_global_search_command_and_context_actions.md`
10. `29_settings_admin_and_integration_control_surfaces.md`
11. `30_phase3_hardening_tests_and_release_readiness.md`
12. `99_master_run_order_prompt_phase3.md`

## Phase 3 outcomes

By the end of this sequence, Outcome Dealer OS should have:

- docs that accurately describe the post-v2 system
- far less page-local and mock-only behavior
- workstation drag/drop and card lifecycle grounded in runtime services
- approval resolution that is no longer a local UI illusion
- events, audit, notifications, and workstation linked in one operational loop
- stronger record-to-record continuity across the product
- runtime services for core surfaced entities
- dashboards driven by real adapters and operating signals
- useful global search and contextual command behavior
- meaningful admin and integration surfaces
- better tests, hardening, and release readiness

## Notes

- Keep Outcome Dealer OS as the active build target.
- Do not touch Power Prospect.
- Preserve what is already good: premium shell, route model, auth mounting, workstation direction, role model.
- Prioritize trustworthiness over feature count.
