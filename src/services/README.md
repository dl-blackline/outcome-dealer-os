# Service Layer (Phase 2)

This directory will contain business logic services for each domain in Outcome Dealer OS.

## Planned Services

### Customer & Household Domain
- `HouseholdService` - Household CRUD, relationship management, lifetime value calculation
- `CustomerService` - Customer CRUD, credit profile management
- `LeadService` - Lead creation, scoring, assignment, conversion

### Engagement Domain
- `CommunicationService` - Log communications, sentiment analysis, AI summaries
- `AppointmentService` - Appointment scheduling, confirmation, no-show tracking
- `ShowroomVisitService` - Check-in/check-out, visit tracking

### Inventory & Appraisal Domain
- `InventoryService` - Inventory CRUD, aging calculations, wholesale recommendations
- `TradeAppraisalService` - Appraisal valuation, manager approval workflow

### Sales & Finance Domain
- `DeskingService` - Desk scenario creation, payment calculations
- `QuoteService` - Quote generation, delivery tracking
- `CreditService` - Credit application submission, lender routing
- `FAndIService` - F&I menu presentation, product selection
- `DealService` - Deal lifecycle management, status transitions

### Service & Recon Domain
- `ServiceEventService` - Service appointment and work order management
- `ReconService` - Reconditioning job management, cost tracking

### Marketing Domain
- `CampaignService` - Campaign creation, execution, response tracking
- `AttributionService` - Marketing attribution tracking

### Workflow & Control Domain
- `TaskService` - Task assignment, completion tracking
- `ApprovalService` - Approval request routing, resolution
- `AuditService` - Audit log generation for sensitive operations
- `IntegrationService` - External system synchronization

### Event Infrastructure
- `EventBus` - Central event stream for all system activity

## Service Design Principles

1. **Services consume and produce canonical types** from `/src/types/canonical.ts`
2. **Services return `ServiceResult<T>`** for error handling without exceptions
3. **Services emit events** for every meaningful state change
4. **Services enforce permissions** using policy helpers
5. **Services create audit logs** for sensitive operations
6. **Services use `ServiceContext`** to track actor and source

## Status

**Phase 1 Complete**: Canonical types and service infrastructure types defined

**Phase 2 Pending**: Service implementation

See `/docs/architecture/phase1_schema_map.md` for full schema details.
