# Customer Buyer Hub — Vision

## One Platform, Two Surfaces

The Buyer Hub is not a disconnected marketing site bolted onto the dealership OS. It is the **customer-facing operating surface** of Outcome Dealer OS — the same platform staff already uses at `#/app/…`. Both surfaces share canonical data types (`InventoryUnit`, `Lead`, `Household`, `Customer`, `Deal`, `QuickApp`, etc. from `src/types/canonical.ts`), the same event bus, and the same business rules. When a customer acts in the Buyer Hub, the internal OS reacts immediately — no sync lag, no duplicate records.

## Goals

| Goal | What the customer can do |
|---|---|
| **Browse** | Search and filter live inventory with the same data staff sees |
| **Inquire** | Ask a question or request info on any unit |
| **Apply** | Start or complete a Quick App for financing |
| **Schedule** | Book an appointment or test-drive |
| **Track** | View their deal progress in a personal next-steps portal |

## Conversion Funnel

```
Listings ➜ Unit Detail ➜ Inquiry / Save ➜ Finance / Apply ➜ Appointment ➜ Next-Steps Portal
```

Each step is designed to reduce friction and keep the customer moving forward. Saved state persists across sessions so returning visitors pick up where they left off.

## MVP Scope

### Inventory Browse & Search
Full-text search, filter by make/model/year/price/payment, sort options. Reads canonical `InventoryUnit` records directly.

### Unit Detail Page
Photos, specs, pricing, payment estimator, and clear CTAs (inquire, schedule, apply, save).

### Favorites
Save/unsave units. Stored locally in MVP; linked to household identity when the customer authenticates or submits a lead.

### Inquiry
Lightweight form that creates a `Lead` and fires an `inquiry_submitted` event. Auto-cards appear in the staff workstation instantly.

### Payment Estimator
Adjustable term, down-payment, and rate sliders. Disclaimer-first design — estimates are clearly labeled as illustrative.

### Finance Explainer
Educational content: how financing works, what to expect, credit tiers overview. Builds confidence before the customer reaches the apply step.

### Quick App
Multi-step finance application (`QuickApp`). Progress is saved on each step. Submission fires `quick_app_submitted` and creates a workstation card for the finance team.

### Appointment / Test-Drive Request
Date/time picker tied to dealership availability. Creates an `Appointment` record and fires `appointment_requested`.

### Next-Steps Portal
Authenticated view showing the customer's active deal stages, pending actions, and upcoming appointments. Read-only in MVP; interactive actions added in later phases.
