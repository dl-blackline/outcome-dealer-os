# Global Command Model

## Overview

The command palette (Cmd+K / ⌘K) is a context-aware productivity surface
that provides fast navigation, entity search, and quick actions.

## Access

- **Keyboard**: Cmd+K (Mac) / Ctrl+K (Windows)
- **Click**: Search button in the Topbar

## Command Categories

### Pages (Navigation)

| Command | Target |
|---------|--------|
| Dashboard | `/app/dashboard` |
| Workstation | `/app/workstation` |
| Households | `/app/records/households` |
| Leads | `/app/records/leads` |
| Deals | `/app/records/deals` |
| Inventory | `/app/records/inventory` |
| Event Stream | `/app/ops/events` |
| Approval Queue | `/app/ops/approvals` |
| Audit Log | `/app/ops/audit` |
| Roles & Permissions | `/app/settings/roles` |
| Integrations | `/app/settings/integrations` |

### Records (Entity Search)

Search across all surfaced entity types:

| Entity | Search Fields | Display |
|--------|--------------|---------|
| Leads | Customer name | `Lead • {source} • Score: {score}` |
| Deals | Customer name | `Deal • {vehicle} • ${amount}` |
| Inventory | Year/make/model/trim | `Inventory • {VIN} • ${price}` |
| Households | Family name | `Household • {contact} • ${LTV} LTV` |

### Actions (Context-Sensitive)

| Action | Description |
|--------|-------------|
| Review Pending Approvals | Jump to approval queue |
| Open Workstation | Navigate to execution board |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| ↑ / ↓ | Move selection |
| Enter | Execute selected command |
| Escape | Close palette |
| Type | Filter results |

## Search Behavior

1. Empty query shows top 12 items (pages first, then records)
2. Typing filters across label and description fields
3. Results limited to 12 items
4. Grouped by category with section headers

## Architecture

- Component: `src/components/shell/CommandPalette.tsx`
- Uses hooks: `useLeads()`, `useDeals()`, `useInventory()`, `useHouseholds()`
- Router integration: `useRouter().navigate()` for all navigation

## Future Enhancements

1. **Entity-context actions**: When viewing a lead, show "Create deal for this lead"
2. **Fuzzy search**: Better matching for partial/misspelled queries
3. **Recent items**: Show recently visited records at the top
4. **Quick create**: "New lead" / "New card" directly from command palette
