# Phase 1: Schema Map

## Objective

Phase 1 establishes the **foundational data architecture** for Outcome Dealer OS. This phase is about structure, not features. We build the canonical schema, event model, audit infrastructure, role definitions, and approval flows.

**Success criteria**: A complete, typed, production-ready schema that supports the full dealership chain without rewrites.

---

## In Scope for Phase 1

### 1. Canonical Object Schema

Define tables/types for all core objects:

**Customer & Household**
- `households`
- `customers`
- `leads`

**Engagement**
- `communication_events`
- `appointments`
- `showroom_visits`

**Inventory & Appraisal**
- `vehicle_catalog_items`
- `inventory_units`
- `trade_appraisals`

**Sales & Finance**
- `desk_scenarios`
- `quotes`
- `quick_apps`
- `credit_apps`
- `lender_decisions`
- `f_and_i_menus`
- `deals`
- `deal_document_packages`
- `funding_exceptions`

**Service & Recon**
- `service_events`
- `declined_work_events`
- `recon_jobs`

**Marketing**
- `campaigns`
- `attribution_touches`

**Workflow**
- `tasks`
- `approvals`

**System**
- `audit_logs`
- `integration_sync_states`
- `events`

---

### 2. Event Model

- `events` table with canonical event taxonomy
- Event payload schema validation (JSON Schema or Zod)
- Trace ID for request correlation
- Actor tracking (user, agent, system)

---

### 3. Audit Infrastructure

- `audit_logs` table capturing:
  - Who (user ID, role)
  - What (entity type, entity ID, action)
  - When (timestamp)
  - Before/After (state snapshots)
  - How (IP address, user agent, source)
- Automatic audit log generation for:
  - Deals
  - Credit apps
  - Approvals
  - Trade appraisals
  - Financial outputs

---

### 4. Approval Model

- `approvals` table with:
  - Approval type (trade_value_change, financial_output_change, ai_action_review)
  - Requester (user ID, role)
  - Approver (user ID, role)
  - Status (pending, granted, denied)
  - Resolution timestamp
  - Resolution reason/notes
- Policy helpers for approval routing

---

### 5. Role & Permission Model

- `users` table with role assignment
- Role definitions (owner, gm, gsm, sales_rep, etc.)
- Permission constants
- Role-to-permission mapping
- Policy helper functions (hasPermission, assertPermission, canApprove)

---

### 6. Integration Sync State

- `integration_sync_states` table tracking:
  - External system identifier (DMS, credit bureau, lender portal)
  - Last successful sync timestamp
  - Error count, last error message
  - Retry backoff state
  - Recovery status

---

### 7. Generated Types

- TypeScript types for all tables
- Type-safe query builders
- Zod schemas for runtime validation

---

## Out of Scope for Phase 1

### Features & Business Logic
- Real lender integrations
- DMS sync logic
- AI agents (lead scoring, message generation, lender routing)
- Voice workflows
- Customer-facing portals
- Advanced analytics dashboards
- Campaign automation

### UI & UX
- Full CRUD operations for all objects
- Complex forms (only placeholder forms in shell)
- Real-time collaboration features
- Mobile-optimized views (only responsive layout shell)

### Infrastructure
- Production deployment pipeline
- Multi-tenancy (dealership isolation)
- Data encryption at rest/in transit
- Backup and disaster recovery
- Load testing and performance optimization

---

## Migration Strategy

Phase 1 will include **5 foundational migrations**:

**Migration 0001**: Core entities (households, customers, leads, inventory, deals)
**Migration 0002**: Events, audit logs, approvals
**Migration 0003**: Service, recon, marketing
**Migration 0004**: Workflow (tasks, integration sync states)
**Migration 0005**: Indexes, constraints, performance optimization

Each migration will:
- Be reversible (down migration included)
- Include seed data for development
- Generate TypeScript types automatically
- Validate against canonical object definitions

---

## Validation Criteria

Before Phase 1 is complete:

✅ All canonical objects have table definitions
✅ Event taxonomy is encoded in schema
✅ Audit logs auto-generate for sensitive entities
✅ Role and permission constants match documentation
✅ Approval routing logic is tested
✅ TypeScript types are generated and validated
✅ Seed data exists for every object type
✅ Schema supports the full dealership chain without gaps

---

## Handoff to Phase 2

Phase 2 will build **services and business logic** on top of this schema:

- Service layer for each domain (leads, deals, inventory, etc.)
- AI agents that read/write canonical objects
- Workflow orchestration
- Real integrations (DMS, credit bureaus, lender APIs)
- Advanced analytics and reporting

Phase 1 is the foundation. Build it right, build it once.
