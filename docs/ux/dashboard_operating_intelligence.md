# Dashboard Operating Intelligence

## Design Philosophy

The dashboard is the first surface a user sees. It must immediately communicate
what requires attention, what's at risk, and what's progressing well.

## Current Dashboard Structure

### Top Metrics Row (4 cards)

| Metric | Source | Urgency Signal |
|--------|--------|----------------|
| Active Leads | `useLeads()` count | Shows qualified count |
| Deals in Progress | `useDeals()` count | Shows funded count |
| Pending Approvals | `useApprovals()` filtered | Yellow border when > 0 |
| Aging Inventory | `useInventory()` filtered on status='aging' | Red border when > 0 |

All metric cards are clickable and navigate to the corresponding list/queue page.

### Workstation Summary

Shows real-time workstation state:
- Open card count with urgency pill
- Breakdown by column (Inbox, Today, In Progress, Waiting)
- Clickable to navigate to workstation

### Recent Leads Table

Shows all current leads with:
- Customer name
- Source and score
- Status pill (converted=green, qualified=blue, contacted=yellow, new=gray)
- Clickable rows navigate to lead detail

### Active Deals Table

Shows all current deals with:
- Customer name and vehicle
- Amount
- Status pill (funded=green, signed=blue, quoted=yellow)
- Clickable rows navigate to deal detail

### Tasks Section

Shows personal task list with:
- Completion checkbox (read-only)
- Task title with strikethrough for completed
- Due date and assignee
- Priority badge

## Role-Specific Intelligence

The dashboard adapter in `src/domains/dashboard/dashboard.adapters.ts` computes
role-specific metrics. The current dashboard page uses hooks directly for broader coverage.

### Recommended Role Emphasis

| Role | Primary Metrics |
|------|----------------|
| Owner / GM | All metrics — full operational visibility |
| Sales Manager | Active leads, deals in progress, pending approvals |
| Sales Rep | Own leads, own deals, workstation cards |
| F&I Manager | Deals in progress, pending approvals, funding items |
| Service Director | Aging inventory, service events, recon status |
| BDC Manager | Active leads, appointment no-shows, lead sources |

## Future Intelligence Features

1. **Trend indicators**: Up/down arrows on metrics compared to prior period
2. **Urgency ranking**: Auto-sort dashboard sections by what needs attention first
3. **Role-filtered views**: Only show metrics relevant to the current user's role
4. **Operating signal feed**: Embed recent critical/warning signals directly on dashboard
