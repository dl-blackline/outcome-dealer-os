# Household Runtime Model

## Overview

Household data follows a **seed-and-query** pattern. On first application load
the household hooks seed the in-memory store (backed by `window.spark.kv`) with
a small set of representative household records. Subsequent reads are served from
the same store through the standard service layer.

## Architecture

```
┌──────────────────┐     seed (once)     ┌──────────────────┐
│  household.hooks │ ─────────────────▶  │  db:households   │
│  (useHouseholds) │                     │  (spark KV)      │
└──────────────────┘                     └──────────────────┘
         │                                        ▲
         │  useSimulatedQuery                     │
         ▼                                        │
  ┌───────────────┐    findMany / findById  ┌─────┴──────────┐
  │  QueryResult  │ ◀───────────────────── │  household     │
  │  { data, … }  │                        │  .service.ts   │
  └───────────────┘                        └────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/domains/households/household.types.ts` | Row type, domain type, mappers |
| `src/domains/households/household.service.ts` | CRUD operations via db helpers |
| `src/domains/households/household.queries.ts` | Composite / enriched queries |
| `src/domains/households/household.hooks.ts` | React hooks with seed logic |

## Seed Behaviour

* `HOUSEHOLD_SEED` is a static array of `HouseholdSummary` objects embedded in
  `household.hooks.ts`.
* On module load, `seedHouseholdsIfNeeded()` fires once. It checks whether any
  rows already exist in the `households` table. If not, it inserts the seed data.
* The seeding is idempotent — reloading the page will not duplicate records if
  the KV store persists across page loads.

## Hook Signatures

```ts
function useHouseholds(): QueryResult<HouseholdSummary[]>
function useHousehold(id: string): QueryResult<HouseholdSummary | null>
```

Both hooks return `QueryResult<T>` with `{ data, loading, error }`.
