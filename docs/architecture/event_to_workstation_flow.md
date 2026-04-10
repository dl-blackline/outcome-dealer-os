# Event-to-Workstation Flow

## Architecture

```
Business action (approve, create lead, book appointment, etc.)
  └─ emitEvent(payload, ctx)           [event.bus.ts]
       ├─ publishEvent()               [event.publisher.ts] → KV persistence
       ├─ generateCardFromEvent()      [workstation.autoCardRules.ts] → card template
       │    └─ createWorkstationCard() [workstation.service.ts] → KV persistence
       └─ notifyListeners()            [in-memory notification]
```

## Event Names That Generate Cards

| Event | Card Title | Queue | Priority |
|-------|-----------|-------|----------|
| `lead_created` | New lead — triage and assign | bdc | high |
| `appointment_booked` | Appointment booked — prepare for visit | sales | medium |
| `appointment_no_show` | Appointment no-show — follow up | bdc | high |
| `quote_sent` | Quote sent — follow up for acceptance | sales | high |
| `approval_requested` | Approval requested — manager review needed | management | high |
| `funding_missing_item` | Funding exception — missing item | finance | urgent |
| `service_customer_declined_work` | Declined service work — retention opportunity | service | medium |
| `recon_estimate_changed` | Recon estimate changed — review cost impact | recon | medium |
| `unit_hit_aging_threshold` | Inventory aging — action required | management | medium |

## Card Properties Preserved

Every generated card includes:
- `linkedObjectType` — from the auto-card rule
- `linkedObjectId` — from the event's objectId
- `sourceEventName` — the triggering event name
- `queueType` — determines which department sees it
- `priority` — from the rule default
- `columnId` — always starts in `inbox`
- `tags` — from the rule definition

## In-Memory Listeners

The event bus also supports `onEvent(listener)` for real-time UI updates (e.g., notification center). Listeners are not persisted — they live only for the session.

## Usage

```typescript
import { emitEvent } from '@/domains/events/event.bus'

// This will persist the event AND generate a workstation card if a rule matches
await emitEvent({
  eventName: 'lead_created',
  objectType: 'lead',
  objectId: 'lead-123',
  payload: { source: 'website' },
})
```
