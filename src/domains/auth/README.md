# Auth Domain

The auth domain provides authentication and authorization infrastructure for Outcome Dealer OS.

## Quick Start

### 1. Wrap your app with AuthProvider

```typescript
import { AuthProvider } from '@/domains/auth'

function Root() {
  return (
    <AuthProvider defaultRole="gm">
      <App />
    </AuthProvider>
  )
}
```

### 2. Access auth state in components

```typescript
import { useAuth } from '@/domains/auth'

function MyComponent() {
  const { user, status } = useAuth()
  
  if (status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <LoginPrompt />
  
  return <div>Hello, {user?.displayName}</div>
}
```

### 3. Check permissions

```typescript
import { userHasPermission } from '@/domains/auth'

function TradeApprovalButton() {
  const { user } = useAuth()
  
  if (!userHasPermission(user, 'approve_trade_values')) {
    return null
  }
  
  return <Button>Approve Trade</Button>
}
```

### 4. Protect routes

```typescript
import { GuardedRoute } from '@/app/routes/guards'

function ExecutiveDashboardPage() {
  const { user } = useAuth()
  
  return (
    <GuardedRoute
      user={user}
      requiredPermission="view_executive_dashboard"
      fallback={<AccessDenied />}
    >
      <ExecutiveDashboard />
    </GuardedRoute>
  )
}
```

### 5. Assert permissions in services

```typescript
import { assertUserPermission } from '@/domains/auth'

export async function assignLead(user: CurrentAppUser, leadId: string, repId: string) {
  assertUserPermission(user, 'assign_leads')
  
  // Business logic here
}
```

## API Reference

### Hooks

**`useAuth()`**
Returns full auth context with user, status, and control functions.

```typescript
const { user, status, error, refreshUser, setRole, signOut } = useAuth()
```

**`useCurrentUser()`**
Returns current user or throws if not authenticated.

```typescript
const user = useCurrentUser() // Throws if unauthenticated
```

**`useRequireAuth()`**
Alias for `useCurrentUser()`.

### Permission Functions

**`userHasPermission(user, permission)`**
Check if user has a specific permission.

```typescript
if (userHasPermission(user, 'view_leads')) {
  // Show leads
}
```

**`assertUserPermission(user, permission)`**
Assert permission or throw `PermissionError`.

```typescript
assertUserPermission(user, 'approve_trade_values')
// Throws if user lacks permission
```

**`userCanApprove(user, approvalType)`**
Check if user can approve a specific approval type.

```typescript
if (userCanApprove(user, 'trade_value_change')) {
  // Show approval UI
}
```

**`requirePermission(user, permission)`**
Null-safe permission check.

```typescript
const canView = requirePermission(user, 'view_leads')
// Returns false if user is null
```

**`canAccessRoute(user, permission?)`**
Check if user can access a route.

```typescript
if (canAccessRoute(user, 'view_executive_dashboard')) {
  navigate('/app/executive')
}
```

### Role Classification

**`isExecutiveRole(user)`**
Check if user has an executive role (owner, gm, gsm, admin).

```typescript
if (isExecutiveRole(user)) {
  // Show executive features
}
```

**`isManagerRole(user)`**
Check if user has a manager role.

```typescript
if (isManagerRole(user)) {
  // Show manager features
}
```

### Route Guards

**`<GuardedRoute>`**
React component for declarative route protection.

```typescript
<GuardedRoute
  user={user}
  requiredPermission="manage_integrations"
  fallback={<AccessDenied />}
>
  <IntegrationsPage />
</GuardedRoute>
```

**`checkAuthGuard(user)`**
Verify user is authenticated.

```typescript
const result = checkAuthGuard(user)
if (!result.allowed) {
  console.log(result.reason)
  navigate(result.fallbackPath)
}
```

**`checkPermissionGuard(user, permission)`**
Verify user has permission.

```typescript
const result = checkPermissionGuard(user, 'approve_trade_values')
if (!result.allowed) {
  toast.error(result.reason)
}
```

**`checkExecutiveGuard(user)`**
Verify user is executive.

```typescript
const result = checkExecutiveGuard(user)
if (!result.allowed) {
  navigate('/app/dashboard')
}
```

## Types

**`AuthStatus`**
```typescript
type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated'
```

**`AuthUser`**
```typescript
interface AuthUser {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
}
```

**`SessionUser`**
```typescript
interface SessionUser extends AuthUser {
  role: AppRole
}
```

**`CurrentAppUser`**
```typescript
interface CurrentAppUser extends SessionUser {
  displayName: string
  permissions: Permission[]
}
```

**`RouteGuardResult`**
```typescript
interface RouteGuardResult {
  allowed: boolean
  reason?: string
  fallbackPath?: string
}
```

## Architecture

The auth domain is split into clean layers:

**Auth Layer** (`/src/domains/auth/`):
- Manages user identity and session
- Provides React hooks and context
- Bridges UI with permission checks

**Policy Layer** (`/src/domains/roles/`):
- Pure permission check functions
- No React or async dependencies
- Easily testable

**Route Guards** (`/src/app/routes/guards.tsx`):
- Composable route protection
- Declarative and programmatic APIs

See [Auth and Access Model](../../../docs/architecture/auth_and_access_model.md) for complete architecture documentation.

## Examples

See [`/src/components/examples/AuthExample.tsx`](../components/examples/AuthExample.tsx) for a complete working example.

## Testing

```bash
# Run auth-related tests
npm test tests/unit/roles.policy.test.ts
npm test tests/unit/auth.permissions.test.ts
```

## Related

- [Permissions Matrix](../../../docs/architecture/permissions_matrix.md)
- [Audit and Approval Rules](../../../docs/architecture/audit_and_approval_rules.md)
- [Service Layer Contracts](../../../docs/architecture/service_layer_contracts.md)
