# Prompt 33 — Household and Task Runtime Services

Finish two of the clearest remaining runtime gaps: households and tasks.

## Goals

- remove inline household data from hook files
- introduce a dedicated household runtime service and seed/bootstrap path
- introduce a real task runtime service instead of inline task mocks

## Tasks

1. Build or complete a dedicated household service, queries, and runtime hook path.
2. Build or complete a task service, queries, and runtime hook path.
3. Ensure households and tasks no longer live as inline arrays in general-purpose hook files.
4. Wire surfaced pages and dashboards to the new runtime-backed paths.
5. Add or update:
   - `/docs/architecture/household_runtime_model.md`
   - `/docs/architecture/task_runtime_model.md`

## Rules

- do not overbuild a full workflow engine
- keep task semantics consistent with workstation and operating signals
- preserve current UI while improving runtime trustworthiness

## Deliverable

- dedicated household runtime path
- dedicated task runtime path
- reduced inline seed definitions in hooks
