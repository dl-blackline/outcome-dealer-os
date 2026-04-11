# Prompt 35 — Workstation Runtime and Auto-Card Live Flow

Move the workstation from a partially seeded service-backed board into a more fully live operational flow.

## Goals

- make workstation cards load and mutate from runtime state consistently
- connect auto-card execution to real event flow
- reduce separation between workstation UI and workstation runtime behavior

## Tasks

1. Audit the current workstation service, runtime hooks, page, and auto-card logic.
2. Ensure the workstation page consumes runtime hooks/services rather than local mutation wrappers wherever possible.
3. Make auto-card execution update the real workstation runtime source.
4. Improve card lifecycle persistence for:
   - create
   - move
   - complete
   - reopen
   - event-generated card creation
5. Add or update:
   - `/docs/architecture/workstation_live_runtime_flow.md`

## Rules

- preserve the current premium workstation UI
- do not create a second workstation state system
- keep auto-card logic centralized

## Deliverable

- stronger live workstation runtime flow
- auto-cards tied to runtime execution
- docs for workstation runtime model
