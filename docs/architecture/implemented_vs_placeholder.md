# Implemented vs Placeholder — Phase 2 Baseline

## Fully Implemented

| System | Location | Notes |
|--------|----------|-------|
| Role model | `domains/roles/` | 13 roles, labels, nav groups |
| Permission matrix | `domains/roles/permissions.ts` | 28 permissions mapped to all roles |
| Policy engine | `domains/roles/policy.ts` | `hasPermission`, `assertPermission`, `canApprove` |
| Event taxonomy | `domains/events/event.constants.ts` | 49 canonical event names |
| Canonical types | `domains/*/` | 30+ typed business objects across 21 domains |
| Hash router | `app/router/` | Custom context-based router with param extraction |
| App shell | `app/AppShell.tsx` | Sidebar + topbar + main content area |
| Core UI components | `components/core/` | StatusPill, EntityBadge, EmptyState, SectionHeader |
| Workstation UI | `components/workstation/` | Board, card drawer, filters, quick create |
| Auto-card rules | `domains/workstation/workstation.autoCardRules.ts` | 9 event-to-card mappings |
| Domain query hooks | `hooks/useDomainQueries.ts` | Consistent QueryResult<T> pattern |
| DB adapter | `lib/db/` | KV-backed CRUD via spark.kv |
| Auth service | `domains/auth/auth.service.ts` | Spark user resolution, role mapping |
| Auth provider | `domains/auth/auth.store.tsx` | Full context with hooks |
| Approval service | `domains/approvals/approval.service.ts` | Full CRUD with event/audit integration |
| Event publisher | `domains/events/event.publisher.ts` | Persists to KV |
| Audit service | `domains/audit/audit.service.ts` | Structured audit log writes |

## Placeholder / Shell Only

| System | Location | What's Missing |
|--------|----------|---------------|
| Command palette | `components/shell/CommandPalette.tsx` | No search, no navigation, no actions |
| Notification center | `components/shell/NotificationCenter.tsx` | Static "no notifications" message |
| Route guards | Defined in route defs | Not enforced — any role can access any URL |
| Auth integration | `App.tsx` / `AppShell.tsx` | AuthProvider not used; role is local useState |
| Dashboard role-awareness | `pages/DashboardPage.tsx` | Same dashboard for all roles |
| Record not-found | Record pages | Silent null return, no error/not-found UI |
| Approval UI actions | `ApprovalQueuePage.tsx` | Approve/deny mutate local state only |
| Workstation persistence | `WorkstationPage.tsx` | Cards in local useState, reset on reload |
| Event-to-card execution | Auto-card rules | Rules defined but never triggered at runtime |
| Settings pages | `pages/settings/` | Read-only displays of roles and integrations |

## Mock-Driven (Working but Fake Data)

| System | Mock Source | Notes |
|--------|------------|-------|
| All record pages | `mockData.ts` + `useDomainQueries.ts` | 4 leads, 3 deals, 4 inventory, 4 households |
| Dashboard metrics | `mockData.ts` direct imports | Hardcoded count strings |
| Event explorer | `MOCK_EVENTS` | 6 sample events |
| Audit explorer | `MOCK_EVENTS` (reused) | No separate audit mock |
| Approval queue | `MOCK_APPROVALS` | 3 sample approvals |
| Workstation cards | `workstation.mock.ts` | 8 sample cards |
