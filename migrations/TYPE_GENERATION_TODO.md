# Database Type Generation

## Status: Manual Action Required

The migrations 0001-0005 have been created but **have not been applied to a live database** yet.

## Next Steps

After applying these migrations to your PostgreSQL database, you must **generate TypeScript types** from the schema.

### Recommended Approach

If using Supabase:
```bash
npx supabase gen types typescript --project-id <your-project-id> > src/types/database.generated.ts
```

If using another tool (Prisma, Drizzle, etc.):
Follow your tool's type generation workflow to output types to:
```
src/types/database.generated.ts
```

### Important Rules

1. **Never hand-edit generated types** - they should be regenerated after every migration
2. **Regenerate after each migration batch** to keep types in sync with schema
3. **Commit generated types to version control** so the team stays in sync
4. **Import from generated types**, not from hand-written type definitions

### Example Usage

After generating types, you can use them like this:

```typescript
import type { Database } from '@/types/database.generated'

type Household = Database['public']['Tables']['households']['Row']
type HouseholdInsert = Database['public']['Tables']['households']['Insert']
type HouseholdUpdate = Database['public']['Tables']['households']['Update']

type Lead = Database['public']['Tables']['leads']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
```

## Current State

- ✅ Migrations 0001-0005 created
- ⏳ Migrations not yet applied to database
- ⏳ Types not yet generated
- ⏳ `src/types/database.generated.ts` does not exist yet

## TODO for Production Setup

1. Set up PostgreSQL database (or Supabase project)
2. Apply migrations 0001-0005 in order
3. Generate TypeScript types
4. Add type generation to CI/CD pipeline
5. Document type generation workflow in team docs
