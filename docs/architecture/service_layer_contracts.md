# Service Layer Contracts

## Overview

This document defines the shared infrastructure services that form the foundation of Outcome Dealer OS. These services provide consistent patterns for event publishing, audit logging, approval workflows, and integration sync state management that all domain services will depend on.

## Core Principles

1. **Typed Service Results**: All services return `ServiceResult<T>` for consistent error handling
2. **Context-Aware**: Services accept optional `ServiceContext` for actor tracking
3. **No UI Dependencies**: Infrastructure services are pure backend logic
4. **Reusable Primitives**: Designed to be called by future domain services

## Database Layer

### Location
- `/src/lib/db/supabase.ts` - Core database client
- `/src/lib/db/helpers.ts` - CRUD helper functions
- `/src/lib/db/mappers.ts` - snake_case <-> camelCase conversions

### Usage

```typescript
import { insert, update, findById, findMany } from '@/lib/db/helpers'
import { MyRow } from '@/lib/db/supabase'

const row = await insert<MyRow>('my_table', {
  field_name: 'value',
  status: 'active',
})

const updated = await update<MyRow>('my_table', row.id, {
  status: 'completed',
})

const records = await findMany<MyRow>('my_table', 
  (row) => row.status === 'active'
)
```

### Key Design Decisions
- Uses `spark.kv` for data persistence
- All tables indexed by `id` (UUID)
- Automatic `created_at` and `updated_at` timestamps
- Type-safe predicates for filtering

---

## Event Publishing Service

### Location
- `/src/domains/events/event.types.ts` - Type definitions
- `/src/domains/events/event.publisher.ts` - Core publishing logic
- `/src/domains/events/event.service.ts` - Query and management helpers

### Core Function: `publishEvent()`

```typescript
import { publishEvent } from '@/domains/events/event.publisher'

await publishEvent({
  eventName: 'lead_validated',
  objectType: 'lead',
  objectId: leadId,
  payload: {
    score: 85,
    source: 'website',
  },
  actorType: 'user',
  actorId: userId,
}, ctx)
```

### Event Contract
- **eventName**: Must be from `EVENT_NAMES` constant
- **objectType**: Canonical entity type (lead, trade, deal, etc.)
- **objectId**: UUID of the affected entity
- **payload**: Structured data specific to the event
- **actorType**: 'user' | 'agent' | 'system'
- **actorId**: Optional UUID of the actor
- **traceId**: Optional correlation ID for distributed tracing

### When to Publish Events
- State transitions (lead_validated, deal_funded)
- Important business actions (appointment_booked, quote_sent)
- Approval state changes (approval_granted, approval_denied)
- Integration sync state changes (integration_sync_failed)

---

## Audit Logging Service

### Location
- `/src/domains/audit/audit.types.ts` - Type definitions
- `/src/domains/audit/audit.service.ts` - Core logging logic

### Core Function: `writeAuditLog()`

```typescript
import { writeAuditLog } from '@/domains/audit/audit.service'

await writeAuditLog({
  action: 'trade_value_updated',
  objectType: 'trade_appraisal',
  objectId: tradeId,
  before: { proposedValue: 5000 },
  after: { proposedValue: 5500 },
  userId: managerId,
  userRole: 'sales_manager',
  confidenceScore: 0.95,
  requiresReview: false,
}, ctx)
```

### Audit Contract
- **action**: Descriptive action name
- **objectType**: Entity type being modified
- **objectId**: UUID of the entity
- **before**: Snapshot before the change
- **after**: Snapshot after the change
- **userId**: Who made the change
- **userRole**: Role of the actor
- **confidenceScore**: Optional AI confidence (0-1)
- **requiresReview**: Flag for low-confidence actions

### When to Audit
- All mutations that change financial values
- Approval state transitions
- AI-generated outputs
- Sensitive data modifications

---

## Approval Service

### Location
- `/src/domains/approvals/approval.types.ts` - Type definitions
- `/src/domains/approvals/approval.policy.ts` - Policy evaluation logic
- `/src/domains/approvals/approval.service.ts` - CRUD operations

### Core Functions

#### Request Approval
```typescript
import { requestApproval } from '@/domains/approvals/approval.service'

await requestApproval({
  type: 'trade_value_change',
  requestedByUserId: salesRepId,
  linkedEntityType: 'trade_appraisal',
  linkedEntityId: tradeId,
  description: 'Trade value increased by $600 to meet customer expectation',
}, ctx)
```

