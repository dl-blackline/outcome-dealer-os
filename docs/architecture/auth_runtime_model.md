# Auth Runtime Model

## Architecture

```
App.tsx
  └─ AuthProvider (src/domains/auth/auth.store.tsx)
       └─ RouterProvider
            └─ AppShell
                 ├─ reads user/role from useAuth()
                 ├─ AppSidebar (currentRole from auth)
                 ├─ Topbar (role switcher calls setRole → AuthProvider)
                 └─ Pages (can call useAuth/useCurrentUser)
```

## Auth Flow

1. `AuthProvider` initializes with `defaultRole='gm'`
2. On mount, calls `AuthService.resolveCurrentUser(role)` which fetches from `spark.user()`
3. Maps to `CurrentAppUser` with role-based permissions from `ROLE_PERMISSIONS`
4. Exposes via React context: `{ status, user, error, setRole, signOut, refreshUser }`
5. `AppShell` reads `user.role` from `useAuth()` — no more local `useState`
6. Topbar role switcher calls `setRole()` which updates the AuthProvider context

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth()` | Full auth context — status, user, setRole, signOut |
| `useCurrentUser()` | Returns `CurrentAppUser` or throws if not authenticated |
| `useRequireAuth()` | Alias for `useCurrentUser()` |

## Dev Role Override

The Topbar role switcher is a **development override** — it calls `auth.setRole(role)` which:
1. Updates `currentRole` in AuthProvider state
2. Re-calls `AuthService.resolveCurrentUser(newRole)`
3. Rebuilds `CurrentAppUser` with the new role's permission set
4. All consumers of `useAuth()` re-render with the new role

This is labeled "Switch Role (Dev Only)" in the UI to make the override intent clear.

## Single Source of Truth

- **Before Phase 2**: `AppShell` held role in `useState`, Topbar updated it locally
- **After Phase 2**: `AuthProvider` is the single source. AppShell, sidebar, topbar, pages, and route guards all read from the same context.
