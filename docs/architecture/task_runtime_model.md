# Task Runtime Model

## Overview

The task domain provides a full CRUD service backed by the in-memory database
(`window.spark.kv`). Task hooks seed the store with mock data on first load and
expose a `useTasks()` hook that returns the same `QueryResult<MockTask[]>` shape
consumed by the Dashboard and other surfaces.

## Architecture

```
┌──────────────────┐     seed (once)     ┌──────────────────┐
│  task.hooks.ts   │ ─────────────────▶  │  db:tasks        │
│  (useTasks)      │                     │  (spark KV)      │
└──────────────────┘                     └──────────────────┘
         │                                        ▲
         │  useSimulatedQuery                     │
         ▼                                        │
  ┌───────────────┐    findMany / findById  ┌─────┴──────────┐
  │  QueryResult  │ ◀───────────────────── │  task.service   │
  │  { data, … }  │                        │  .ts            │
  └───────────────┘                        └────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `src/domains/tasks/task.types.ts` | `TaskRow`, `Task`, input types, mapper |
| `src/domains/tasks/task.service.ts` | `createTask`, `getTaskById`, `listTasks`, `updateTask`, `completeTask` |
| `src/domains/tasks/task.queries.ts` | Specialised queries (by assignee, status, linked entity, overdue) |
| `src/domains/tasks/task.hooks.ts` | React hooks with seed-and-query logic |
| `src/hooks/useTasks.ts` | Re-export shim for backward compatibility |

## Seed Behaviour

* `MOCK_TASKS` from `src/lib/mockData.ts` serves as the seed data.
* On module load, `seedTasksIfNeeded()` checks the `tasks` table. If empty, it
  inserts one row per mock task.
* The seed flag (`seeded`) is module-scoped, so re-imports do not re-trigger.

## Service Layer

All mutations go through the service layer which provides:

* **Validation** — e.g. title must be non-empty
* **Audit logging** — every create / update / complete writes to `audit_logs`
* **`ServiceResult<T>`** return type — callers use `ok` / `fail` pattern

### completeTask

A convenience wrapper that sets `status = 'completed'` and stamps
`completed_at`. It is idempotent — completing an already-completed task returns
the existing record without modification.

## Hook Signatures

```ts
function useTasks(): QueryResult<MockTask[]>
```

Returns the same `MockTask[]` shape used by the Dashboard page. The shim at
`src/hooks/useTasks.ts` re-exports from the domain hook file so existing
barrel imports (`useDomainQueries.ts`) continue to work.

## Import Chain

```
DashboardPage.tsx
  └─ @/domains/tasks/task.hooks  (direct import)

useDomainQueries.ts
  └─ @/domains/tasks/task.hooks  (re-export)

src/hooks/useTasks.ts
  └─ @/domains/tasks/task.hooks  (compatibility shim)
```
