# Workstation Execution Layer

## Overview

The Workstation is the central execution layer of Outcome Dealer OS. It provides a Trello-style board where every role can see, prioritize, and execute their work across departments.

## Architecture

### Board Structure
- **5 columns**: Inbox → Today → In Progress → Waiting → Done
- **Cards**: Each card represents an actionable work item
- **Linked objects**: Cards reference canonical business records (leads, deals, approvals, etc.)

### Card Model

```typescript
WorkstationCard {
  id, title, description
  columnId: WorkstationColumnId
  linkedObjectType: LinkedObjectType  // lead, deal, approval, etc.
  linkedObjectId: UUID
  priority: CardPriority              // urgent, high, medium, low
  queueType: QueueType                // sales, finance, service, recon, bdc, management, general
  dueAt?: string
  assigneeName?: string
  requiresApproval: boolean
  sourceEventName?: EventName
  tags: string[]
}
```

### Queue Types

Cards are organized by department queue:
- **sales** — Sales team execution items
- **finance** — F&I and funding items
- **service** — Service department items
- **recon** — Reconditioning items
- **bdc** — Business Development Center items
- **management** — Managerial review items
- **general** — Cross-department items

### Card Sources

Cards enter the workstation through:
1. **Manual creation** — Quick Create dialog
2. **Auto-card rules** — Centralized event-to-card mappings (see `workstation_auto_card_strategy.md`)
3. **System triggers** — Integration sync failures, aging thresholds

### Navigation

Cards with linked objects provide "View Record" navigation:
- `lead` → `/app/records/leads/:id`
- `deal` → `/app/records/deals/:id`
- `household` → `/app/records/households/:id`
- `inventory_unit` → `/app/records/inventory/:id`
- `approval` → `/app/ops/approvals`

## Role Interaction

Every role gets workstation access. The queue filter determines what each role sees:
- Sales reps → sales queue
- F&I managers → finance queue
- Service advisors → service queue
- Managers → management queue + their department queue

## Principles

1. **One board, all departments** — no siloed task systems
2. **Linked-object continuity** — every card knows its source record
3. **Approval sensitivity** — trust-sensitive cards are visually flagged
4. **Event-driven population** — cards come from business events, not manual entry
5. **Premium restraint** — clean, focused UI without decoration