#### Approve/Deny Request
```typescript
import { approveRequest, denyRequest } from '@/domains/approvals/approval.service'

await approveRequest({
  approvalId: approvalId,
  action: 'grant',
  userId: managerId,
  userRole: 'sales_manager',
  notes: 'Approved based on KBB valuation',
}, ctx)
```

### Approval Policy

The approval policy determines which roles can approve which types of approvals:

```typescript
import { canUserApprove } from '@/domains/approvals/approval.policy'

const canApprove = canUserApprove({ role: 'gsm' }, 'trade_value_change')
```

#### Approval Types
- **trade_value_change**: Requires GSM, GM, Sales Manager, or Used Car Manager
- **financial_output_change**: Requires GSM, GM, Sales Manager, or F&I Manager
- **ai_action_review**: Requires GSM, GM, or F&I Manager
- **generic**: Requires GSM, GM, or Owner

### Approval State Machine
1. `pending` → Initial state when requested
2. `granted` → Approved by authorized role
3. `denied` → Denied by authorized role

---

## Integration Sync Service

### Location
- `/src/domains/integrations/integration.types.ts` - Type definitions
- `/src/domains/integrations/integration.service.ts` - Sync state management

### Core Functions

#### Upsert Sync State
```typescript
import { upsertSyncState } from '@/domains/integrations/integration.service'

await upsertSyncState({
  sourceSystem: 'crm',
  targetSystem: 'dms',
  objectType: 'customer',
  objectId: customerId,
  status: 'pending',
})
```

#### Mark Success/Failure
```typescript
import { markSyncSuccess, markSyncFailed } from '@/domains/integrations/integration.service'

await markSyncSuccess('crm', 'dms', 'customer', customerId)

await markSyncFailed('crm', 'dms', 'customer', customerId, 'Connection timeout')
```

### Sync State Contract
- **sourceSystem**: Origin system identifier
- **targetSystem**: Destination system identifier
- **objectType**: Type of entity being synced
- **objectId**: UUID of the entity
- **status**: 'pending' | 'syncing' | 'success' | 'failed' | 'recovering'
- **errorCount**: Incremented on each failure
- **retryBackoffSeconds**: Exponential backoff for retries

### Failure Recovery
- Failed syncs trigger `integration_sync_failed` event
- Successful recovery triggers `integration_sync_recovered` event
- Exponential backoff: min(2^errorCount * 60, 3600) seconds

---

## Service Context Pattern

All infrastructure services support an optional `ServiceContext` parameter:

```typescript
interface ServiceContext {
  actorType: 'user' | 'agent' | 'system'
  actorId?: string
  actorRole?: string
  source?: string
  requiresAudit?: boolean
}
```

This allows services to:
- Track who performed the action
- Default actor information when not explicitly provided
- Enable/disable audit logging per-call
- Track the source system for distributed operations

---

## Error Handling

All services return `ServiceResult<T>`:

```typescript
const result = await publishEvent({...})

if (result.ok) {
  console.log('Success:', result.value)
} else {
  console.error('Error:', result.error.code, result.error.message)
}
```

Error codes are consistent and descriptive:
- `EVENT_PUBLISH_FAILED`
- `AUDIT_LOG_FAILED`
- `APPROVAL_NOT_FOUND`
- `INSUFFICIENT_PERMISSION`
- `SYNC_STATE_NOT_FOUND`

---

## Future Domain Services

Future domain services (leads, trades, deals, etc.) should:

1. **Import infrastructure services**:
   ```typescript
   import { publishEvent } from '@/domains/events/event.publisher'
   import { writeAuditLog } from '@/domains/audit/audit.service'
   import { requestApproval } from '@/domains/approvals/approval.service'
   ```

2. **Return ServiceResult**:
   ```typescript
   export async function updateLead(...): Promise<ServiceResult<Lead>> {
     // ...
   }
   ```

3. **Accept ServiceContext**:
   ```typescript
   export async function updateLead(
     leadId: UUID,
     updates: Partial<Lead>,
     ctx: ServiceContext
   ): Promise<ServiceResult<Lead>>
   ```

4. **Publish events for state changes**
5. **Write audit logs for mutations**
6. **Request approvals when policy requires**
7. **Track integration sync state**

---

## Testing Infrastructure

All infrastructure services have unit tests in `/tests/unit/`:
- `events.publisher.test.ts`
- `audit.service.test.ts`
- `approval.policy.test.ts`
- `integration.service.test.ts`

Tests validate:
- Correct payload shapes
- State transitions
- Policy evaluation
- Error handling
