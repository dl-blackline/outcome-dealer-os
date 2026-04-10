# Domain Service Pattern

## Overview

The Outcome Dealer OS uses a canonical domain service pattern for all business domains. This document describes the standard structure, conventions, and practices that all domain services must follow.

## Core Principles

1. **Type Safety**: Strong typing at every layer with explicit boundaries
2. **Clean Boundaries**: DB shapes never leak into application code
3. **Audit Trail**: Every mutation is logged with before/after state
4. **Event Driven**: State changes emit domain events for downstream processing
5. **Permission Enforcement**: All writes validate actor permissions
6. **Consistent API**: Uniform service interface across all domains

## Directory Structure

```
src/domains/{domain}/
├── {domain}.types.ts      # Type definitions and mappers
├── {domain}.service.ts    # Core CRUD operations
└── {domain}.queries.ts    # Read-optimized query helpers
```

## Type Layer Pattern

### Required Types

Every domain must define:

```typescript
// DB row type (snake_case, extends DbRow)
export interface DomainRow extends DbRow {
  field_name: string
  another_field?: number
}

// Domain model (camelCase, clean)
export interface Domain {
  id: UUID
  fieldName: string
  anotherField?: number
  createdAt: string
  updatedAt: string
}

// Create input (camelCase, required fields only)
export interface CreateDomainInput {
  fieldName: string
  anotherField?: number
}

// Update input (camelCase, all fields optional)
export interface UpdateDomainInput {
  fieldName?: string
  anotherField?: number
}

// Mapper function (transforms DB → Domain)
export function mapDomainRowToDomain(row: DomainRow): Domain {
  return {
    id: row.id,
    fieldName: row.field_name,
    anotherField: row.another_field,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  }
}
```

### Naming Conventions

- **DB Layer**: `snake_case` - matches PostgreSQL conventions
- **Domain Layer**: `camelCase` - matches TypeScript/JavaScript conventions
- **Mapper Functions**: `map{Domain}RowToDomain`
- **Row Types**: `{Domain}Row`
- **Domain Types**: `{Domain}`

## Service Layer Pattern

### Standard Operations

