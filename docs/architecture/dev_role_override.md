# Dev Role Override

## What It Is

The Topbar includes a "Switch Role (Dev Only)" dropdown that allows switching the current user's role at runtime. This is a **development and demonstration tool**, not a production feature.

## How It Works

1. User clicks role dropdown in Topbar
2. Topbar calls `onRoleChange(role)` → `auth.setRole(role)`
3. AuthProvider re-resolves the current user with the new role
4. All permission checks, sidebar visibility, and page behavior update automatically

## Where It Lives

- **UI**: `src/components/shell/Topbar.tsx` — dropdown labeled "Switch Role (Dev Only)"
- **State**: `src/domains/auth/auth.store.tsx` — `setRole()` method on AuthProvider
- **Resolution**: `src/domains/auth/auth.service.ts` — `resolveCurrentUser(role)`

## Why It Exists

- Allows rapid testing of all 13 roles without multiple accounts
- Demonstrates role-aware UI behavior (sidebar, dashboards, permissions)
- Will be replaced by stored role assignment from user profiles or HR integration

## Production Path

In production, role would come from:
1. User profile stored in backend/KV
2. Organization membership and HR system sync
3. Admin assignment through settings UI

The dev switcher would be hidden behind a feature flag or removed entirely.
