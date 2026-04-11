# Approval Queue Runtime Contract

## Overview

The approval queue provides human-in-the-loop governance for high-impact actions.
Approvals are the primary check on automated and human decisions in the dealership.

## Approval Types

| Type | Trigger | Threshold |
|------|---------|-----------|
| `trade_value_change` | Trade value override | >10% or >$500 change |
| `financial_output_change` | Rate or payment modification | >15% or >$200 change |
| `ai_action` | Agent-initiated action | <75% confidence score |

## Data Flow

```
Request → useApprovalMutations() → Local State Update → Console Log
                                        ↓
                                   UI Re-renders
```

### Current Implementation (Phase 3)

1. **Loading**: `useApprovalMutations()` initializes from `MOCK_APPROVALS`
2. **Display**: Approval cards show type badge, description, requester, timestamp
3. **Resolution**: Approve/Deny buttons trigger state update with optional notes
4. **Feedback**: Resolution notes input appears on first click, action fires on second click
5. **Audit trail**: Resolved-by name, timestamp, and notes displayed on resolved approvals

### Target Implementation (Future)

1. **Loading**: `useApprovals()` reads from `approval.service.ts` → KV store
2. **Resolution**: `approveItem()`/`denyItem()` calls `approval.service.grant()`/`.deny()`
3. **Events**: Approval events published to event bus
4. **Audit**: Audit entries written via `audit.service.ts`
5. **Workstation**: Auto-card generated for approval requests

## Resolution Flow

```
Pending Approval
  ├── Click "Approve" → shows notes input
  │   └── Click "Approve" again → optimistic update to "granted"
  │       ├── resolvedBy: "Current User (Manager)"
  │       ├── resolvedAt: now
  │       └── resolutionNotes: optional text
  └── Click "Deny" → shows notes input
      └── Click "Deny" again → optimistic update to "denied"
```

## Role-Based Access

Only roles with `approve_trade_values` permission can resolve trade value approvals.
The policy engine in `approval.policy.ts` enforces separation of duties:

- Sales reps can **request** but not **approve** their own trade values
- F&I managers can **request** financial changes but only GMs can approve large overrides
- AI actions require human review when confidence is below threshold

## UI Contract

The ApprovalQueuePage must:
1. Show pending count in the header
2. Support tab filtering: pending / granted / denied / all
3. Show resolution details for resolved approvals
4. Show notes input before resolution (two-click confirm pattern)
5. Handle loading state with spinner
