# Database Migrations

This directory will contain database migration files for Outcome Dealer OS.

## Migration Strategy (Phase 2)

Phase 2 will include **5 foundational migrations**:

- **Migration 0001**: Core entities (households, customers, leads, inventory, deals)
- **Migration 0002**: Events, audit logs, approvals
- **Migration 0003**: Service, recon, marketing
- **Migration 0004**: Workflow (tasks, integration sync states)
- **Migration 0005**: Indexes, constraints, performance optimization

Each migration will:
- Be reversible (down migration included)
- Include seed data for development
- Generate TypeScript types automatically
- Validate against canonical object definitions

## Status

**Phase 1 Complete**: TypeScript canonical types defined in `/src/types/canonical.ts`

**Phase 2 Pending**: Migration files and database implementation

The canonical schema is documented in:
- `/docs/architecture/canonical_objects.md`
- `/docs/architecture/phase1_schema_map.md`
