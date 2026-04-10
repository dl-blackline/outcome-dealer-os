# Approval Runtime Flow

## Architecture

```
ApprovalQueuePage (UI)
  ├─ handleAction(id, 'granted' | 'denied')
  │    ├─ Updates local state (responsive UI)
  │    ├─ Calls approveRequest() or denyRequest()  [approval.service.ts]
  │    │    ├─ Validates status is 'pending'
  │    │    ├─ Checks canUserApprove()              [approval.policy.ts]
  │    │    ├─ Updates approval row in KV
  │    │    ├─ publishEvent(approval_granted/denied) [event.publisher.ts]
  │    │    └─ writeAuditLog()                       [audit.service.ts]
  │    └─ emitEvent() through event bus             [event.bus.ts]
  │         └─ May generate workstation card if auto-card rule matches
```

## Approval Lifecycle

1. **Request**: `requestApproval()` creates a pending approval + emits `approval_requested` event
2. **Review**: ApprovalQueuePage displays pending approvals with approve/deny buttons
3. **Resolve**: User clicks approve/deny → service validates permissions → updates state
4. **Audit**: Every resolution writes an audit log entry with before/after state
5. **Event**: Every resolution emits an event (for downstream processing)

## Permission Checks

Approval resolution is governed by `canUserApprove(user, approvalType)`:

| Approval Type | Eligible Roles |
|--------------|---------------|
| `trade_value_change` | gsm, gm, sales_manager, used_car_manager, owner |
| `financial_output_change` | gsm, gm, sales_manager, fi_manager, owner |
| `ai_action_review` | gsm, gm, fi_manager, owner |
| `generic` | Anyone with `resolve_approvals` permission |

## Audit Trail

Every approval action writes:
- `action`: 'approval_granted' or 'approval_denied'
- `objectType`: 'approval'
- `objectId`: approval record ID
- `before`: `{ status: 'pending' }`
- `after`: `{ status: 'granted'/'denied', approvedBy: userId }`
- `userId` and `userRole` from ServiceContext

## Current State

- Approval service layer is fully functional with KV persistence
- UI still seeds from `MOCK_APPROVALS` for initial display
- Approve/deny actions now call real services AND emit events
- Approval events can trigger workstation card generation via auto-card rules
