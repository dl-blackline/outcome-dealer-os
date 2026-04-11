# Mock vs Runtime Matrix — Phase 3

> Last updated: Phase 3, Prompt 20

This matrix shows which surfaces use mock data directly vs. runtime services.

## Legend
- ✅ = Uses runtime service / domain adapter
- ⚠️ = Runtime service exists but UI bypasses it
- ❌ = Pure mock / inline data only

## Entity × Surface Matrix

| Entity | List Page | Detail Page | Domain Service | Domain Query Hook | Dashboard | Command Palette | Workstation | Event Explorer | Approval Queue |
|---|---|---|---|---|---|---|---|---|---|
| **Leads** | ❌ MOCK_LEADS | ❌ MOCK_LEADS | ⚠️ lead.service.ts exists | ❌ useLeads() → mock | ❌ MOCK_LEADS | ❌ MOCK_LEADS | N/A | ❌ MOCK_EVENTS | N/A |
| **Deals** | ❌ MOCK_DEALS | ❌ MOCK_DEALS | ⚠️ deal types only | ❌ useDeals() → mock | ❌ MOCK_DEALS | ❌ MOCK_DEALS | N/A | ❌ MOCK_EVENTS | N/A |
| **Inventory** | ❌ MOCK_INVENTORY | ❌ MOCK_INVENTORY | ⚠️ inventory.service.ts exists | ❌ useInventory() → mock | ❌ MOCK_INVENTORY | ❌ MOCK_INVENTORY | N/A | N/A | N/A |
| **Households** | ❌ inline mock | ❌ inline mock (different shape) | ⚠️ household.service.ts exists | ❌ useHouseholds() → mock | N/A | N/A | N/A | N/A | N/A |
| **Approvals** | N/A | N/A | ✅ approval.service.ts (KV) | ❌ useApprovals() → mock | ❌ MOCK_APPROVALS | N/A | N/A | N/A | ❌ MOCK_APPROVALS + local state |
| **Events** | N/A | N/A | ✅ event.service.ts (KV) | ❌ useEvents() → mock | N/A | N/A | N/A | ❌ MOCK_EVENTS | N/A |
| **Audit** | N/A | N/A | ✅ audit.service.ts (KV) | N/A | N/A | N/A | N/A | N/A | N/A |
| **Workstation** | N/A | N/A | ✅ workstation.service.ts (KV) | ❌ useWorkstationCards() → mock | N/A | N/A | ⚠️ uses local state, not service | N/A | N/A |
| **Integrations** | N/A | N/A | ✅ integration.service.ts (KV) | N/A | N/A | N/A | N/A | N/A | N/A |

## Summary

- **Runtime services that exist but are unused by UI**: workstation, approvals, events, audit, integrations
- **Pages that bypass domain hooks**: DashboardPage, all record pages import MOCK_* directly
- **Domain hooks that exist but wrap mock data**: all hooks in useDomainQueries.ts
- **Critical gap**: UI and services are disconnected — the runtime layer is real but the presentation layer doesn't use it
