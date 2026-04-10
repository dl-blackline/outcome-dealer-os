# Database Migrations

This directory contains database migration files for Outcome Dealer OS.

## Migration Strategy (PR 2)

PR 2 includes **5 foundational migrations** that establish the first layer of canonical database structure:

- **Migration 0001**: Enable PostgreSQL extensions (pgcrypto)
- **Migration 0002**: Create households and customers (identity foundation)
- **Migration 0003**: Create leads and communication events (CRM foundation)
- **Migration 0004**: Create appointments and showroom visits (activity tracking)
- **Migration 0005**: Create vehicle catalog and inventory (vehicle domain)

## Migration Order

**Critical**: Migrations must be applied in numerical order due to foreign key dependencies.

```
0001 → 0002 → 0003 → 0004 → 0005
```

See `/docs/architecture/phase2_migration_notes.md` for detailed dependency information.

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

**Phase 2 Remaining**:
- Add indexes for performance
- Add updated_at triggers
- Add households.primary_customer_id FK constraint
- Generate TypeScript database types

## Documentation

The canonical schema is documented in:
- `/docs/architecture/canonical_objects.md` - Object definitions
- `/docs/architecture/phase1_schema_map.md` - Phase 1 overview
- `/docs/architecture/phase2_migration_notes.md` - PR 2 migration details

## Next Steps (PR 3)

1. Add indexes on high-traffic columns
2. Add updated_at triggers
3. Resolve circular FK dependency for households.primary_customer_id
4. Create migrations for trades, desking, quotes, finance domains
5. Generate TypeScript types from database schema
