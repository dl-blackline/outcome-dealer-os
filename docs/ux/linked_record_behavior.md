# Linked Record Behavior

## Overview

Linked records create the cross-surface continuity that makes Outcome Dealer OS
feel like one operating system rather than separate screens.

## Link Display Patterns

### EntityBadge + Navigate Button

Used in record detail pages for explicit cross-entity links:

```
┌──────────────────────────────────────────┐
│ Linked Records                           │
│ [Lead Badge]  Sarah Mitchell  lead-001 > │
│ [Deal Badge]  2024 CR-V       $38,900 >  │
│ [Household]                    hh-001 >  │
└──────────────────────────────────────────┘
```

Each row shows:
- Entity type badge (colored)
- Descriptive text (name, vehicle, amount)
- Navigation button with caret icon

### Clickable Table Rows

Used in list pages and household linked record sections:

```
┌──────────────────────────────────────┐
│ Marcus Johnson   Phone   Score: 92   │ ← entire row clickable
│ Elena Rodriguez  Trade   Score: 78   │
└──────────────────────────────────────┘
```

### Card Drawer Linked Record Panel

Used in workstation card drawer:

```
┌──────────────────────────────────────┐
│ Linked Record                        │
│ [Lead Badge] lead        View Record>│
│ lead-001                             │
└──────────────────────────────────────┘
```

## Relationship Directions

| From | To | How |
|------|----|-----|
| Lead | Household | `lead.householdId` → navigate |
| Lead | Deals | Filter `deals.leadId === lead.id` |
| Deal | Lead | `deal.leadId` → navigate |
| Deal | Household | Via `lead.householdId` |
| Deal | Inventory | Match by vehicle make/model |
| Household | Leads | Filter `leads.householdId === household.id` |
| Household | Deals | Via linked leads |
| Workstation Card | Any Entity | `card.linkedObjectType` + `card.linkedObjectId` |
| Approval | Context Entity | Via description text matching |

## Navigation Targets

All linked record navigation uses the hash-based router:

```typescript
const LINKED_ROUTE: Record<string, string> = {
  lead: '/app/records/leads/',
  deal: '/app/records/deals/',
  household: '/app/records/households/',
  inventory_unit: '/app/records/inventory/',
  approval: '/app/ops/approvals',
}
```

## Not-Found Handling

When a linked entity ID doesn't match any record, the target page shows:
"Lead not found." / "Deal not found." / "Household not found." / "Unit not found."

This is expected behavior when navigating to entities that only exist in different seed states.
