# Auth and Access Model

## Overview

Outcome Dealer OS uses a **role-based access control (RBAC)** model with explicit permission grants. Authentication is handled through the Spark runtime's `spark.user()` API, which provides GitHub-based user identity. This document explains how authentication, authorization, and access control work together.

---

## Architecture Layers

### 1. Authentication Layer (`/src/domains/auth`)

The auth domain provides:
- **Auth Types**: Clean type definitions for user identity, session, and auth state
- **Auth Service**: Functions to fetch and normalize authenticated users
- **Auth Store**: React context and hooks for managing auth state
- **Auth Permissions**: Helper functions that bridge auth state with permission checks

### 2. Role & Permission Layer (`/src/domains/roles`)

The roles domain provides:
- **Role Definitions**: Canonical list of app roles (owner, gm, sales_rep, etc.)
- **Permission Definitions**: Complete permission catalog
- **Policy Functions**: Pure functions for permission checks (`hasPermission`, `canApprove`)

### 3. Route Guards (`/src/app/routes/guards.tsx`)

Route guards provide:
- **Guard Functions**: Composable access checks for routes
- **GuardedRoute Component**: React component for declarative route protection
- **Guard Results**: Structured responses with fallback paths

---

## Authentication Flow

### User Identity Resolution

```typescript
// 1. Fetch GitHub user from Spark runtime
const authUser = await spark.user()
// Returns: { id, login, email, avatarUrl, isOwner }

// 2. Combine with app role to create session user
const sessionUser = { ...authUser, role: 'sales_rep' }

// 3. Enrich with permissions to create current app user
const currentUser = {
  ...sessionUser,
  displayName: sessionUser.login,
  permissions: ROLE_PERMISSIONS[sessionUser.role]
}
```

### Auth State Management

The `AuthProvider` manages auth state using React context:

```typescript
<AuthProvider defaultRole="gm">
  <App />
</AuthProvider>
```

Components access auth state with hooks:

```typescript
// Get full auth context
const { user, status, setRole, signOut } = useAuth()

// Require authenticated user (throws if not authenticated)
const user = useCurrentUser()

// Check auth status
if (status === 'loading') return <Spinner />
if (status === 'unauthenticated') return <LoginPrompt />
```

---

## Authorization Flow

### Permission Checks

Permission checks flow through these layers:

**1. Component calls auth permission helper:**
```typescript
import { userHasPermission } from '@/domains/auth'

if (userHasPermission(user, 'approve_trade_values')) {
  // Show approve button
}
```

**2. Auth helper delegates to policy layer:**
```typescript
// auth.permissions.ts
export function userHasPermission(user, permission) {
  return hasPermission(user, permission)
}
```

**3. Policy layer checks role permission mapping:**
```typescript
// roles/policy.ts
export function hasPermission(user, permission) {
  const userPermissions = ROLE_PERMISSIONS[user.role]
  return userPermissions.includes(permission)
}
```

### Why Two Layers?

**Auth Layer** (`/src/domains/auth`):
- Knows about `CurrentAppUser` shape
- Provides React hooks and context
- Handles async auth operations
- Bridges UI and policy

**Policy Layer** (`/src/domains/roles`):
- Pure functions, no dependencies
- Works with minimal `PolicyUserLike` interface
- Easily testable
- Reusable across contexts

---

## Route Protection

### Basic Auth Guard

Require user to be authenticated:

```typescript
<GuardedRoute user={user} fallback={<AccessDenied />}>
  <Dashboard />
</GuardedRoute>
```

### Permission-Based Guard

Require specific permission:

```typescript
<GuardedRoute
  user={user}
  requiredPermission="view_executive_dashboard"
  fallback={<Redirect to="/app/dashboard" />}
>
  <ExecutiveDashboard />
</GuardedRoute>
```

### Executive-Only Guard

Restrict to executive roles:

```typescript
<GuardedRoute
  user={user}
  requireExecutive
  fallback={<AccessDenied />}
>
  <OwnerSettings />
</GuardedRoute>
```

### Programmatic Checks

Check access without rendering:

```typescript
import { checkPermissionGuard } from '@/app/routes/guards'

const result = checkPermissionGuard(user, 'manage_integrations')
if (!result.allowed) {
  console.log(result.reason)
  navigate(result.fallbackPath)
}
```

---

## Service Layer Integration

Domain services should assert permissions at their boundaries:

