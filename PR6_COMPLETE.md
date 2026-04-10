# PR 6 Complete: Auth and Role Infrastructure

## Summary

PR 6 establishes the auth and access control foundation for Outcome Dealer OS. This infrastructure provides clean separation between authentication (who you are), authorization (what you can do), and route protection (where you can go).

---

## Files Created

### Auth Domain (`/src/domains/auth/`)

**auth.types.ts**
- `AuthStatus`: Authentication state enum
- `AuthUser`: GitHub user from Spark runtime
- `SessionUser`: Auth user + role
- `CurrentAppUser`: Full app user with permissions
- `AuthState` and `AuthContextValue`: React state types

**auth.service.ts**
- `AuthService.fetchAuthUser()`: Fetch from Spark runtime
- `AuthService.loadSessionUser()`: Combine auth + role
- `AuthService.buildCurrentAppUser()`: Enrich with permissions
- `AuthService.resolveCurrentUser()`: Complete user resolution flow

**auth.store.tsx**
- `AuthProvider`: React context provider for auth state
- `useAuth()`: Hook to access auth context
- `useCurrentUser()`: Hook that requires authentication
- `useRequireAuth()`: Alias for useCurrentUser

**auth.permissions.ts**
- `getCurrentUserRole()`: Extract role from user
- `getCurrentUserPermissions()`: Extract permissions from user
- `userHasPermission()`: Check if user has permission
- `assertUserPermission()`: Assert permission or throw
- `userCanApprove()`: Check approval eligibility
- `requirePermission()`: Null-safe permission check
- `canAccessRoute()`: Route access check
- `isExecutiveRole()`: Check if user is executive
- `isManagerRole()`: Check if user is manager

**index.ts**
- Clean barrel export for auth domain

### Route Guards (`/src/app/routes/`)

**guards.tsx**
- `checkAuthGuard()`: Verify user is authenticated
- `checkPermissionGuard()`: Verify user has permission
- `checkExecutiveGuard()`: Verify user is executive
- `GuardedRoute`: React component for route protection
- `createRouteGuard()`: Factory for custom guards

### Tests (`/tests/unit/`)

**roles.policy.test.ts** (202 lines)
- Permission checks by role
- Separation of duties tests
- Executive access tests
- Permission assertion error handling

**auth.permissions.test.ts** (149 lines)
- Auth permission helper tests
- Route access checks
- Role classification tests
- Integration with policy layer

**approval.policy.test.ts** (existing, validated)
- Approval policy tests already in place

### Documentation (`/docs/architecture/`)

**auth_and_access_model.md** (400+ lines)
- Complete auth architecture overview
- Authentication flow explanation
- Authorization flow explanation
- Route protection patterns
- Service layer integration guide
- Testing strategy
- Error handling guide
- Future enhancements

**permissions_matrix.md** (existing, referenced)
- Already complete from PR 1

---

## Architecture Decisions

### 1. Two-Layer Permission System

**Auth Layer** (`/src/domains/auth/`):
- Manages user identity and session state
- Provides React hooks and context
- Bridges UI components with policy layer

**Policy Layer** (`/src/domains/roles/`):
- Pure functions for permission checks
- No dependencies on auth or React
- Easily testable and reusable

**Rationale**: Separation of concerns. Policy logic can be tested without mocking React or async operations. Auth layer handles state and React integration.

### 2. Explicit Permission Mapping

Permissions are explicitly mapped to roles in `ROLE_PERMISSIONS`:
```typescript
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  sales_rep: ['view_leads', 'edit_leads', ...],
  // ...
}
```

**Rationale**: No implicit inheritance or cascading. Every permission grant is intentional and auditable.

### 3. Composable Route Guards

Guards return structured results:
```typescript
interface RouteGuardResult {
  allowed: boolean
  reason?: string
  fallbackPath?: string
}
```

**Rationale**: Guards can be used declaratively (via `<GuardedRoute>`) or programmatically (via `checkXxxGuard()`). Results provide context for logging and user feedback.

### 4. Auth Service Uses Spark Runtime

```typescript
const userInfo = await spark.user()
```

**Rationale**: Spark provides GitHub-based auth. We wrap it to provide a consistent interface and enrich with app-specific data (role, permissions, displayName).

### 5. Defense in Depth

- UI hides unauthorized controls
- Route guards block navigation
- Service layer asserts permissions

**Rationale**: Multiple layers of protection prevent accidental or malicious access. Even if UI logic fails, services enforce permissions.

---

## Key Patterns

### Using Auth in Components

```typescript
import { useAuth } from '@/domains/auth'

function MyComponent() {
  const { user, status } = useAuth()
  
  if (status === 'loading') return <Spinner />
  if (status === 'unauthenticated') return <LoginPrompt />
  
  return <div>Hello, {user?.displayName}</div>
}
```

### Checking Permissions

