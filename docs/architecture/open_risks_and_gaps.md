# Open Risks and Gaps

## Architectural Risks

### 1. No Route Guards in Practice
- `GuardedRoute` component exists in `src/app/routes/guards.tsx`
- Not wired into `AppShell.tsx` — all routes accessible to all roles
- **Mitigation**: Role-based nav filtering hides unauthorized routes in sidebar
- **Risk level**: Medium — sidebar hides routes but URL-direct access is not blocked

### 2. Single Bundle Size
- JS bundle is 506KB (gzip: 144KB)
- Will grow as more domain logic is added
- **Mitigation**: Code splitting via dynamic imports in Phase 2
- **Risk level**: Low for Phase 1

### 3. Mock Data Coupling
- Some pages still import directly from `mockData.ts` instead of hooks
- Query hooks exist but aren't consumed by all pages yet
- **Mitigation**: Hooks are ready; refactoring pages to use them is straightforward
- **Risk level**: Low — no data integrity risk, just technical debt

### 4. No Error Boundaries on Pages
- `ErrorFallback` exists at the app level but individual pages can still crash
- **Mitigation**: Pages use safe patterns (fallback to first mock item)
- **Risk level**: Low

## Feature Gaps

### 5. No Mutations
- All pages are read-only
- Approval Queue has mock approve/deny (local state only)
- Workstation has mock card movement (local state only)
- No create/update/delete operations persist to storage

### 6. Command Palette Non-Functional
- Shell is rendered but search has no backend
- Needs record search, action shortcuts, and navigation

### 7. No Notifications
- No toast/snackbar system for user feedback
- No real-time event notifications

### 8. Auth Not Connected
- AuthProvider exists but demo mode uses `defaultRole` prop
- Spark auth (`spark.user()`) not called in production flow
- Role switching is for demo purposes only

## Documentation Gaps

### 9. Service Layer Contracts
- `docs/architecture/service_layer_contracts.md` describes planned services
- None are implemented yet — only type definitions exist
- Could mislead reviewers into thinking services are real

### 10. Phase Migration Notes
- `phase2_migration_notes.md`, `phase3_migration_notes.md`, `phase4_migration_notes.md` exist
- They describe future plans, not current state
- Could be confused with implemented features

## Recommended Priorities for Next Phase

1. **Wire route guards** — enforce permission checks on URL-direct access
2. **Migrate pages to hooks** — remove direct mock imports from page files
3. **Add mutations** — CRUD operations through Spark KV
4. **Implement command palette** — record search + action shortcuts
5. **Code split** — lazy load page components for smaller initial bundle