```typescript
import { assertUserPermission } from '@/domains/auth'

export class LeadService {
  async assignLead(user: CurrentAppUser, leadId: string, repId: string) {
    // Assert permission before executing
    assertUserPermission(user, 'assign_leads')
    
    // Business logic here
    // ...
  }
}
```

This ensures:
- Permission checks happen at the service boundary
- UI can't bypass permissions by calling services directly
- Permission errors are caught and reported consistently

---

## Approval Workflows

Approvals are a specialized form of permission check:

```typescript
import { userCanApprove } from '@/domains/auth'

// Check if user can approve a specific approval type
if (userCanApprove(user, 'trade_value_change')) {
  // Show approval UI
}
```

Approval types map to specific permissions:
- `trade_value_change` → `approve_trade_values`
- `financial_output_change` → `approve_financial_outputs`
- `ai_action_review` → `approve_ai_actions`
- `generic` → `resolve_approvals`

See [Audit and Approval Rules](./audit_and_approval_rules.md) for approval policy logic.

---

## Key Principles

### 1. Authentication ≠ Authorization

- **Authentication**: Proves who you are (handled by Spark runtime)
- **Authorization**: Determines what you can do (handled by role + permissions)

### 2. Explicit Over Implicit

- Every permission is explicitly granted
- No inheritance or implicit cascading
- Roles are mapped to permissions in code, not inferred

### 3. Defense in Depth

- UI hides unauthorized actions
- Route guards block unauthorized navigation
- Service layer asserts permissions before execution

### 4. Fail Secure

- Missing permissions deny access
- Unknown roles get minimal permissions
- Errors in auth state deny access

### 5. Separation of Concerns

- **Auth domain**: Identity, session, state management
- **Roles domain**: Permission definitions, policy logic
- **Route guards**: Navigation protection
- **Services**: Business logic enforcement

---

## Testing Strategy

### Unit Tests

Test policy logic in isolation:

```typescript
import { hasPermission } from '@/domains/roles/policy'

it('should grant sales_rep lead editing permission', () => {
  const user = { role: 'sales_rep' }
  expect(hasPermission(user, 'edit_leads')).toBe(true)
})
```

### Integration Tests

Test auth + permission flow:

```typescript
import { userHasPermission } from '@/domains/auth'

it('should check permission for current user', () => {
  const user = createMockUser('gm')
  expect(userHasPermission(user, 'manage_integrations')).toBe(true)
})
```

### E2E Tests

Test actual route protection and UI behavior (future work).

---

## Role Assignment

**Current Implementation**: Role is set via `AuthProvider` and can be changed with `setRole()`.

**Future Implementation**: Role assignment will be determined by:
1. User's primary store/location assignment
2. User's job function in the dealership
3. Stored in user profile or KV store
4. Synced with external HR/payroll systems if applicable

---

## Error Handling

### PermissionError

When using `assertPermission` or `assertUserPermission`, a `PermissionError` is thrown:

```typescript
try {
  assertUserPermission(user, 'admin_platform')
} catch (error) {
  if (error instanceof PermissionError) {
    console.log(error.permission) // 'admin_platform'
    console.log(error.user.role)  // 'sales_rep'
    console.log(error.message)    // Descriptive error
  }
}
```

### Unauthenticated Access

When using `useCurrentUser()` without authentication:

```typescript
// Throws if user is not authenticated
const user = useCurrentUser()
```

Use `useAuth()` when you need to check auth status:

```typescript
const { user, status } = useAuth()
if (status === 'unauthenticated') {
  // Handle unauthenticated state
}
```

---

## Future Enhancements

### Multi-Store Support

Users may have different roles at different stores:

```typescript
interface StoreRole {
  storeId: string
  role: AppRole
}

interface CurrentAppUser {
  // ...
  storeRoles: StoreRole[]
  activeStoreId: string
}
```

### Dynamic Permissions

For custom permissions not tied to role:

```typescript
interface CurrentAppUser {
  // ...
  customPermissions: Permission[]
}
```

### Permission Delegation

Temporary permission grants:

```typescript
interface PermissionGrant {
  permission: Permission
  grantedBy: string
  expiresAt: Date
}
```

---

## Related Documents

- [Permissions Matrix](./permissions_matrix.md) - Complete role-to-permission mapping
- [Audit and Approval Rules](./audit_and_approval_rules.md) - Approval policy logic
- [Service Layer Contracts](./service_layer_contracts.md) - Service-level permission enforcement
