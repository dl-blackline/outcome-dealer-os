# Prompt 38 — Notification and Command Runtime Sources

Make the notification center and command palette rely on runtime-backed sources wherever possible instead of direct mock arrays.

## Goals

- improve trustworthiness of notifications and global search
- reduce direct mock dependencies in shell-level operating tools
- keep command and notification behavior aligned with the rest of the runtime model

## Tasks

1. Review current command palette and notification center data sources.
2. Refactor them to use runtime-backed hooks, adapters, or query helpers where available.
3. Improve command palette search coverage across current surfaced runtime entities.
4. Improve notification severity and read-state behavior based on real operating signals.
5. Add or update:
   - `/docs/architecture/command_and_notification_runtime_model.md`

## Rules

- do not invent a separate notification-only data system
- do not fake command actions that have no real backing
- keep the UX fast and premium

## Deliverable

- notifications and command palette more runtime-backed
- reduced direct mock usage in shell tools
- docs for command and notification runtime behavior
