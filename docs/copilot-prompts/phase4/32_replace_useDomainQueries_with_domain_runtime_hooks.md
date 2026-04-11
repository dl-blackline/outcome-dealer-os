# Prompt 32 — Replace `useDomainQueries` with Domain Runtime Hooks

Break up the current `useDomainQueries.ts` bottleneck and move Outcome Dealer OS toward real domain-scoped runtime hooks.

## Goals

- stop using one giant mixed hook file as the data backbone
- create per-domain runtime hooks and query helpers
- reduce direct dependence on raw mock arrays and inline static datasets

## Tasks

1. Audit `src/hooks/useDomainQueries.ts` and identify logical slices.
2. Split or migrate it into domain-scoped runtime hooks for at least:
   - households
   - leads
   - deals
   - inventory
   - approvals
   - workstation
   - events / audit / signals
3. Ensure pages consume these domain hooks instead of a giant shared mock aggregator.
4. Keep compatibility shims only where necessary, and document them clearly.
5. Add or update:
   - `/docs/architecture/domain_runtime_hook_model.md`

## Rules

- do not create duplicate business objects
- do not break page contracts unnecessarily
- prioritize runtime-backed hooks over new UI work

## Deliverable

- reduced or decomposed `useDomainQueries.ts`
- domain-scoped runtime hooks
- clearer page-to-domain hook boundaries
