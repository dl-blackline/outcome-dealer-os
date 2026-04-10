# Prompt 28 — Global Search, Commands, and Context Actions

Expand the command layer from route and record lookup into a real context-aware productivity tool.

## Goals

- improve global search usefulness
- support contextual actions on surfaced entities
- make the command system feel like part of the OS, not just a modal

## Tasks

1. Review current command palette behavior and search sources.
2. Expand command palette to support:
   - entity search across current surfaced runtime data
   - context-sensitive quick actions
   - stronger keyboard-first behavior
3. Add context-aware actions where appropriate for:
   - navigate to linked record
   - jump to workstation
   - open approvals
   - open inventory or deal records
4. Add or update:
   - `/docs/ux/global_command_model.md`

## Rules

- do not overbuild an AI command agent in this pass
- keep search and actions fast and grounded
- avoid fake actions that do not map to real current capabilities

## Deliverable

- more useful global command behavior
- better search and contextual actions
- docs for command model
