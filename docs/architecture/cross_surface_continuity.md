# Cross-Surface Continuity

## Overview

Cross-surface continuity ensures that the same entity appears consistently across
all surfaces in Outcome Dealer OS — record pages, workstation cards, approvals,
events, dashboards, and the command palette.

## Entity Linkage Map

```
Household ←──── Lead ←──── Deal
                              │
                              └──── Inventory Unit
                              
Approval ←──── Linked Entity (Lead, Deal, etc.)
Workstation Card ←──── Linked Object (any entity)
Event ←──── Entity Reference
```

## Navigation Links by Surface

### Record Detail Pages

| Page | Shows Links To |
|------|---------------|
| LeadRecordPage | Household (EntityBadge + navigate), linked Deals (EntityBadge + navigate) |
| DealRecordPage | Lead (EntityBadge + navigate), Household (via lead), Inventory (if matched), Approvals (inline) |
| HouseholdRecordPage | Linked Leads (clickable rows), Linked Deals (clickable rows) |
| InventoryUnitPage | Recon job (planned), Price history (planned) |

### Workstation Cards

Each card may carry:
- `linkedObjectType`: entity type enum
- `linkedObjectId`: entity UUID

The card drawer provides a "View Record" button that navigates to the linked entity's page.

Supported linked object types:
- `lead` → `/app/records/leads/{id}`
- `deal` → `/app/records/deals/{id}`
- `household` → `/app/records/households/{id}`
- `inventory_unit` → `/app/records/inventory/{id}`
- `approval` → `/app/ops/approvals`

### Command Palette

Global search indexes:
- Leads (by customer name, source, score)
- Deals (by customer name, vehicle, amount)
- Inventory (by year/make/model, VIN, price)
- Households (by family name, primary contact, LTV)

Each result navigates directly to the entity's record page.

### Dashboard

Dashboard metric cards are clickable and navigate to the corresponding list page:
- Active Leads → `/app/records/leads`
- Deals in Progress → `/app/records/deals`
- Pending Approvals → `/app/ops/approvals`
- Aging Inventory → `/app/records/inventory`
- Workstation → `/app/workstation`

### Event Explorer

Event rows show entity type and entity ID. Navigation to linked records is possible
through the command palette or by noting the entity ID.

## EntityBadge Component

The `EntityBadge` component provides consistent entity type visualization:

| Variant | Color | Used For |
|---------|-------|----------|
| `lead` | Blue | Lead references |
| `deal` | Green | Deal references |
| `household` | Purple | Household references |
| `inventory` | Orange | Inventory references |
| `approval` | Yellow | Approval references |
| `service` | Teal | Service event references |

## Design Principles

1. **One click away**: Any entity reference should be at most one click from its detail page
2. **Visual consistency**: EntityBadge provides uniform type identification across all surfaces
3. **Bidirectional**: If A links to B, B should link back to A where meaningful
4. **Non-cluttering**: Links appear in dedicated "Linked Records" sections, not inline in every field
