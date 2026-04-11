# Prompt 37 — Dashboard Role Signal Wiring

Finish wiring dashboard signals so role-specific operating intelligence comes from runtime-backed adapters rather than universal mock summaries.

## Goals

- connect dashboard signal derivation to runtime-backed hooks and adapters
- make dashboard content meaningfully different by role
- improve actionability of the dashboard layer

## Tasks

1. Review current dashboard metrics, signal adapters, and role behavior.
2. Connect dashboard rendering to runtime-backed entity, workstation, approval, and event data where available.
3. Ensure role-specific signal emphasis for at least:
   - owner
   - gm
   - sales roles
   - service roles
4. Make action-oriented signals more visible than decorative totals.
5. Add or update:
   - `/docs/architecture/dashboard_runtime_signal_model.md`

## Rules

- do not build a giant analytics platform
- keep dashboards readable, premium, and operationally sharp
- prioritize urgency and relevance over card count

## Deliverable

- dashboard signals wired more realistically
- stronger role-specific dashboard behavior
- docs for dashboard runtime signal model
