# Admin Surface Model

## Overview

Admin surfaces in Outcome Dealer OS provide operational visibility and configuration
for system administrators, owners, and managers.

## Current Admin Pages

### Roles & Permissions (`/app/settings/roles`)

**Purpose**: Display all 14 application roles with their permission assignments.

**Current capabilities**:
- View all roles with human-readable labels and descriptions
- Expand any role to see assigned permissions and navigation access
- Permission badges with readable names
- Navigation group badges showing which app sections each role can access

**What it shows**:
- Role name and description (operational context for each role)
- Number of permissions per role
- Full permission list on expand
- Navigation access groups (dashboard, records, operations, settings, workstation)

**Limitations**:
- Read-only — no role editing or permission reassignment in UI
- No user-to-role assignment interface
- No audit trail of role changes

### Integrations (`/app/settings/integrations`)

**Purpose**: Display external system connections and sync health.

**Current capabilities**:
- View all integrations with type, status, and last sync time
- Status indicators: healthy (green), degraded (yellow), failed (red), recovering (blue)
- Error count display for problematic integrations
- Integration architecture explanation (backoff, event generation, recovery)
- Per-integration notes describing data flow direction

**Integrations displayed**:
- Dealer Management System (DMS) — two-way sync
- Credit Bureau API — pull-only
- Lender Portal — submit/receive with status alerts
- Marketing Platform — one-way inbound

**Limitations**:
- No manual sync trigger
- No integration configuration editing
- No webhook management
- No connection test capability

## Access Control

Admin pages are only visible to roles with the `settings` nav group:
- owner
- gm
- gsm
- admin

## Role Model Architecture

```
roles.ts         → Role definitions, labels, nav groups
permissions.ts   → Permission enum, role-to-permission mapping
policy.ts        → Approval type definitions, policy evaluators
```

## Future Admin Capabilities

1. **User management**: Assign users to roles
2. **Permission editor**: Adjust role permissions (with audit trail)
3. **Integration configuration**: Set up new integrations, manage credentials
4. **Environment settings**: Configure KV store connection, feature flags
5. **Audit viewer**: Admin-specific audit log filtered to configuration changes
