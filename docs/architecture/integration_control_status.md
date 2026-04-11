# Integration Control Status

## Overview

Integration sync state is managed by `src/domains/integrations/integration.service.ts`
and displayed on the Integrations settings page.

## Current Integrations

| Name | Type | Direction | Status |
|------|------|-----------|--------|
| Dealer Management System | `dms` | Two-way | Healthy |
| Credit Bureau API | `credit_bureau` | Pull-only | Healthy |
| Lender Portal | `lender_portal` | Submit + receive | Degraded |
| Marketing Platform | `marketing` | One-way inbound | Healthy |

## Sync State Machine

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐
│ pending │────>│ syncing │────>│ success  │     │ failed │
└─────────┘     └─────────┘     └──────────┘     └────────┘
                    │                                  │
                    └──────────>┌────────────┐<────────┘
                                │ recovering │
                                └────────────┘
```

## Error Handling

- **Consecutive failures**: Tracked per-object
- **Backoff**: Exponential — `baseDelay * 2^(consecutiveFailures - 1)`
- **Failed threshold**: After 5+ consecutive errors, sync state enters `failed`
- **Recovery**: Successful sync after failure triggers `integration_sync_recovered` event

## Event Generation

| Event | Trigger |
|-------|---------|
| `integration_sync_failed` | Sync enters failed state (5+ errors) |
| `integration_sync_recovered` | Successful sync after recovery |

Both events auto-generate workstation cards via auto-card rules.

## Service API

```typescript
interface IntegrationService {
  createSyncState(objectId: string, objectType: string): SyncState
  markSuccess(objectId: string): SyncState
  markFailed(objectId: string, error: string): SyncState
  listFailed(): SyncState[]
  getSyncState(objectId: string): SyncState | null
}
```

## UI Display

The IntegrationsSettingsPage shows:
1. Integration cards with status pills
2. Type badge per integration
3. Last sync timestamp
4. Error count (highlighted when > 0)
5. Per-integration operational notes
6. Sync architecture explanation section

## Limitations

- No manual sync trigger from UI
- No credential management
- No webhook configuration
- Sync state is per-object, not per-integration in the service layer
- UI displays are from seeded mock data, not from the runtime service
