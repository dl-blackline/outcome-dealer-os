# Prompt 31 — Phase 4 Truth and Runtime Wiring Plan

Review the current post-phase-3 repo and create a clear truth map for what is still mock-backed, what is runtime-backed, and what must be rewired first.

## Goals

- make the phase 4 execution order explicit and evidence-based
- identify all remaining direct mock dependencies
- prevent random refactors that miss the central hybrid bottleneck

## Tasks

1. Audit these areas against actual code:
   - `src/hooks/useDomainQueries.ts`
   - record pages
   - workstation page and hooks
   - approval queue
   - command palette
   - notification center
   - dashboard metrics
   - settings/integrations pages
2. Create or update:
   - `/docs/architecture/phase4_runtime_wiring_plan.md`
   - `/docs/architecture/direct_mock_dependency_inventory.md`
3. Classify every major surfaced entity as:
   - runtime-backed
   - runtime-backed but seeded from mock/demo data
   - hook-backed via direct mock arrays
   - page-local only
4. Define the recommended runtime migration order for the next prompts.

## Rules

- do not overclaim progress
- preserve working UI while documenting the actual current state
- focus on the highest-leverage runtime rewiring first

## Deliverable

- phase 4 runtime wiring plan
- direct mock dependency inventory
- explicit migration order for the next work
