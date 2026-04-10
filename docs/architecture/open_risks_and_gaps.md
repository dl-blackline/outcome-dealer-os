# Open Risks and Gaps — Phase 2 Complete

## Resolved in Phase 2

| Risk | Resolution |
|------|-----------|
| No route guards in practice | Route guards enforced in AppShell with AccessDenied component |
| Auth not connected | AuthProvider wired as single source of truth |
| Command palette non-functional | Full search across pages and records with keyboard nav |
| No notifications | Event-driven notification center |
| Dashboard not role-aware | Centralized dashboard adapters with role-specific metrics |
| Workstation local-only | KV-persisted workstation service |
| Auto-card rules disconnected | Event bus connects events to auto-card generation |
| Record pages silent fallback | RecordNotFound component for explicit not-found handling |
| Approval actions local-only | Approve/deny call real services + emit events |

## Remaining Risks

### Architectural

1. **Single Bundle Size** — 542KB JS (gzip 152KB). Needs code splitting for production. (Medium risk)
2. **Mock Data Coupling** — Some pages still import directly from mockData.ts. Query hooks exist but not all pages use them consistently. (Low risk)
3. **No Error Boundaries on Pages** — ErrorFallback at app level only, individual pages don't have recovery. (Low risk)
4. **KV Session Scope** — Spark KV is session-scoped, so workstation cards and events reset on full app reload. (Acceptable for demo)

### Feature Gaps

5. **No Mutations on Records** — Lead, deal, inventory, household pages are read-only. No create/edit/delete. (Phase 3)
6. **No Drag-and-Drop** — Workstation uses move buttons, not drag-and-drop. (Phase 3)
7. **No Real API Integration** — All data is mock. Service layer exists but connects to KV, not real backend. (Phase 3)
8. **Audit Explorer Reads Events** — No separate audit mock/store. Audit explorer displays MOCK_EVENTS as proxy. (Phase 3)
9. **Integration Sync Visual-Only** — Sync buttons show animation but don't trigger real syncs. (Phase 3)
10. **No AI Agent Integration** — AI co-pilot features not implemented. (Phase 3+)

### Documentation Gaps

11. **Service Layer Contracts** — `service_layer_contracts.md` describes planned services, some now implemented, doc needs update. (Low risk)
12. **Phase Migration Notes** — Phase 2/3/4 migration notes may not reflect current state. (Low risk)

## Recommended Priorities for Phase 3

1. **Record CRUD** — Add create/edit/delete mutations to lead, deal, inventory pages
2. **Real Data Flow** — Wire record pages through service layer → KV for full lifecycle
3. **Code Splitting** — Dynamic imports for page-level chunks
4. **Audit Store Separation** — Separate audit log storage from event stream
5. **Drag-and-Drop Workstation** — Use react-beautiful-dnd or similar for card movement
6. **Integration Webhook Simulation** — Simulate real integration sync with delayed responses
