# Workstation Card Lifecycle

## Overview

Workstation cards are the primary execution unit in Outcome Dealer OS.
Each card represents a piece of work that flows through a kanban board.

## Card States

```
┌────────┐     ┌───────────┐     ┌─────────┐
│ active │────>│ completed │────>│ reopened │──> active
└────────┘     └───────────┘     └─────────┘
```

| Status | Description |
|--------|-------------|
| `active` | Default state for new and in-progress cards |
| `completed` | Card moved to Done column or explicitly completed |
| `reopened` | Previously completed card that needs further work |

## Column Flow

Cards move through 5 columns:

1. **Inbox** — New items requiring triage
2. **Today** — Scheduled for today
3. **In Progress** — Currently being worked
4. **Waiting** — Blocked or awaiting response
5. **Done** — Completed items

## Lifecycle Actions

| Action | Trigger | Result |
|--------|---------|--------|
| Create | Quick Create dialog or auto-card rule | New card in Inbox |
| Move | Drag-and-drop or column button click | Card moves to target column |
| Complete | Move to Done or Complete button in drawer | Status → `completed` |
| Reopen | Reopen button in drawer | Status → `reopened`, column → Inbox |

## Auto-Card Generation

Cards are automatically created from system events via `workstation.autoCardRules.ts`:

| Event | Card Title Template | Queue |
|-------|-------------------|-------|
| `lead_created` | New lead: {name} | BDC |
| `approval_requested` | Review: {description} | Management |
| `unit_hit_aging_threshold` | Aging: {vehicle} | Recon |
| `deal_funded` | Complete delivery: {deal} | Sales |
| `appointment_no_show` | Reschedule: {customer} | BDC |
| `lender_declined` | Re-submit: {deal} | Finance |
| `trade_appraisal_needed` | Appraise: {vehicle} | Sales |
| `service_customer_declined_work` | Follow up: {customer} | Service |
| `funding_missing_item` | Funding item: {deal} | Finance |

## Card Metadata

Each card carries:

- **Priority**: urgent / high / medium / low (visual border color)
- **Queue Type**: sales / finance / service / recon / bdc / management / general
- **Linked Object**: Entity type + ID with navigation link
- **Assignee**: Optional person name
- **Due Date**: Optional deadline with overdue indicator
- **Approval Shield**: Indicates approval requirement
- **Source Event**: Event that created the card
- **Tags**: Flexible categorization labels

## Visual Indicators

- Priority border color (red/orange/blue/gray)
- Completed cards render with reduced opacity
- Overdue dates shown in red
- Approval shield icon on cards requiring approval
- Entity badges on linked records