```typescript
import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { hasPermission } from '@/domains/roles/policy'
import { writeAuditLog } from '@/domains/audit/audit.service'
import { publishEvent } from '@/domains/events/event.publisher'
import { findById, findMany, insert, update } from '@/lib/db/helpers'

// GET BY ID - Read single record
export async function getDomainById(
  id: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<Domain>> {
  try {
    // Optional permission check for reads
    if (ctx && ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_domain')) {
        return fail({ 
          code: 'PERMISSION_DENIED', 
          message: 'Insufficient permissions' 
        })
      }
    }

    const row = await findById<DomainRow>('table_name', id)
    if (!row) {
      return fail({ code: 'NOT_FOUND', message: 'Record not found' })
    }

    return ok(mapDomainRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_FAILED',
      message: 'Failed to get record',
      details: { error: String(error) },
    })
  }
}

// LIST - Read multiple records with filtering
export async function listDomains(
  filters?: { field?: string },
  ctx?: ServiceContext
): Promise<ServiceResult<Domain[]>> {
  try {
    // Optional permission check
    if (ctx && ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'view_domain')) {
        return fail({ 
          code: 'PERMISSION_DENIED', 
          message: 'Insufficient permissions' 
        })
      }
    }

    const rows = await findMany<DomainRow>('table_name', (row) => {
      if (filters?.field && row.field !== filters.field) {
        return false
      }
      return true
    })

    return ok(rows.map(mapDomainRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_FAILED',
      message: 'Failed to list records',
      details: { error: String(error) },
    })
  }
}

// CREATE - Insert new record
export async function createDomain(
  input: CreateDomainInput,
  ctx: ServiceContext
): Promise<ServiceResult<Domain>> {
  try {
    // 1. Permission check (REQUIRED for writes)
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_domain')) {
        return fail({ 
          code: 'PERMISSION_DENIED', 
          message: 'Insufficient permissions' 
        })
      }
    }

    // 2. Input validation
    if (!input.requiredField) {
      return fail({
        code: 'VALIDATION_ERROR',
        message: 'Required field missing',
      })
    }

    // 3. DB write
    const rowData: Omit<DomainRow, 'id' | 'created_at' | 'updated_at'> = {
      field_name: input.fieldName,
      another_field: input.anotherField,
    }

    const row = await insert<DomainRow>('table_name', rowData)
    const domain = mapDomainRowToDomain(row)

    // 4. Audit log
    await writeAuditLog(
      {
        action: 'domain.create',
        objectType: 'domain',
        objectId: domain.id,
        after: domain as unknown as Record<string, unknown>,
      },
      ctx
    )

    // 5. Event emission (if applicable)
    await publishEvent(
      {
        eventName: 'domain_created',
        objectType: 'domain',
        objectId: domain.id,
        payload: { /* event-specific fields */ },
      },
      ctx
    )

    return ok(domain)
  } catch (error) {
    return fail({
      code: 'CREATE_FAILED',
      message: 'Failed to create record',
      details: { error: String(error) },
    })
  }
}

// UPDATE - Modify existing record
export async function updateDomain(
  id: UUID,
  input: UpdateDomainInput,
  ctx: ServiceContext
): Promise<ServiceResult<Domain>> {
  try {
    // 1. Permission check
    if (ctx.actorType === 'user' && ctx.actorRole) {
      if (!hasPermission({ role: ctx.actorRole as any }, 'edit_domain')) {
        return fail({ 
          code: 'PERMISSION_DENIED', 
          message: 'Insufficient permissions' 
        })
      }
    }

    // 2. Fetch existing
    const existingRow = await findById<DomainRow>('table_name', id)
    if (!existingRow) {
      return fail({ code: 'NOT_FOUND', message: 'Record not found' })
    }

    const before = mapDomainRowToDomain(existingRow)

    // 3. Build updates
    const updates: Partial<Omit<DomainRow, 'id' | 'created_at'>> = {}
    if (input.fieldName !== undefined) updates.field_name = input.fieldName
    if (input.anotherField !== undefined) updates.another_field = input.anotherField

    // 4. DB write
    const updatedRow = await update<DomainRow>('table_name', id, updates)
    if (!updatedRow) {
      return fail({ code: 'UPDATE_FAILED', message: 'Update failed' })
    }

    const after = mapDomainRowToDomain(updatedRow)

    // 5. Audit log with before/after
    await writeAuditLog(
      {
        action: 'domain.update',
        objectType: 'domain',
        objectId: id,
        before: before as unknown as Record<string, unknown>,
        after: after as unknown as Record<string, unknown>,
      },
      ctx
    )

    // 6. Conditional event emission
    if (before.status !== after.status) {
      await publishEvent(
        {
          eventName: 'domain_status_changed',
          objectType: 'domain',
          objectId: id,
          payload: { 
            previousStatus: before.status,
            newStatus: after.status,
          },
        },
        ctx
      )
    }

    return ok(after)
  } catch (error) {
    return fail({
      code: 'UPDATE_FAILED',
      message: 'Failed to update record',
      details: { error: String(error) },
    })
  }
}
```

## Query Layer Pattern

Query helpers provide read-optimized access patterns with relationship loading:

```typescript
import { UUID } from '@/types/common'
import { findById, findMany } from '@/lib/db/helpers'

export interface DomainDetail {
  domain: Domain
  relatedItems: RelatedItem[]
  otherRelation: OtherRelation | null
}

export async function getDomainDetail(
  domainId: UUID
): Promise<DomainDetail | null> {
  const domainRow = await findById<DomainRow>('domains', domainId)
  if (!domainRow) return null

  const relatedRows = await findMany<RelatedItemRow>(
    'related_items',
    (row) => row.domain_id === domainId
  )

  let otherRelation = null
  if (domainRow.other_id) {
    const otherRow = await findById<OtherRow>('others', domainRow.other_id)
    if (otherRow) {
      otherRelation = mapOtherRowToDomain(otherRow)
    }
  }

  return {
    domain: mapDomainRowToDomain(domainRow),
    relatedItems: relatedRows.map(mapRelatedItemRowToDomain),
    otherRelation,
  }
}
```

## Permission Guidelines

### When to Check Permissions

- **Reads**: Optional for most domains, required for sensitive data
- **Writes**: ALWAYS required
- **Assignment Changes**: Require specific assignment permission

### Permission Patterns

```typescript
// View permission (reads)
if (!hasPermission({ role: ctx.actorRole as any }, 'view_domain')) {
  return fail({ code: 'PERMISSION_DENIED', message: '...' })
}

// Edit permission (writes)
if (!hasPermission({ role: ctx.actorRole as any }, 'edit_domain')) {
  return fail({ code: 'PERMISSION_DENIED', message: '...' })
}

// Special permission (assignments)
if (input.assignedTo !== undefined) {
  if (!hasPermission({ role: ctx.actorRole as any }, 'assign_domain')) {
    return fail({ code: 'PERMISSION_DENIED', message: '...' })
  }
}
```

