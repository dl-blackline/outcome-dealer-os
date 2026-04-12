# Buyer Hub → Internal OS Data Flow

Every customer action in the Buyer Hub maps to canonical records and events inside the internal OS. There is no ETL, no webhook relay — both surfaces operate on the same data layer.

## Action → Record → Event → Workstation Card

| Customer Action | Record Created / Updated | Event Fired | Internal OS Effect |
|---|---|---|---|
| Browse inventory | — (reads `InventoryUnit`) | — | Same objects staff sees; no write |
| Save a favorite | `CustomerSavedState` (local/session) | — | Local in MVP; linked to `Household` on identification |
| Submit inquiry | Creates `Lead` | `inquiry_submitted` | Auto-card appears in workstation |
| Start quick app | Creates `QuickApp` | `quick_app_started` | Auto-card appears in workstation |
| Submit quick app | Updates `QuickApp` (status → submitted) | `quick_app_submitted` | Auto-card appears in workstation |
| Request appointment | Creates `Appointment` | `appointment_requested` | Auto-card appears in workstation |
| Submit trade-in | Creates `TradeAppraisal` context | `trade_in_submitted` | Auto-card appears in workstation |
| View payment scenario | — | `payment_scenario_viewed` | Telemetry only (no card) |

## Shared Event Bus

All customer-generated events feed into the **same event bus** consumed by the internal OS. There is no separate "customer event stream." This means:

- Workstation auto-card rules process buyer hub events identically to events originating from staff actions.
- Event-driven automations (notifications, task creation, SLA timers) trigger without additional integration.
- Telemetry events (like `payment_scenario_viewed`) flow through the bus for analytics but are filtered out by card rules.

## Auto-Card Mapping

The workstation's **auto-card rules** handle event → card mapping centrally:

```
Event(inquiry_submitted)       → Card: "New Inquiry"       → assigned via round-robin or rules
Event(quick_app_started)       → Card: "App In Progress"   → assigned to finance queue
Event(quick_app_submitted)     → Card: "App Ready"         → assigned to finance queue
Event(appointment_requested)   → Card: "Appointment"       → assigned to BDC / sales
Event(trade_in_submitted)      → Card: "Trade Appraisal"   → assigned to appraisal queue
```

No buyer-hub-specific card logic exists. The same rule engine that handles internal events handles customer events.

## Identity Linking

In MVP, customers are anonymous until they submit an inquiry or application. At that point:

1. A `Lead` or `QuickApp` is created with the provided contact info.
2. The system attempts to match against existing `Household` / `Customer` records.
3. If matched, the new record is linked; if not, a new `Lead` is created.
4. Any `CustomerSavedState` (favorites, viewed units) is retroactively associated with the identified household for personalization and staff context.
