# Master Run-Order Prompt for Copilot

Use this exact prompt with Copilot:

---

Work only in this repo: `dl-blackline/outcome-dealer-os`.

Do not touch Power Prospect.

Read the files in `docs/copilot-prompts/` and execute them **in order**.

Required order:

1. `00_copilot_operating_instruction.md`
2. `01_identity_and_shell_correction.md`
3. `02_real_app_shell_and_route_architecture.md`
4. `03_workstation_first_class_os_pillar.md`
5. `04_records_and_ops_real_surfaces.md`
6. `05_canonical_frontend_data_layer.md`
7. `06_approvals_audit_event_continuity_ui.md`
8. `07_workstation_auto_card_rules.md`
9. `08_final_stabilization_and_review_readiness.md`

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
2. major systems implemented
3. remaining placeholders
4. open risks or gaps
5. recommended focus areas for final repo review

If any prompt conflicts with the current implemented repo reality, preserve the current working system where reasonable, document the conflict clearly, and continue in the spirit of Outcome Dealer OS rather than reverting to scaffold behavior.
