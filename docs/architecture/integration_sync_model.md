# Integration Sync Model

## Overview

The integration sync service tracks the synchronization state between Outcome Dealer OS and external systems. It provides visibility into sync health, failure recovery, and retry logic.

---

## Sync State Model

### Core Concept

Each sync operation is tracked by a unique combination of:
- **Source System**: Where the data originates
- **Target System**: Where the data is being sent
- **Object Type**: The type of entity (customer, lead, deal, etc.)
- **Object ID**: The specific entity UUID

### Example

```typescript
{
  sourceSystem: 'crm',
  targetSystem: 'dms',
  objectType: 'customer',
  objectId: 'cust-123',
  status: 'success',
  lastSuccessfulSyncAt: '2025-01-15T10:30:00Z',
  errorCount: 0,
}
```

---

## Sync States

### State Machine

```
pending ──> syncing ──┬──> success
                      │
                      └──> failed ──> recovering ──> success
```

### State Definitions

- **pending**: Sync queued but not yet attempted
- **syncing**: Sync in progress
- **success**: Last sync completed successfully
- **failed**: Last sync attempt failed
- **recovering**: Previously failed, now retrying

---

## Sync Operations

### Upsert Sync State

Create or update a sync state record:

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

### Mark Sync Success

Update sync state after successful sync:

```typescript
import { markSyncSuccess } from '@/domains/integrations/integration.service'

await markSyncSuccess('crm', 'dms', 'customer', customerId)
```

**Effects**:
- Sets `status` to 'success'
- Updates `lastSuccessfulSyncAt` to now
- Resets `errorCount` to 0
- Clears `lastErrorMessage`
- Resets `retryBackoffSeconds` to 0
- Publishes `integration_sync_recovered` event (if previously failed)

### Mark Sync Failed

Update sync state after failed sync:

```typescript
import { markSyncFailed } from '@/domains/integrations/integration.service'

await markSyncFailed('crm', 'dms', 'customer', customerId, 'Connection timeout')
```

**Effects**:
- Sets `status` to 'failed'
- Increments `errorCount`
- Sets `lastErrorMessage`
- Calculates exponential backoff: `min(2^errorCount * 60, 3600)` seconds
- Publishes `integration_sync_failed` event

### List Failed Syncs

Query all failed sync states:

```typescript
import { listFailedSyncs } from '@/domains/integrations/integration.service'

const failed = await listFailedSyncs()
```

Use this for:
- Operations dashboard
- Retry queues
- Alert systems

---

## Retry Logic

### Exponential Backoff

Failed syncs use exponential backoff to avoid overwhelming the target system:

```
Attempt 1: 60 seconds
Attempt 2: 120 seconds
Attempt 3: 240 seconds
Attempt 4: 480 seconds
Attempt 5: 960 seconds
Attempt 6+: 3600 seconds (1 hour max)
```

Formula: `min(2^errorCount * 60, 3600)`

### Retry Implementation

Domain services should check `retryBackoffSeconds` before retrying:

```typescript
const syncState = await findSyncState(...)

if (syncState.status === 'failed') {
  const now = new Date()
  const lastAttempt = new Date(syncState.lastAttemptAt)
  const secondsSinceAttempt = (now - lastAttempt) / 1000

  if (secondsSinceAttempt < syncState.retryBackoffSeconds) {
    // Too soon to retry
    return
  }

  // Attempt retry
  try {
    await syncToTargetSystem(...)
    await markSyncSuccess(...)
  } catch (error) {
    await markSyncFailed(..., error.message)
  }
}
```

---

## Integration with Event System

### Events Published

#### `integration_sync_failed`

Published when a sync attempt fails:

```typescript
{
  eventName: 'integration_sync_failed',
  objectType: 'integration_sync_state',
  objectId: syncStateId,
  payload: {
    sourceSystem: 'crm',
    targetSystem: 'dms',
    objectType: 'customer',
    entityId: customerId,
    errorMessage: 'Connection timeout',
    errorCount: 3,
  },
}
```

Use cases:
- Alert operations team
- Trigger retry queue
- Log to monitoring system

#### `integration_sync_recovered`

Published when a previously failed sync succeeds:

