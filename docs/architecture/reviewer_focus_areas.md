# Reviewer Focus Areas

## High-Priority Review

### 1. Domain Type Correctness
- `src/types/canonical.ts` — 30+ business objects. Are fields correct for automotive retail?
- `src/domains/roles/permissions.ts` — Is the role-permission matrix accurate?
- `src/domains/events/event.constants.ts` — Do 49 events cover the full lifecycle?

### 2. Workstation Architecture
- `src/domains/workstation/workstation.types.ts` — Card model, linked objects, queues
- `src/domains/workstation/workstation.autoCardRules.ts` — Are the 9 rules correct?
- `src/components/workstation/WorkstationComponents.tsx` — Board, card, drawer UX

### 3. Router and Navigation
- `src/app/router/router.tsx` — Hash-based routing implementation
- `src/app/AppShell.tsx` — Route-to-component mapping
- `src/components/shell/AppSidebar.tsx` — Role-aware nav, workstation placement

### 4. Auth and Permissions
- `src/domains/auth/auth.store.tsx` — AuthProvider and role switching
- `src/domains/auth/auth.permissions.ts` — Permission checks and route access
- `src/app/routes/guards.tsx` — GuardedRoute component (not yet wired)

## Medium-Priority Review

### 5. Page Quality
- Record list pages: Do tables have the right columns?
- Record detail pages: Are linked records displayed correctly?
- Ops pages: Do event/audit/approval surfaces feel real?

### 6. Documentation Alignment
- `docs/architecture/` — 20+ docs. Do they match implemented code?
- `docs/product/north_star.md` — Does the implementation honor the north star?

### 7. Component Reuse
- `src/components/core/` — StatusPill, EntityBadge, EmptyState, SectionHeader
- `src/components/governance/` — ApprovalStatusBadge, EventRow, AuditRow
- Are components used consistently across pages?

## Low-Priority / Future

### 8. CSS and Theming
- `src/styles/theme.css` — Radix UI color imports (large file)
- `src/index.css` — oklch variables and dark mode
- Build output size (506KB JS, 368KB CSS) — acceptable for Phase 1

### 9. Bundle Optimization
- Single chunk exceeds 500KB — needs code splitting in Phase 2
- Icon proxy resolves all Phosphor imports — tree-shaking working
