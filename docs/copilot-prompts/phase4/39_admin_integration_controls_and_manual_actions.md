# Prompt 39 — Admin, Integration Controls, and Manual Actions

Upgrade the settings and admin surfaces from informational pages into more useful operational control panels.

## Goals

- make admin and integration pages more actionable
- introduce safe manual actions where appropriate
- better reflect current integration maturity and control boundaries

## Tasks

1. Review current roles and integrations settings pages.
2. Improve them to show:
   - role and permission clarity
   - integration status and maturity
   - manual control opportunities such as sync triggers or diagnostics where safe
   - current limitations and next actions for admin users
3. Add meaningful read-only versus actionable distinctions so the pages are honest.
4. Add or update:
   - `/docs/architecture/admin_control_surface_model.md`
   - `/docs/architecture/integration_manual_action_policy.md`

## Rules

- do not invent fake integrations or unsafe credential workflows
- keep admin surfaces honest and useful
- preserve the current premium shell language

## Deliverable

- stronger admin surfaces
- clearer integration control behavior
- docs for manual-action policy and admin control model
