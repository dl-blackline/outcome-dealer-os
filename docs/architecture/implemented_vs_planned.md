# Implemented vs Planned

## Production-Leaning (Implemented)

| System | Status | Files |
|--------|--------|-------|
| **Auth domain** | Complete | `src/domains/auth/` — types, service, store, permissions |
| **Role model** | Complete | `src/domains/roles/` — 13 roles, 28 permissions, policy engine |
| **Event taxonomy** | Complete | `src/domains/events/` — 49 canonical events |
| **Canonical types** | Complete | `src/types/canonical.ts` — 30+ business objects |
| **Hash router** | Complete | `src/app/router/` — provider, hook, param extraction |
| **App shell** | Complete | Sidebar, Topbar, CommandPalette, role switching |
| **Workstation board** | Complete | Board, columns, cards, drawer, filters, quick create |
| **Auto-card rules** | Complete | 9 event-to-card rules, centralized in one file |
| **Record list pages** | Complete | Households, Leads, Deals, Inventory — with search/filter |
| **Record detail pages** | Complete | All 4 with summary cards, linked records, timelines |
| **Ops pages** | Complete | Event Explorer, Approval Queue, Audit Explorer |
| **Settings pages** | Complete | Roles viewer, Integrations status |
| **Governance components** | Complete | Reusable approval/audit/event UI |
| **Domain query hooks** | Complete | `useDomainQueries.ts` with QueryResult pattern |
| **DB adapter** | Complete | Spark KV-based CRUD with mappers |
| **Architecture docs** | Complete | 20+ docs covering all systems |

## Still Mock / Placeholder

| System | Status | Notes |
|--------|--------|-------|
| **Command palette** | Shell only | Search input renders but has no functionality |
| **Real API integration** | Not started | All data is mock; hooks ready for adapter swap |
| **Mutation operations** | Not started | Pages are read-only; no create/update/delete |
| **Drag-and-drop** | Not started | Workstation uses move buttons, not DnD |
| **Route guards** | Defined, not wired | `GuardedRoute` exists but isn't used in AppShell |
| **AI agent integration** | Types only | Event system supports `actorType: 'agent'` but no AI calls |
| **Notification system** | Not started | No toast/notification infrastructure |
| **Service layer** | Types only | Domain services defined in contracts, not implemented |

## Planned (Phase 2-3)

- Live data via Spark KV or Supabase
- AI scoring, routing, and appraisal assists
- Command palette with record search
- Drag-and-drop on workstation
- Voice workflow integrations
- Campaign execution and attribution tracking
- Photo gallery for inventory
