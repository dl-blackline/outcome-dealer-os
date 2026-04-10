# Master Run-Order Prompt for Copilot — Phase 2

Use this exact prompt with Copilot:

---

Work only in this repo: `dl-blackline/outcome-dealer-os`.

Do not touch Power Prospect.

Read the files in `docs/copilot-prompts/phase2/` and execute them **in order**.

Required order:

1. `09_truth_correction_and_repo_alignment.md`
2. `10_auth_activation_and_role_source.md`
3. `11_permission_guards_and_route_enforcement.md`
4. `12_workstation_persistence_and_real_actions.md`
5. `13_event_bus_and_auto_card_execution.md`
6. `14_approval_actions_audit_and_event_persistence.md`
7. `15_record_services_search_and_not_found.md`
8. `16_dashboard_metrics_and_ops_signal_layer.md`
9. `17_command_palette_notifications_and_global_search.md`
10. `18_settings_integrations_and_admin_surfaces.md`
11. `19_quality_hardening_and_review_prep.md`

Execution rules:

- Before each step, inspect the current repo files relevant to that prompt.
- Preserve what is already good.
- Refactor carefully instead of rewriting recklessly.
- Keep Outcome Dealer OS as one coherent premium dealership operating system.
- Keep the workstation as a first-class execution layer.
- Do not create duplicate role, permission, event, or record systems.
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
3. remaining mock-driven areas
4. open risks or gaps
5. recommended focus areas for the next repo review

If any prompt conflicts with the current implemented repo reality, preserve the current working system where reasonable, document the conflict clearly, and continue in the spirit of Outcome Dealer OS rather than reverting to scaffold behavior.