## Event Emission Guidelines

### When to Emit Events

- **State Changes**: Emit when status/stage progresses
- **Assignments**: Emit when ownership changes
- **Lifecycle Milestones**: Emit for important domain transitions
- **Integration Triggers**: Emit for downstream system notifications

### Event Naming

Use existing `EVENT_NAMES` constants:
- `{domain}_created` - New record created
- `{domain}_{action}_completed` - Action completed
- `{domain}_{field}_changed` - Significant field change

### Event Payload

Include minimal, stable data:
```typescript
{
  eventName: 'lead_contacted',
  objectType: 'lead',
  objectId: leadId,
  payload: {
    leadId: leadId,
    channel: 'email',
    direction: 'outbound',
  },
}
```

## Audit Logging Guidelines

### What to Log

- **All Creates**: Log full after state
- **All Updates**: Log before and after state
- **No Reads**: Don't log read operations
- **No Deletes**: Use status changes instead of deletes

### AI-Generated Content

For AI-generated mutations:
```typescript
await writeAuditLog(
  {
    action: 'domain.create',
    objectType: 'domain',
    objectId: id,
    after: domain as unknown as Record<string, unknown>,
    confidenceScore: input.aiConfidence,
    requiresReview: (input.aiConfidence || 0) < 0.8,
  },
  ctx
)
```

## Validation Guidelines

### What to Validate

- **Required Fields**: Fail fast on missing required data
- **Format Validation**: Email, phone, date formats
- **Simple Business Rules**: Basic constraints only
- **Reference Integrity**: Check required foreign keys exist

### What NOT to Validate

- Complex business logic (belongs in workflow layer)
- Cross-domain constraints (use events for consistency)
- Authorization (use permission layer)
- Rate limiting (use middleware)

## Error Handling

### ServiceResult Pattern

All service functions return `ServiceResult<T>`:

```typescript
type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ServiceErrorShape }
```

### Error Codes

Use descriptive, consistent error codes:
- `NOT_FOUND` - Record doesn't exist
- `PERMISSION_DENIED` - Actor lacks permission
- `VALIDATION_ERROR` - Input validation failed
- `{OPERATION}_FAILED` - Operation-specific failure

### Error Details

Include structured details for debugging:
```typescript
return fail({
  code: 'CREATE_FAILED',
  message: 'User-friendly message',
  details: { 
    error: String(error),
    field: 'fieldName',
  },
})
```

## Testing Approach

### Unit Tests
- Test individual service functions
- Mock DB layer
- Verify permission checks
- Validate error cases

### Integration Tests
- Test full create/update flows
- Verify DB persistence
- Confirm audit logs written
- Check events emitted

### Example Test Structure
```typescript
describe('leadService.createLead', () => {
  it('creates lead with audit and event', async () => {
    const ctx = { actorType: 'user', actorRole: 'sales_rep' }
    const input = { customerId: 'uuid', leadSource: 'web' }
    
    const result = await createLead(input, ctx)
    
    expect(result.ok).toBe(true)
    expect(auditLogs).toContainEqual(expect.objectContaining({
      action: 'lead.create',
    }))
    expect(events).toContainEqual(expect.objectContaining({
      eventName: 'lead_created',
    }))
  })
  
  it('denies creation without permission', async () => {
    const ctx = { actorType: 'user', actorRole: 'viewer' }
    const input = { customerId: 'uuid', leadSource: 'web' }
    
    const result = await createLead(input, ctx)
    
    expect(result.ok).toBe(false)
    expect(result.error.code).toBe('PERMISSION_DENIED')
  })
})
```

## Migration Guide

When adding a new domain:

1. Create `{domain}.types.ts` with row type, domain type, and mapper
2. Add row type to `src/lib/db/supabase.ts`
3. Create `{domain}.service.ts` with standard CRUD operations
4. Add permission checks to all write operations
5. Emit domain events for state changes
6. Write audit logs for all mutations
7. Create `{domain}.queries.ts` for relationship loading
8. Write integration tests for critical flows
9. Update this documentation with domain-specific notes

## Related Documentation

- [Event Taxonomy](./event_taxonomy.md) - Event naming and payload conventions
- [Permissions Matrix](./permissions_matrix.md) - Permission definitions by role
- [Audit and Approval Rules](./audit_and_approval_rules.md) - Audit log requirements
