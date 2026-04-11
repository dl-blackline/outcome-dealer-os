# Governance Runtime Loop

## Overview

The governance runtime loop unifies approvals, events, and audit logs into a single
seed-and-query pattern backed by the in-memory store (`window.spark.kv`).

## Pattern: Seed-and-Query

Each domain hook follows this lifecycle:

1. **Module-level boolean** tracks whether seed data has been inserted.
2. **On first load**, mock/seed data is inserted into the store via `insert<Row>()`.
3. **Hooks query from the store** using `findMany<Row>()` and map rows back to the
   UI-facing shape (e.g. `MockApproval`, `MockEvent`, `AuditLogEntry`).
4. **Mutations update the store** via `update<Row>()`, then refresh from the store.

```
 MOCK_DATA ──seed──▶ In-Memory Store (kv)
                         │
            findMany / update / insert
                         │
                    Domain Hooks ──▶ Pages
```

## Approval → Event → Audit Integration

When an approval is resolved through `useApprovalMutations()`:

1. The approval row is updated in the `approvals` table.
2. An event is published to the `event_bus` table via `publishEvent()`.
3. An audit log is written to the `audit_logs` table via `writeAuditLog()`.

This means resolving a single approval produces observable side-effects in both
the Event Explorer and the Audit Explorer.

## Tables

| Table        | Row Type        | Hooks File                        |
|-------------|-----------------|-----------------------------------|
| `approvals` | `ApprovalRow`   | `domains/approvals/approval.hooks.ts` |
| `event_bus` | `EventBusRow`   | `domains/events/event.hooks.ts`       |
| `audit_logs`| `AuditLogRow`   | `domains/audit/audit.hooks.ts`        |

## Hook Signatures (unchanged)

| Hook                    | Returns                       |
|------------------------|-------------------------------|
| `useApprovals()`       | `QueryResult<MockApproval[]>` |
| `useApprovalMutations()` | `{ approvals, approveItem, denyItem }` |
| `useEvents()`          | `QueryResult<MockEvent[]>`    |
| `useEntityEvents(id)`  | `QueryResult<MockEvent[]>`    |
| `useServiceEvents()`   | `QueryResult<MockServiceEvent[]>` (mock) |
| `useOperatingSignals()`| `QueryResult<OperatingSignal[]>` |
| `useAuditLogs()`       | `QueryResult<AuditLogEntry[]>` |
