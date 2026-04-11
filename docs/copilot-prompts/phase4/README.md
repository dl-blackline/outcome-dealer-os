# Outcome Dealer OS Copilot Prompt Pack — Phase 4

This folder contains the **Phase 4** prompt pack for Outcome Dealer OS.

Phase 3 made the app feel operationally real in structure, but the repo still has a major hybrid bottleneck: the hook/query layer is still heavily backed by direct mock arrays and inline seed data.

Phase 4 is about moving Outcome Dealer OS from a polished hybrid demo into a much more trustworthy runtime-driven application.

## Run order

1. `31_phase4_truth_and_runtime_wiring_plan.md`
2. `32_replace_useDomainQueries_with_domain_runtime_hooks.md`
3. `33_household_and_task_runtime_services.md`
4. `34_approval_event_audit_runtime_unification.md`
5. `35_workstation_runtime_and_auto_card_live_flow.md`
6. `36_record_runtime_adapters_and_entity_linking.md`
7. `37_dashboard_role_signal_wiring.md`
8. `38_notification_and_command_runtime_sources.md`
9. `39_admin_integration_controls_and_manual_actions.md`
10. `40_phase4_test_matrix_seed_bootstrap_and_release_prep.md`
11. `99_master_run_order_prompt_phase4.md`

## Phase 4 outcomes

By the end of this sequence, Outcome Dealer OS should have:

- a truthful post-phase-3 repo narrative
- far less dependence on `useDomainQueries.ts` as a mock aggregator
- runtime hooks and services for the most important surfaced entities
- approvals, audit, events, and notifications reading from the same runtime loop
- workstation cards driven from runtime state and auto-card execution
- households and tasks moved out of inline mock definitions
- role-aware dashboard signals actually connected
- command palette and notifications driven from runtime sources where possible
- stronger admin and integration control surfaces
- a cleaner seed/bootstrap strategy and better release readiness

## Notes

- Keep Outcome Dealer OS as the active build target.
- Do not touch Power Prospect.
- Preserve what is already good: shell, router, auth mounting, workstation UX direction, command palette UX, approval service, event service.
- The biggest remaining architectural risk is the hybrid hook layer. This phase is primarily about solving that.
