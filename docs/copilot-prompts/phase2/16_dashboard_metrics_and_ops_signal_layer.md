# Prompt 16 — Dashboard Metrics and Ops Signal Layer

Upgrade the dashboards from static mock summaries into a more realistic operating signal layer.

## Goals

- make dashboard cards derive from canonical adapters or domain queries
- reflect workstation, approvals, events, and record counts more realistically
- improve role-specific operating signal quality

## Tasks

1. Review current dashboard implementation and role-aware metric behavior.
2. Refactor dashboard metrics to derive from centralized adapters or query helpers rather than scattered page logic.
3. Improve signals for at least:
   - leads
   - deals
   - approvals
   - inventory aging
   - workstation open cards
   - recent events
4. Make role-specific dashboard behavior cleaner for:
   - owner
   - gm
   - sales-focused roles
   - service-focused roles
5. Add or update:
   - `/docs/architecture/dashboard_signal_model.md`

## Rules

- do not build a giant analytics engine yet
- keep dashboards readable and premium
- favor operational usefulness over decorative cards

## Deliverable

- stronger dashboard signal layer
- centralized metric derivation
- cleaner role-aware dashboard behavior
