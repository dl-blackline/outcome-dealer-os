# Customer-Facing Surface Map

## Route Structure

All buyer hub routes live under the `#/shop/…` hash namespace, parallel to the internal OS at `#/app/…`.

| Route | Surface | Purpose |
|---|---|---|
| `/shop` | Inventory Browse | Search, filter, and sort live inventory |
| `/shop/:unitId` | Vehicle Detail | Photos, specs, pricing, payment estimator, CTAs |
| `/compare` | Compare Units | Side-by-side comparison of saved units |
| `/favorites` | Saved Units | Customer's favorited inventory |
| `/finance` | Finance Hub | Affordability tools, educational content, credit-tier overview |
| `/finance/apply` | Quick App | Multi-step finance application entry |
| `/trade` | Trade-In Intake | Vehicle info + condition form for trade appraisal |
| `/schedule` | Appointment Request | Test-drive or visit scheduling |
| `/my-next-steps` | Customer Portal | Deal progress, pending actions, upcoming appointments |

## Shell & Navigation Components

### BuyerHubShell

A lighter shell than the internal `AppShell`. No sidebar, no workstation chrome. Provides:

- Top-level layout wrapper for all `/shop/…` and related buyer routes
- Responsive container with max-width constraints
- Slot for `BuyerHubNav` at the top
- Footer with dealership info, legal links, and trust badges
- Toast/notification region for confirmations (e.g., "Inquiry sent!")

### BuyerHubNav

Top navigation bar replacing the internal sidebar. Contains:

- Dealership logo / brand mark (links to `/shop`)
- Primary nav links: Browse, Finance, Trade, Schedule
- Utility actions: Favorites (with count badge), My Next Steps
- Mobile: collapses to hamburger menu with slide-out drawer

## Relationship to Internal OS

```
┌─────────────────────────────────────────┐
│           Outcome Dealer OS             │
│                                         │
│  #/app/…          #/shop/…              │
│  ┌───────────┐    ┌──────────────────┐  │
│  │ AppShell  │    │ BuyerHubShell    │  │
│  │ (sidebar) │    │ (top nav, light) │  │
│  └───────────┘    └──────────────────┘  │
│         │                  │            │
│         └──────┬───────────┘            │
│                ▼                        │
│     Canonical Types + Event Bus         │
│  (InventoryUnit, Lead, QuickApp, …)    │
└─────────────────────────────────────────┘
```

Both shells render within the same SPA. Route-level code splitting keeps the buyer hub bundle separate from internal OS routes.
