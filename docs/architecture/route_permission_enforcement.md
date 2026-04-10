# Route Permission Enforcement

## How It Works

Route enforcement is centralized in `AppShell.tsx`. When the router resolves a path:

1. `findMatchingRoute(currentPath)` looks up the `RouteDefinition`
2. If the route has `requireExecutive: true`, the current user must be an executive role
3. If the route has `requiredPermission`, `canAccessRoute(user, permission)` checks the user's permission set
4. If denied, `<AccessDenied />` renders instead of the page component

## Permission Mapping

| Route | Required Permission | Executive Only |
|-------|-------------------|----------------|
| `/app/dashboard` | None (public) | No |
| `/app/workstation` | `manage_tasks` | No |
| `/app/records/households` | `view_leads` | No |
| `/app/records/leads` | `view_leads` | No |
| `/app/records/deals` | `view_desk_scenarios` | No |
| `/app/records/inventory` | `view_trades` | No |
| `/app/ops/events` | `view_audit_logs` | No |
| `/app/ops/approvals` | `view_approvals` | No |
| `/app/ops/audit` | `view_audit_logs` | No |
| `/app/settings/roles` | None | Yes (executive only) |
| `/app/settings/integrations` | `manage_integrations` | No |

## Executive Roles

Defined in `auth.permissions.ts`: `owner`, `gm`, `gsm`, `admin`

## Access Denied UI

`<AccessDenied />` component in `src/components/core/AccessDenied.tsx` shows:
- Shield icon
- "Access Denied" message
- "Go to Dashboard" button

## Sidebar Visibility

The sidebar already filters nav items by `ROLE_NAV_GROUPS`. Route guards add defense in depth — even if a user manually enters a URL, the permission check will deny access.

## Design Principles

- Centralized enforcement in the shell, not scattered in page bodies
- Sidebar visibility + route guards = two layers of access control
- Fail secure — missing user or permissions defaults to denied
- Workstation is accessible to all roles with `manage_tasks` (which all roles have)
