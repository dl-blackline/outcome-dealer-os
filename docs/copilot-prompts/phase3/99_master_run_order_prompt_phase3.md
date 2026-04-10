# Master Run-Order Prompt for Copilot — Phase 3

Use this exact prompt with Copilot:

---

Work only in this repo: `dl-blackline/outcome-dealer-os`.

Do not touch Power Prospect.

Read the files in `docs/copilot-prompts/phase3/` and execute them **in order**.

Required order:

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

Execution rules:

- Before each step, inspect the current repo files relevant to that prompt.
- Preserve what is already good.
- Refactor carefully instead of rewriting recklessly.
- Keep Outcome Dealer OS as one coherent premium dealership operating system.
- Keep the workstation as a first-class execution layer.
- Do not create duplicate role, permission, event, record, or notification systems.
- Update docs as you go.
- After each step, summarize:
  - what was changed
  - what was preserved
  - assumptions made
  - risks or deferred items
- Then move to the next numbered prompt.

Final output after all prompts are complete:

1. final file tree changes
2. major systems improved or implemented
3. remaining mock-backed or hybrid areas
4. open risks or gaps
5. recommended focus areas for the next repo review

If any prompt conflicts with the current implemented repo reality, preserve the current working system where reasonable, document the conflict clearly, and continue in the spirit of Outcome Dealer OS rather than reverting to earlier scaffold behavior.
