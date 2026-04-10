# Prompt 24 — Event, Audit, and Notification Unification

Unify the event stream, audit layer, and notification center so they behave like one operating signal system.

## Goals

- make events, audit, and notifications reflect the same underlying state changes
- reduce duplicate or disconnected logic between explorers and notification surfaces
- improve trust in operating signals

## Tasks

1. Review current event, audit, and notification implementations.
2. Ensure notifications derive from meaningful event or audit signals rather than isolated transforms when possible.
3. Improve explorer and notification consistency for:
   - approval events
   - workstation-affecting events
   - funding and risk signals
   - aging and service opportunity signals
4. Add or update:
   - `/docs/architecture/operating_signal_loop.md`

## Rules

- do not invent separate notification-only event systems
- keep the signal model understandable
- favor trust and clarity over volume

## Deliverable

- stronger event/audit/notification coherence
- cleaner operating signal loop
- docs for unified signal behavior