```typescript
import { userHasPermission } from '@/domains/auth'

function TradeApprovalButton({ user }) {
  if (!userHasPermission(user, 'approve_trade_values')) {
    return null
  }
  
  return <Button onClick={handleApprove}>Approve</Button>
}
```

### Protecting Routes

```typescript
import { GuardedRoute } from '@/app/routes/guards'

<GuardedRoute
  user={user}
  requiredPermission="view_executive_dashboard"
  fallback={<AccessDenied />}
>
  <ExecutiveDashboard />
</GuardedRoute>
```

### Service-Level Enforcement

```typescript
import { assertUserPermission } from '@/domains/auth'

export async function assignLead(user, leadId, repId) {
  assertUserPermission(user, 'assign_leads')
  
  // Business logic
}
```

---

## Test Coverage

### Unit Tests

**roles.policy.test.ts**: 41 test cases
- Owner full access
- GM permissions
- Sales rep limitations
- Manager approval authority
- Executive dashboard access
- Separation of duties
- Permission error handling

**auth.permissions.test.ts**: 13 test cases
- User context extraction
- Permission checks
- Route access logic
- Role classification
- Null safety
- Integration with policy layer

**approval.policy.test.ts**: 6 test cases (existing)
- Approval policy evaluation
- Threshold checks
- Role-based approval authority

**Total**: 60 test cases covering auth and permission logic

### Running Tests

```bash
npm test tests/unit/roles.policy.test.ts
npm test tests/unit/auth.permissions.test.ts
npm test tests/unit/approval.policy.test.ts
```

---

## Integration Points

### With Existing Systems

**Roles Domain** (`/src/domains/roles/`):
- Auth layer delegates to policy layer
- `hasPermission()` and `canApprove()` are foundation

**Approval System** (`/src/domains/approvals/`):
- Uses `canApprove()` to determine approval eligibility
- Approval types map to specific permissions

**Audit System** (`/src/domains/audit/`):
- Can log permission checks and denials
- Records who attempted what action

### With Future Systems

**Shell Components** (PR 7+):
- Will use `useAuth()` for current user
- Will use `userHasPermission()` to show/hide UI
- Will use `GuardedRoute` for page protection

**Domain Services** (PR 7+):
- Will call `assertUserPermission()` at boundaries
- Will receive `CurrentAppUser` as first parameter

**Integration Layer** (PR 8+):
- Will use auth context to tag API calls
- Will include user ID in external system sync

---

## What's NOT in PR 6

As specified in the requirements, PR 6 does NOT include:

- ❌ Login/signup UI
- ❌ Password management
- ❌ OAuth flow implementation
- ❌ Session token management
- ❌ Feature CRUD services
- ❌ Advanced shell logic
- ❌ Dashboard implementations
- ❌ Integration connectors

PR 6 is **infrastructure only**: types, services, state management, guards, and tests.

---

## Assumptions Made

### 1. GitHub-Based Auth

We assume Spark's `spark.user()` provides sufficient identity. No custom login flow is needed.

**Future**: If custom auth is required, wrap it in `AuthService.fetchAuthUser()` to maintain the same interface.

### 2. Single Role Per User

Each user has one active role at a time. Role can be changed via `setRole()`.

**Future**: Multi-store or multi-role support can be added by extending `CurrentAppUser` with `storeRoles` array.

### 3. Static Permission Mapping

Permissions are statically mapped to roles in code.

**Future**: Dynamic permission grants can be added via `customPermissions` field on `CurrentAppUser`.

### 4. Synchronous Permission Checks

Permission checks are pure functions that return immediately.

**Future**: Async permission checks (e.g., fetching from API) can be wrapped in service layer.

### 5. No Role Hierarchy

Roles don't inherit from each other. Each role has explicit permission list.

**Rationale**: Explicit grants prevent accidental permission leakage. Easier to audit and reason about.

---

## Next Steps: PR 7

PR 7 should build:

**Domain Types**:
- Households
- Customers
- Leads
- Communications
- Appointments

**Services**:
- Create/update/delete operations
- Query helpers
- Event emission on mutations
- Audit logging on changes

**Mappers**:
- Raw data → domain objects
- Domain objects → persistence format
- External API format → domain objects

**Integration Tests**:
- Create lead with event + audit
- Update customer with approval if needed
- Link household to customers
- Schedule appointment with notification

**Integration with Auth**:
- Services receive `CurrentAppUser` as first param
- Services call `assertUserPermission()` before mutations
- Audit entries include `user.id` and `user.role`

---

## References

- [Auth and Access Model](docs/architecture/auth_and_access_model.md)
- [Permissions Matrix](docs/architecture/permissions_matrix.md)
- [Audit and Approval Rules](docs/architecture/audit_and_approval_rules.md)
- [Service Layer Contracts](docs/architecture/service_layer_contracts.md)

---

**PR 6 Status**: ✅ Complete

Auth and role infrastructure is production-ready and fully tested. Shell and domain services can now integrate with auth layer.
