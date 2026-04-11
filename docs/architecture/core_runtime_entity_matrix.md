# Core Runtime Entity Matrix

## Overview

This matrix maps each core entity to its runtime service, query hook, and current status.

## Entity × Layer Matrix

| Entity | Domain Service | Query Hook | Mutation Hook | KV Table | UI Pages |
|--------|---------------|------------|---------------|----------|----------|
| **Lead** | `lead.service.ts` | `useLeads()`, `useLead(id)` | — | `leads` | LeadListPage, LeadRecordPage |
| **Deal** | `deal.service.ts` | `useDeals()`, `useDeal(id)` | — | `deals` | DealListPage, DealRecordPage |
| **Inventory** | `inventory.service.ts` | `useInventory()`, `useInventoryUnit(id)` | — | `inventory` | InventoryListPage, InventoryUnitPage |
| **Household** | `household.service.ts` | `useHouseholds()`, `useHousehold(id)` | — | `households` | HouseholdListPage, HouseholdRecordPage |
| **Approval** | `approval.service.ts` | `useApprovals()` | `useApprovalMutations()` | `approvals` | ApprovalQueuePage |
| **Event** | `event.service.ts` | `useEvents()`, `useEntityEvents(id)` | — | `events` | EventExplorerPage |
| **Audit** | `audit.service.ts` | `useAuditLogs()` | — | `audit_log` | AuditExplorerPage |
| **Workstation Card** | `workstation.service.ts` | `useWorkstationCards()` | `useWorkstationMutations()` | `workstation_cards` | WorkstationPage |
| **Integration** | `integration.service.ts` | `useIntegrations()` | — | `integrations` | IntegrationsSettingsPage |
| **Task** | — (no service) | `useTasks()` | — | — | DashboardPage |
| **Service Event** | — (no service) | `useServiceEvents()` | — | — | — |

## Service Capabilities

### Fully Implemented Services

| Service | Operations | Events Published | Audit Written |
|---------|-----------|-----------------|---------------|
| `approval.service` | request, grant, deny, list, get | Yes (approval_requested, approval_granted, approval_denied) | Yes |
| `workstation.service` | list, get, create, move, update, complete | Yes (card lifecycle events) | Yes |
| `event.service` | publish, list, getByEntity | N/A (is the event system) | No |
| `audit.service` | write, list, getByEntity | No | N/A (is the audit system) |
| `integration.service` | create, markSuccess, markFailed, listFailed | Yes (sync_recovered, sync_failed) | No |
| `lead.service` | create, update, list, get | Yes (lead_created, lead_updated) | Yes |
| `deal.service` | create, update, list, get | Yes (deal events) | Yes |

### Not Yet Implemented

| Entity | Status | Priority |
|--------|--------|----------|
| Task | No domain service — inline mock data | Low |
| Service Event | No domain service — inline mock data | Low |

## Hook-to-Service Gap

Currently, hooks read from static seed data rather than calling domain services.
The `mock_elimination_plan.md` describes the transition path.

## Permission Enforcement

Domain services check permissions before mutations:

```typescript
// Example from approval.service.ts
if (!hasPermission(actor, 'approve_trade_values')) {
  throw new Error('Insufficient permissions')
}
```

UI pages rely on role-based navigation filtering to prevent unauthorized access to pages.
