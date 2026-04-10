# Audit and Approval Rules

## Overview

This document explains the audit logging and approval workflows that ensure accountability, compliance, and proper oversight in Outcome Dealer OS.

---

## Audit Logging

### Purpose

Audit logs create an immutable record of all significant actions in the system, enabling:
- Compliance and regulatory requirements
- Debugging and troubleshooting
- Performance review and training
- AI confidence tracking

### What Gets Audited

#### Always Audit
- Financial value changes (trade values, deal structures, pricing)
- Approval state transitions
- AI-generated outputs
- Integration sync operations
- User permission changes

#### Optionally Audit
- Entity creation (leads, appointments, quotes)
- Status updates (lead validated, deal signed)
- Customer communication events

### Audit Log Structure

```typescript
{
  action: string                    // Descriptive name
  objectType: string                // Entity type
  objectId: UUID                    // Entity ID
  before?: Record<string, unknown>  // State before change
  after?: Record<string, unknown>   // State after change
  userId?: UUID                     // Who made the change
  userRole?: string                 // Their role
  source?: string                   // System source
  timestamp: string                 // When it happened
  confidenceScore?: number          // AI confidence (0-1)
  requiresReview?: boolean          // Flagged for review
}
```

### AI Confidence Tracking

When AI generates outputs, audit logs should include:
- **confidenceScore**: 0-1 score from the model
- **requiresReview**: `true` if score < 0.75
- **action**: `'ai_output_persisted'`

Low-confidence outputs trigger approval requests automatically via policy evaluation.

### Best Practices

1. **Capture before and after states**: Include full snapshots for meaningful diffs
2. **Use descriptive action names**: `'trade_value_updated'` > `'update'`
3. **Include context**: userId, userRole, source help with debugging
4. **Keep payloads structured**: Use consistent field names across similar actions

---

## Approval Workflows

### Purpose

Approvals create checkpoints for high-impact decisions, ensuring:
- Financial oversight (trade values, deal structures)
- Compliance with policies
- Review of low-confidence AI actions
- Manager involvement in sensitive decisions

### When Approvals Are Required

#### Trade Value Changes

**Policy**: `evaluateTradeValueChange()`

Approval required if:
- Value changes by >10% OR
- Value changes by >$500

**Eligible Approvers**: GSM, GM, Sales Manager, Used Car Manager, Owner

**Example**:
```typescript
const oldValue = 5000
const newValue = 5600  // +12% requires approval

const decision = evaluateTradeValueChange({ role: 'sales_rep' }, oldValue, newValue)
// decision.requiresApproval = true
// decision.approvalType = 'trade_value_change'
```

#### Financial Output Changes

**Policy**: `evaluateFinancialOutputChange()`

Approval required if:
- Gross profit reduced by >$200 OR
- Gross profit reduced by >15%

**Eligible Approvers**: GSM, GM, Sales Manager, F&I Manager, Owner

**Example**:
```typescript
const oldGross = 2000
const newGross = 1600  // -20% requires approval

const decision = evaluateFinancialOutputChange({ role: 'sales_rep' }, oldGross, newGross)
// decision.requiresApproval = true
// decision.approvalType = 'financial_output_change'
```

#### AI Action Review

**Policy**: `evaluateAIActionReview()`

Approval required if:
- AI confidence score < 0.75

**Eligible Approvers**: GSM, GM, F&I Manager, Owner

**Example**:
```typescript
const decision = evaluateAIActionReview(0.68, 'lead_score_assignment')
// decision.requiresApproval = true
// decision.approvalType = 'ai_action_review'
```

### Approval Request Flow

1. **Evaluate Policy**
   ```typescript
   const decision = evaluateTradeValueChange(user, oldValue, newValue)
   
   if (decision.requiresApproval) {
     // Request approval before proceeding
   }
   ```

2. **Request Approval**
   ```typescript
   const result = await requestApproval({
     type: 'trade_value_change',
     requestedByUserId: salesRepId,
     linkedEntityType: 'trade_appraisal',
     linkedEntityId: tradeId,
     description: 'Trade value increased to meet customer expectation',
   }, ctx)
   ```

3. **Approval Publishes Event**
   - Event: `approval_requested`
   - Payload includes approval type and linked entity

4. **Manager Reviews**
   ```typescript
   const pending = await listPendingApprovals()
   ```

5. **Manager Approves or Denies**
   ```typescript
   await approveRequest({
     approvalId,
     action: 'grant',
     userId: managerId,
     userRole: 'sales_manager',
     notes: 'Approved based on KBB clean value',
   }, ctx)
   ```

6. **Approval State Change**
   - Event: `approval_granted` or `approval_denied`
   - Audit log written
   - Original requester notified

### Permission Checking

The approval service uses the role/permission system:

```typescript
import { canUserApprove } from '@/domains/approvals/approval.policy'

const canApprove = canUserApprove({ role: 'gsm' }, 'trade_value_change')
// Returns true for GSM, GM, Sales Manager, Used Car Manager, Owner
// Returns false for Sales Rep, BDC Manager, etc.
```

