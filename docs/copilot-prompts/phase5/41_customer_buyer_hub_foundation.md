# Prompt 41 — Customer-Facing Buyer Hub Foundation

Plan and begin the customer-facing side of Outcome Dealer OS as the ultimate buyer hub designed to convert shoppers into applicants, appointments, and deals.

## Product intent

This is not just a brochure website.
This is the dealership’s customer operating surface.

It should let buyers:
- browse listings
- filter and compare units
- inquire on units
- save favorites
- calculate payments
- explore finance products
- start quick app / finance application flows
- evaluate trade-in options
- request appointments or test drives
- track progress through inquiry, quote, finance, and delivery-related steps

The buyer hub should feel premium, fast, trustworthy, and conversion-optimized.

## Goals

- define the customer-facing architecture as a first-class surface of Outcome Dealer OS
- connect it cleanly to the internal OS instead of building a disconnected site
- design the funnel from listings to inquiry to finance to appointment to deal progression
- preserve one source of truth across customer-facing and staff-facing surfaces

## Tasks

1. Create or update these planning docs:
   - `/docs/product/customer_buyer_hub_vision.md`
   - `/docs/architecture/customer_facing_surface_map.md`
   - `/docs/architecture/buyer_hub_to_internal_os_flow.md`
   - `/docs/ux/customer_buyer_hub_experience.md`
2. Define the customer-facing information architecture for at least:
   - Listings / Inventory Search
   - Unit Detail Page
   - Compare / Save / Favorite flow
   - Payment / affordability tools
   - Finance products and protection products explainer
   - Quick app / finance application entry
   - Inquiry / contact flow
   - Trade-in intake
   - Appointment / test drive booking
   - Customer progress / next-step portal
3. Define canonical object relationships between customer-facing and internal systems for:
   - inventory unit
   - lead / inquiry
   - household / customer
   - desk scenario / quote
   - quick app / credit app
   - deal
   - workstation card
   - approval / event / audit where relevant
4. Define conversion-critical events and operating signals such as:
   - listing_viewed
   - unit_saved
   - inquiry_started
   - inquiry_submitted
   - payment_scenario_viewed
   - finance_products_viewed
   - quick_app_started
   - quick_app_submitted
   - appointment_requested
   - appointment_confirmed
   - trade_in_started
   - trade_in_submitted
5. Map how these customer events should create or update internal OS records and workstation cards.
6. Propose the initial route structure for the buyer hub, such as:
   - `/shop`
   - `/shop/:unitId`
   - `/compare`
   - `/favorites`
   - `/finance`
   - `/finance/apply`
   - `/trade`
   - `/schedule`
   - `/my-next-steps`
7. Define the first MVP release scope versus later expansion.

## MVP recommendation

The first customer-facing MVP should include:
- inventory browse/search page
- unit detail page
- save/favorite flow
- simple inquiry form
- payment estimator
- finance products explainer page
- quick app entry
- appointment request flow
- next-step status page tied to the user inquiry/application state

## Rules

- do not build a disconnected marketing site
- do not create duplicate data models separate from the internal OS
- do not overpromise fully automated lender or deal flows on day one
- prioritize trust, clarity, and conversion
- preserve Outcome Dealer OS as one unified platform with staff-facing and customer-facing layers

## Deliverable

- customer buyer hub planning docs
- customer-to-internal object flow map
- event taxonomy for customer-side conversion
- recommended MVP scope and route structure
