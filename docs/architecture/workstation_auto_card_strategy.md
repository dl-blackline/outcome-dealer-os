# Workstation Auto-Card Strategy

## Overview

Auto-card rules are the centralized mechanism for generating workstation cards from business events. This ensures consistent, traceable card creation without scattered logic in page code.

## Location

All rules live in **one file**: `src/domains/workstation/workstation.autoCardRules.ts`

## Rule Structure

```typescript
interface AutoCardRule {
  eventName: EventName           // Which event triggers this card
  titleTemplate: string          // Card title
  descriptionTemplate?: string   // Card description
  linkedObjectType: LinkedObjectType  // What record type this relates to
  queueType: QueueType          // Which department receives the card
  defaultPriority: CardPriority // urgent | high | medium | low
  requiresApproval: boolean     // Whether manager review is needed
  tags: string[]                // Auto-applied tags
}
```

## Current Rules (Phase 1)

| Event | Queue | Priority | Approval | Description |
|-------|-------|----------|----------|-------------|
| `lead_created` | bdc | high | no | New lead triage |
| `appointment_booked` | sales | medium | no | Visit preparation |
| `appointment_no_show` | bdc | high | no | Immediate follow-up |
| `quote_sent` | sales | high | no | Acceptance follow-up |
| `approval_requested` | management | high | yes | Manager review |
| `funding_missing_item` | finance | urgent | no | Funding exception |
| `service_customer_declined_work` | service | medium | no | Retention risk |
| `recon_estimate_changed` | recon | medium | no | Cost review |
| `unit_hit_aging_threshold` | management | medium | no | Pricing/wholesale decision |

## API

```typescript
// Find rule for an event
findAutoCardRule(eventName: EventName): AutoCardRule | null

// Generate a card from an event
generateCardFromEvent(eventName, entityId, overrides?): WorkstationCard | null
```

## Design Principles

1. **Centralized** — all rules in one file, no scattered event handlers
2. **Declarative** — rules are data, not imperative code
3. **Extensible** — add a new rule = add an object to the array
4. **Traceable** — every generated card records its `sourceEventName`
5. **No permission bypass** — approval-required cards cannot be completed without review
