# Implemented vs Placeholder — Phase 2 Complete

## Fully Implemented and Connected

| System | Location | Phase 2 Changes |
|--------|----------|-----------------|
| Role model | `domains/roles/` | Unchanged — 13 roles, labels, nav groups |
| Permission matrix | `domains/roles/permissions.ts` | Unchanged — 28 permissions |
| Policy engine | `domains/roles/policy.ts` | Unchanged |
| Event taxonomy | `domains/events/event.constants.ts` | Unchanged — 49 events |
| Hash router | `app/router/` | Route permissions now enforced |
| App shell | `app/AppShell.tsx` | Auth context, route guards, notification center, ⌘K shortcut |
| Auth provider | `domains/auth/auth.store.tsx` | **Now wired** — single source of truth for role/user |
| Route guards | `app/AppShell.tsx` | **New** — AccessDenied component on permission failure |
| Workstation service | `domains/workstation/workstation.service.ts` | **New** — KV-persisted CRUD |
| Event bus | `domains/events/event.bus.ts` | **New** — emitEvent() → persist + auto-card + notify |
| Auto-card execution | Event bus + workstation.autoCardRules | **Now connected** — events trigger card generation |
| Approval actions | `pages/ops/ApprovalQueuePage.tsx` | **Connected** — calls real services + emits events |
| Command palette | `components/shell/CommandPalette.tsx` | **Functional** — searches pages and records |
| Notifications | `components/shell/NotificationCenter.tsx` | **Functional** — event-driven with severity levels |
| Dashboard adapters | `domains/dashboard/dashboard.adapters.ts` | **New** — role-aware metric derivation |
| Record not-found | `components/core/RecordNotFound.tsx` | **New** — explicit not-found handling |
| Settings pages | `pages/settings/` | **Enhanced** — auth-aware roles, integration actions |

## Still Mock-Driven (Working UI, Fake Data)

| System | Mock Source | Notes |
|--------|------------|-------|
| Record list pages | `mockData.ts` | Leads, deals, inventory, households |
| Record detail pages | `mockData.ts` | Now with proper not-found handling |
| Event explorer | `MOCK_EVENTS` | 6 sample events |
| Audit explorer | `MOCK_EVENTS` | Reused as audit proxy |
| Workstation initial data | `workstation.mock.ts` | Auto-seeded into KV on first load |
| Dashboard data | `dashboard.adapters.ts` → `mockData.ts` | Role-aware but from mock arrays |
| Notifications | `MOCK_EVENTS` | Derived from event mock data |

## Not Implemented

- Real API integration (all data is mock)
- Drag-and-drop workstation
- AI agent integration
- Campaign execution
- Multi-store support
- Real-time WebSocket notifications
- Code splitting
