# Database Migrations

This directory contains database migration files for Outcome Dealer OS.

## Migration Strategy

Migrations are organized into phases that build the canonical database structure incrementally:

- **PR 2 (Migrations 0001-0005)**: Identity, CRM, Activity, Vehicle domains
- **PR 3 (Migrations 0006-0010)**: Sales, Finance, Service, Orchestration domains
- **PR 4 (Migrations 0011-0014)**: Schema optimization (FK fixups, indexes, triggers, seed data)

## Migration Order

**Critical**: Migrations must be applied in numerical order due to foreign key dependencies.

```
0001 → 0002 → 0003 → 0004 → 0005 → 0006 → 0007 → 0008 → 0009 → 0010
```

See `/docs/architecture/phase2_migration_notes.md` and `/docs/architecture/phase3_migration_notes.md` for detailed dependency information.

## Current Migrations

### PR 2: Foundation (0001-0005)
- **Migration 0001**: Enable PostgreSQL extensions (pgcrypto)
- **Migration 0002**: Create households and customers (identity foundation)
- **Migration 0003**: Create leads and communication events (CRM foundation)
- **Migration 0004**: Create appointments and showroom visits (activity tracking)
- **Migration 0005**: Create vehicle catalog and inventory (vehicle domain)

### PR 3: Sales & Finance & Orchestration (0006-0010)
- **Migration 0006**: Create trade appraisals and desk scenarios (sales structure)
- **Migration 0007**: Create quotes and finance apps (finance foundation)
- **Migration 0008**: Create lender decisions, F&I menus, and deals (deal management)
- **Migration 0009**: Create documents, funding, service, and recon (fixed ops foundation)
- **Migration 0010**: Create marketing, tasks, approvals, audit, sync, and event bus (orchestration)

### PR 4: Optimization (0011-0014) - UPCOMING
- **Migration 0011**: Foreign key fixups for circular dependencies
- **Migration 0012**: Comprehensive index pack for query performance
- **Migration 0013**: Updated_at triggers for automatic timestamp maintenance
- **Migration 0014**: Seed demo data for testing and demonstration

## Status

**Phase 1 Complete**: 
- TypeScript canonical types defined in `/src/types/canonical.ts`
- Role definitions, permissions, event constants
- Premium app shell with role-aware navigation

**Phase 2 Complete (PR 2)**:
- ✅ Migration 0001: Extensions enabled
- ✅ Migration 0002: Households and customers created
- ✅ Migration 0003: Leads and communications created
- ✅ Migration 0004: Appointments and showroom created
- ✅ Migration 0005: Vehicle catalog and inventory created

**Phase 3 Complete (PR 3)**:
- ✅ Migration 0006: Trade appraisals and desk scenarios created
- ✅ Migration 0007: Quotes and finance apps created
- ✅ Migration 0008: Lender decisions, F&I menus, and deals created
- ✅ Migration 0009: Documents, funding, service, and recon created
- ✅ Migration 0010: Marketing, tasks, approvals, audit, sync, and event bus created
- **27 tables total** spanning all dealership operations

**Phase 4 Planned (PR 4)**:
- ⏳ Migration 0011: FK fixups for circular dependencies
- ⏳ Migration 0012: Indexes for performance
- ⏳ Migration 0013: Updated_at triggers
- ⏳ Migration 0014: Seed demo data

## Documentation

The canonical schema is documented in:
- `/docs/architecture/canonical_objects.md` - Object definitions and design principles
- `/docs/architecture/phase1_schema_map.md` - Phase 1 overview
- `/docs/architecture/phase2_migration_notes.md` - PR 2 migration details (0001-0005)
- `/docs/architecture/phase3_migration_notes.md` - PR 3 migration details (0006-0010)

## Type Generation

After applying migrations to a PostgreSQL database, generate TypeScript types:

```bash
# If using Supabase
npx supabase gen types typescript --project-id <your-project-id> > src/types/database.generated.ts
```

See `TYPE_GENERATION_TODO.md` for detailed instructions.

## Next Steps (PR 4)

1. Create migration 0011: Foreign key fixups
2. Create migration 0012: Comprehensive index pack
3. Create migration 0013: Updated_at triggers
4. Create migration 0014: Seed demo data
5. Generate TypeScript types from database schema
6. Update documentation with optimization details
