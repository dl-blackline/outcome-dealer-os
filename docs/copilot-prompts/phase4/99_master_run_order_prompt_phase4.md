# Master Run-Order Prompt for Copilot — Phase 4

Use this exact prompt with Copilot:

---

Work only in this repo: `dl-blackline/outcome-dealer-os`.

Do not touch Power Prospect.

Read the files in `docs/copilot-prompts/phase4/` and execute them **in order**.

Required order:

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

Execution rules:

- Before each step, inspect the current repo files relevant to that prompt.
- Preserve what is already good.
- Refactor carefully instead of rewriting recklessly.
- Keep Outcome Dealer OS as one coherent premium dealership operating system.
- Keep the workstation as a first-class execution layer.
- Do not create duplicate role, permission, event, record, hook, or notification systems.
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
3. remaining seeded, mock-backed, or hybrid areas
4. open risks or gaps
5. recommended focus areas for the next repo review

If any prompt conflicts with the current implemented repo reality, preserve the current working system where reasonable, document the conflict clearly, and continue in the spirit of Outcome Dealer OS rather than reverting to earlier scaffold behavior.
