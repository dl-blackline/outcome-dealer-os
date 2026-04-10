# Prompt 17 — Command Palette, Notifications, and Global Search

Turn the command palette and notification center from shells into useful global operating tools.

## Goals

- make command palette actually navigate and expose useful actions
- make notification center reflect meaningful signals
- introduce simple global search behavior across current surfaced record types

## Tasks

1. Review the current command palette and notification center components.
2. Make command palette support:
   - route navigation
   - quick jumps to records, ops pages, and workstation
   - simple search over available routes and surfaced mock/current data
3. Make notification center support:
   - pending approvals
   - recent important events
   - open or urgent workstation items
   - failed or warning states if modeled
4. Add or update:
   - `/docs/ux/command_palette_and_notification_behavior.md`

## Rules

- do not overbuild a full omnibox or AI assistant in this pass
- keep interactions fast, useful, and premium
- use centralized adapters for search sources where possible

## Deliverable

- useful command palette
- useful notification center
- basic global search behavior
