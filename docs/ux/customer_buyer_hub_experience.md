# Customer Buyer Hub — UX Vision

## Design North Star

Premium, fast, trustworthy. The buyer hub should feel like a modern fintech product, not a legacy dealer website. Every pixel earns the customer's confidence.

## Core UX Principles

### Clarity Over Clutter
- One primary CTA per viewport. Secondary actions are visible but visually subordinate.
- Inventory cards show price, payment estimate, key specs — nothing else.
- Detail pages use progressive disclosure: essentials first, full specs on expand.

### Trust Over Tricks
- **No bait-and-switch pricing.** The price on the listing is the price on the detail page.
- **Clear estimate disclaimers.** Payment estimates are labeled "Estimated" with visible assumptions (term, rate, down payment). Adjusting inputs updates the estimate in real time.
- **Transparent next-steps.** After any submission (inquiry, app, appointment), the customer sees exactly what happens next and when to expect a response.

### Conversion Through Confidence
- Customers convert when they feel informed, not pressured.
- Finance explainer content is available at every decision point — not gated behind a form.
- The Quick App saves progress per step; abandonment is recoverable.
- Saved favorites and recent views persist across sessions.

### Seamless Handoff to Staff
- Every customer action produces a record the staff already knows how to work.
- When a customer calls or walks in, the salesperson sees their browsing history, saved units, and application status — no "start from scratch."
- The next-steps portal keeps the customer informed between interactions, reducing inbound "what's my status?" calls.

## Layout & Responsiveness

### Mobile-First
- All layouts designed for 375px first, scaled up to tablet and desktop.
- Touch targets ≥ 44px. No hover-only interactions.
- Inventory grid: 1-col on mobile, 2-col on tablet, 3–4-col on desktop.

### Conversion-Optimized Structure
```
┌────────────────────────────────┐
│         BuyerHubNav            │  ← sticky top nav
├────────────────────────────────┤
│                                │
│        Primary Content         │  ← inventory grid, detail, forms
│                                │
├────────────────────────────────┤
│     Contextual CTA Bar         │  ← sticky bottom on mobile (e.g., "Schedule Test Drive")
├────────────────────────────────┤
│          Footer                │  ← dealership info, legal, trust badges
└────────────────────────────────┘
```

## Trust Signals

| Signal | Placement |
|---|---|
| "No-Surprise Pricing" badge | Inventory cards + detail header |
| Estimate disclaimer | Inline with every payment figure |
| "What Happens Next" panel | Post-submission confirmation |
| Response-time expectation | Post-inquiry ("We typically respond within 1 hour") |
| Secure-form indicator | Quick App and trade-in forms |

## Key Interactions

- **Save / Unsave** — heart icon toggle; instant feedback, no page reload.
- **Payment Estimator** — sliders for term, down payment, rate; estimate updates live.
- **Quick App** — step indicator, per-step save, back navigation, clear completion state.
- **Appointment Picker** — calendar + time-slot grid; disabled slots for unavailable times.
- **Next-Steps Portal** — timeline view of deal stages with current-stage highlight.
