# Workstation Runtime Model

## Architecture

```
WorkstationPage
  ├─ listWorkstationCards()     → reads from KV via workstation.service
  ├─ createWorkstationCard()    → persists to KV
  ├─ moveWorkstationCard()      → updates column in KV
  └─ WorkstationComponents      → pure UI (board, drawer, filters, quick create)

workstation.service.ts
  ├─ Uses db.insert / db.update / db.findMany from lib/db
  ├─ Seeds mock data on first load if table empty
  └─ Returns ServiceResult<T> for all operations
```

## Data Flow

1. Page mounts → calls `listWorkstationCards()`
2. Service checks KV table `workstation_cards`
3. If empty, seeds from `MOCK_WORKSTATION_CARDS` (one-time)
4. Returns `WorkstationCard[]` to the page
5. Page renders board from returned data
6. User actions (move, create) call service → service persists → page updates local state from result

## Persistence

- Storage: Spark KV via `window.spark.kv`
- Table: `workstation_cards`
- CRUD: `db.insert()`, `db.update()`, `db.findMany()`, `db.findById()`
- Cards survive page navigation (stored in KV)
- Cards reset on app reload (KV is session-scoped in Spark)

## Service API

| Function | Input | Output |
|----------|-------|--------|
| `listWorkstationCards()` | None | `ServiceResult<WorkstationCard[]>` |
| `getWorkstationCard(id)` | UUID | `ServiceResult<WorkstationCard \| null>` |
| `createWorkstationCard(card)` | Card without id/timestamps | `ServiceResult<WorkstationCard>` |
| `moveWorkstationCard(id, columnId)` | UUID, column | `ServiceResult<WorkstationCard>` |
| `updateWorkstationCard(id, updates)` | UUID, partial updates | `ServiceResult<WorkstationCard>` |
| `completeWorkstationCard(id)` | UUID | Moves to 'done' column |

## What Changed (Phase 2)

- **Before**: Cards lived in `useState(MOCK_WORKSTATION_CARDS)` — page-local, lost on navigation
- **After**: Cards persisted via workstation service → KV store, seeded from mock on first use
- UI components (`WorkstationComponents.tsx`) unchanged — they remain pure presentation
