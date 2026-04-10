# Prompt 11 — Permission Guards and Route Enforcement

Turn the route map and permission model into real enforcement instead of documentation-only intent.

## Goals

- enforce route access based on role and permission helpers
- ensure ops, settings, approvals, and workstation behavior respect permissions
- stop relying on nav visibility alone for access control

## Tasks

1. Audit current route definitions, route guards, and permission helpers.
2. Enforce `requiredPermission` and executive-only route flags where defined.
3. Add denied-access handling that is clean, intentional, and premium.
4. Ensure workstation, approvals, audit, and settings pages use permission checks consistently.
5. Add or update:
   - `/docs/architecture/route_permission_enforcement.md`

## Rules

- do not scatter permission checks randomly across page bodies if centralized guards can handle them
- do not make workstation a permission bypass
- preserve current routing structure where possible

## Deliverable

- real route permission enforcement
- denied-access states
- docs explaining route enforcement model