### Approval State Machine

```
pending ──┬──> granted (by authorized role)
          │
          └──> denied (by authorized role)
```

Once an approval is granted or denied, it cannot be changed. A new approval request must be created.

### Best Practices

1. **Descriptive Descriptions**: Help managers understand context quickly
2. **Link to Entities**: Always include linkedEntityType and linkedEntityId
3. **Check Permissions**: Use `canUserApprove()` before showing approve/deny UI
4. **Don't Block UX**: Request approval asynchronously, don't freeze the user
5. **Provide Context**: Show before/after values, reasons, entity details

---

## Integration with Domain Services

### Pattern: Audit Then Approve

```typescript
export async function updateTradeValue(
  tradeId: UUID,
  newValue: number,
  ctx: ServiceContext
): Promise<ServiceResult<TradeAppraisal>> {
  const existing = await findById('trade_appraisals', tradeId)
  if (!existing) return fail({ code: 'NOT_FOUND', message: 'Trade not found' })

  // 1. Evaluate policy
  const decision = evaluateTradeValueChange(ctx, existing.proposed_value, newValue)

  if (decision.requiresApproval) {
    // 2. Request approval
    await requestApproval({
      type: 'trade_value_change',
      requestedByUserId: ctx.actorId,
      linkedEntityType: 'trade_appraisal',
      linkedEntityId: tradeId,
      description: `Trade value changed from $${existing.proposed_value} to $${newValue}`,
    }, ctx)

    // Return pending state, don't apply change yet
    return fail({
      code: 'APPROVAL_REQUIRED',
      message: 'Trade value change requires manager approval',
    })
  }

  // 3. Apply change
  const updated = await update('trade_appraisals', tradeId, {
    proposed_value: newValue,
  })

  // 4. Audit the change
  await writeAuditLog({
    action: 'trade_value_updated',
    objectType: 'trade_appraisal',
    objectId: tradeId,
    before: { proposedValue: existing.proposed_value },
    after: { proposedValue: newValue },
  }, ctx)

  // 5. Publish event
  await publishEvent({
    eventName: 'appraisal_completed',
    objectType: 'trade_appraisal',
    objectId: tradeId,
    payload: { proposedValue: newValue },
  }, ctx)

  return ok(mapRowToDomain(updated))
}
```

### Pattern: AI Output with Confidence

```typescript
export async function scoreLeadWithAI(
  leadId: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<Lead>> {
  const lead = await findById('leads', leadId)
  if (!lead) return fail({ code: 'NOT_FOUND', message: 'Lead not found' })

  // 1. Call AI service
  const aiResult = await callAILeadScoring(lead)

  // 2. Evaluate confidence
  const decision = evaluateAIActionReview(aiResult.confidence, 'lead_scoring')

  // 3. Write audit log with confidence
  await writeAuditLog({
    action: 'ai_output_persisted',
    objectType: 'lead',
    objectId: leadId,
    after: { score: aiResult.score },
    confidenceScore: aiResult.confidence,
    requiresReview: decision.requiresApproval,
  }, ctx)

  // 4. Request approval if needed
  if (decision.requiresApproval) {
    await requestApproval({
      type: 'ai_action_review',
      requestedByAgent: 'lead_scoring_agent',
      linkedEntityType: 'lead',
      linkedEntityId: leadId,
      description: `AI assigned score ${aiResult.score} with ${aiResult.confidence * 100}% confidence`,
    }, ctx)
  }

  // 5. Apply score
  const updated = await update('leads', leadId, { score: aiResult.score })

  // 6. Publish event
  await publishEvent({
    eventName: 'lead_scored',
    objectType: 'lead',
    objectId: leadId,
    payload: { score: aiResult.score, confidence: aiResult.confidence },
  }, ctx)

  return ok(mapRowToDomain(updated))
}
```

---

## Querying Audit Logs

### By Entity
```typescript
const logs = await getAuditLogsByEntity('trade_appraisal', tradeId)
// Returns all audit logs for this trade, chronologically
```

### Requiring Review
```typescript
const reviewQueue = await getAuditLogsRequiringReview()
// Returns all logs with requiresReview=true
```

### In UI
- Show audit trail on entity detail pages
- Highlight low-confidence AI actions
- Link to approval requests
- Display before/after diffs

---

## Querying Approvals

### Pending Approvals
```typescript
const pending = await listPendingApprovals()
// Returns all approvals with status='pending'
```

### Filter by Type
```typescript
const tradeApprovals = pending.filter(a => a.type === 'trade_value_change')
```

### Filter by Eligible Role
```typescript
const myApprovals = pending.filter(a => 
  canUserApprove(currentUser, a.type)
)
```

---

## Future Enhancements (PR 6+)

1. **Notification System**: Notify managers of pending approvals
2. **Delegation**: Allow approvers to delegate to others
3. **Bulk Actions**: Approve/deny multiple items at once
4. **Approval History**: Show approval timeline on entity pages
5. **Analytics**: Track approval rates, times, patterns
6. **Auto-Approval**: For trusted users based on history
