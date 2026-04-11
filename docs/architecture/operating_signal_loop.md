# Operating Signal Loop

## Overview

The operating signal loop unifies events, audit entries, and notifications into a single
coherent model. Every meaningful state change in Outcome Dealer OS produces a signal
that can be classified, displayed, and acted upon.

## Signal Type

```typescript
interface OperatingSignal {
  id: string
  type: 'event' | 'audit' | 'notification'
  severity: 'info' | 'warning' | 'success' | 'critical'
  title: string
  description: string
  entityType?: string
  entityId?: string
  timestamp: string
  read?: boolean
}
```

Defined in `src/domains/events/operatingSignal.ts`.

## Severity Classification

| Severity | Events | Meaning |
|----------|--------|---------|
| **critical** | `integration_sync_failed`, `lender_declined` | Requires immediate attention |
| **warning** | `appointment_no_show`, `funding_missing_item`, `unit_hit_aging_threshold`, `approval_denied`, `wholesale_recommended`, `service_customer_declined_work` | Action needed soon |
| **success** | `deal_funded`, `approval_granted`, `vehicle_delivered`, `deal_signed`, `unit_frontline_ready`, `integration_sync_recovered`, `lead_converted` | Positive outcome |
| **info** | All other events | Informational |

## Signal Surfaces

| Surface | Source Hook | Display |
|---------|-----------|---------|
| Notification Center | `useOperatingSignals()` | Severity-coded list with read tracking |
| Event Explorer | `useEvents()` | Full event stream with severity badges |
| Audit Explorer | `useAuditLogs()` | Tabular audit trail with entity/role filtering |

## Signal Flow

```
Domain Action (create lead, approve deal, sync failure)
  → Event published (event.service / event.publisher)
  → Audit entry written (audit.service)
  → useOperatingSignals() derives notifications from events
  → NotificationCenter displays severity-coded feed
  → EventExplorerPage shows full event stream with severity
  → AuditExplorerPage shows immutable audit trail
```

## Notification Center Behavior

1. Notifications derive from events via `useOperatingSignals()`
2. Severity icons: critical (red X), warning (yellow triangle), success (green check), info (blue circle)
3. Unread count shown as badge
4. Mark-all-read clears visual emphasis
5. Notifications remain accessible after reading

## Event Explorer Behavior

1. Full event stream sorted by timestamp (newest first)
2. Filter by entity type and actor type
3. Severity badge per event
4. Actor icon per event (user/agent/system)
5. Entity badge with type classification

## Design Principles

- **Single source of truth**: Events are the canonical signal; notifications and audit entries derive from them
- **No duplicate notification systems**: Notifications are classified events, not a separate stream
- **Severity-first display**: Critical and warning signals get visual priority
- **Trust through transparency**: Every signal shows its source, actor, and entity context
