# UI Governance Surfaces

## Overview

Outcome Dealer OS treats approvals, audit logging, and event continuity as first-class concerns in the UI — not hidden admin pages.

## Reusable Components

Located in `src/components/governance/GovernanceComponents.tsx`:

| Component | Purpose |
|-----------|---------|
| `ApprovalStatusBadge` | Colored status pill for approval states |
| `RequiresReviewFlag` | Yellow shield badge for approval-sensitive items |
| `ApprovalSummaryCard` | Card showing approvals linked to a record, with pending count |
| `AuditRow` | Single row in an audit log table |
| `EventRow` | Single row in an event timeline with actor icons |
| `EntityEventTimeline` | Complete timeline card for events related to an entity |

## Where Governance Shows Up

### Record Pages
- Deal records show `ApprovalSummaryCard` when linked approvals exist
- Lead and deal records show `EntityEventTimeline` for activity history

### Workstation
- Cards with `requiresApproval: true` display the shield icon
- Card drawer shows approval flag prominently

### Operations Pages
- `ApprovalQueuePage` — full approval queue with approve/deny actions
- `AuditExplorerPage` — immutable log with entity/role filters
- `EventExplorerPage` — real-time event stream with actor type icons

## Design Principles

1. **Trust through transparency** — every money/compliance-sensitive action is visibly governed
2. **Contextual governance** — approval and audit info appears on the records they affect
3. **Visual restraint** — governance indicators are informational, not alarmist
4. **Consistent components** — same `ApprovalStatusBadge` and `EventRow` everywhere