```typescript
{
  eventName: 'integration_sync_recovered',
  objectType: 'integration_sync_state',
  objectId: syncStateId,
  payload: {
    sourceSystem: 'crm',
    targetSystem: 'dms',
    objectType: 'customer',
    entityId: customerId,
  },
}
```

Use cases:
- Notify operations team
- Update health dashboards
- Log recovery metrics

---

## Common Integration Patterns

### Pattern: Sync on Entity Creation

```typescript
export async function createCustomer(
  customerData: CustomerInput,
  ctx: ServiceContext
): Promise<ServiceResult<Customer>> {
  // 1. Create customer in CRM
  const customer = await insert('customers', customerData)

  // 2. Create sync state
  await upsertSyncState({
    sourceSystem: 'crm',
    targetSystem: 'dms',
    objectType: 'customer',
    objectId: customer.id,
    status: 'pending',
  })

  // 3. Trigger async sync
  syncCustomerToDMS(customer.id)

  return ok(mapRowToDomain(customer))
}

async function syncCustomerToDMS(customerId: UUID) {
  try {
    await upsertSyncState({
      sourceSystem: 'crm',
      targetSystem: 'dms',
      objectType: 'customer',
      objectId: customerId,
      status: 'syncing',
    })

    const customer = await findById('customers', customerId)
    await dmsClient.createCustomer(customer)

    await markSyncSuccess('crm', 'dms', 'customer', customerId)
  } catch (error) {
    await markSyncFailed('crm', 'dms', 'customer', customerId, error.message)
  }
}
```

### Pattern: Sync on Entity Update

```typescript
export async function updateCustomer(
  customerId: UUID,
  updates: Partial<Customer>,
  ctx: ServiceContext
): Promise<ServiceResult<Customer>> {
  const updated = await update('customers', customerId, updates)

  // Mark sync as pending
  await upsertSyncState({
    sourceSystem: 'crm',
    targetSystem: 'dms',
    objectType: 'customer',
    objectId: customerId,
    status: 'pending',
  })

  // Trigger async sync
  syncCustomerToDMS(customerId)

  return ok(mapRowToDomain(updated))
}
```

### Pattern: Batch Sync Status Check

```typescript
export async function getSyncHealthStatus(): Promise<{
  healthy: number
  degraded: number
  failed: number
}> {
  const allSyncs = await findMany('integration_sync_states')

  return {
    healthy: allSyncs.filter(s => s.status === 'success').length,
    degraded: allSyncs.filter(s => s.status === 'recovering').length,
    failed: allSyncs.filter(s => s.status === 'failed').length,
  }
}
```

---

## System Identifiers

### Canonical System Names

- **crm**: Outcome Dealer OS (this system)
- **dms**: Dealer Management System
- **lender_portal**: Lender integration portals
- **credit_bureau**: Credit bureau APIs
- **marketing**: Marketing automation platform
- **accounting**: Accounting/ERP system

### Object Types

Match canonical entity types:
- customer
- lead
- trade_appraisal
- deal
- credit_app
- inventory_unit
- service_event

---

## Operations Dashboard

### Visibility Requirements

An operations dashboard should show:

1. **Sync Health Summary**
   - Total sync states by status
   - Failed syncs requiring attention
   - Longest-failing syncs

2. **Per-System Health**
   - Success rate by target system
   - Average sync latency
   - Error trends

3. **Failed Sync Details**
   - Entity type and ID
   - Error message
   - Error count and last attempt
   - Time until next retry

4. **Retry Actions**
   - Manual retry button
   - Bulk retry for specific system
   - Mark as resolved/ignored

---

## Monitoring and Alerts

### Alert Thresholds

- **Critical**: Any sync with errorCount >= 5
- **Warning**: Any sync failed for > 1 hour
- **Info**: Sync recovered after failure

### Metrics to Track

- Sync success rate (by system, by object type)
- Average time to recovery
- Error frequency by message
- Backoff time distribution

---

## Future Enhancements (PR 7+)

1. **Webhook Support**: Receive sync confirmations from target systems
2. **Bidirectional Sync**: Track syncs in both directions
3. **Conflict Resolution**: Handle concurrent updates
4. **Sync Scheduling**: Configure sync frequency per entity type
5. **Data Transformation**: Store mapping rules for each integration
6. **Sync Analytics**: Track performance, identify bottlenecks
7. **Manual Sync UI**: Allow operators to trigger syncs on demand
