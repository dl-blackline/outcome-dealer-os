# Outcome Dealer OS — Copilot Prompt Bundle

Use the prompts in this file as execution briefs for GitHub Copilot / coding agents.

---

## 1) Master finish roadmap

Execute a **full product-finish roadmap** on Outcome Dealer OS and bring it together as a coherent, premium, production-ready product.

Repository: `dl-blackline/outcome-dealer-os`

### Mission
Treat this as a serious finish-quality product execution plan, not a small feature task.

Your job is to take Outcome Dealer OS from an advanced but still fragmented build into a **cohesive finished product** across:
- internal portal
- inventory operations
- public buyer hub
- finance workflow
- reporting / ops review
- branding / UI consistency
- runtime reliability
- hardening
- final polish

The repo already has the right broad structure: a real custom routed app with internal operations, records, settings, and public buyer-hub flows including inventory, detail, inquiry, compare, favorites, finance, trade, schedule, and next steps. Work within that structure and finish it.

You must execute this in **phases**, but within one coordinated implementation effort.

#### Phase 1 — Foundation consolidation
- audit shell, route resolution, shared layout framing, runtime data patterns, compatibility shims
- identify drift between internal shell, public buyer hub, inventory runtime, settings/import/manage flows, older mock paths
- standardize page framing, route-safe lookup, loading/empty/error states, mutation feedback, image fallback, report/print/export handling, shared content anatomy
- reduce outdated patterns that conflict with runtime behavior
- tighten shell and routing without replacing the custom router

#### Phase 2 — Sitewide design system and theme finish
- implement **real system-wide light/dark mode**
- global theme toggle
- persistent theme preference
- dark and light both usable
- clean shell spacing, page spacing, typography, card anatomy, toolbars, form spacing, tables/lists, empty/loading/error states, scroll behavior, bottom-page breathing room

#### Phase 3 — Finish the inventory operating system
- finish internal inventory browsing and management
- card/list toggle
- filters/toolbars
- manual add/edit
- publish/unpublish
- featured flags
- image management
- AI-ready image enhancement abstraction
- premium placeholders
- manufacturer logo support
- clickable manufacturer filtering on public shop experiences
- bulk inventory decode/import for CSV/XLSX/PDF with duplicate detection, updates, create-new behavior, and review-needed queue
- keep the existing runtime inventory layer as source of truth

#### Phase 4 — Finish the buyer journey
- tighten and connect shop, detail, inquiry, schedule, finance, quick app, trade, favorites, compare, next steps
- preserve selected-vehicle context
- remove dead ends and context loss
- improve CTA hierarchy
- make buyer flow feel like one guided experience

#### Phase 5 — Finish the finance application system
- support both individual and joint/co-applicant applications
- structured `applicationType`, `primaryApplicant`, `coApplicant`
- same-address handling
- applicant-aware validation
- review and document logic for joint apps
- preserve single-applicant flow

#### Phase 6 — Finish the internal operating intelligence layer
- finish executive operating review / observation system
- structured findings, categories, severity, accountability
- reviewed-with-owner workflow
- print-ready report
- email-ready summary
- improve intelligence / operating review / assistant ops / approvals / audit / events pages

#### Phase 7 — Ruthless hardening pass
- app shell
- routing
- auth behavior
- route guards
- stale param handling
- runtime inventory merges
- Supabase/local fallback behavior
- image fallback behavior
- import/upload failure handling
- finance app edge cases
- report/print/email generation paths
- deep linking
- mobile/responsive breakage
- duplicate logic drift
- silent failures
- broken empty/loading/error states

#### Phase 8 — Final finish-quality pass
- premium formatting
- micro-consistency
- final card/list/table tuning
- final form tuning
- final toolbar/button/state consistency
- premium placeholder consistency
- scroll feel
- final public polish
- final internal polish

### Global constraints
- Do not replace the custom router
- Do not create disconnected parallel systems
- Do not overengineer abstractions
- Do not hide failures silently
- Keep the UI premium and intentional
- Keep TypeScript clean
- Keep the app buildable throughout

### Final deliverables
1. concise phase-by-phase summary
2. most important weak spots fixed
3. anything deferred
4. top 3 future enhancements after this finish pass
5. confirmation the app builds successfully
6. remaining-risk note if anything still needs another pass

---

## 2) Strict full-repo hardening pass

Perform a **strict full-repo hardening pass** on Outcome Dealer OS.

This is a **serious engineering hardening pass** across the entire repository.

### Mission
Reduce fragility, remove weak spots, harden runtime behavior, tighten validation and fallback handling, and leave the repo in a materially safer, more production-ready state.

### Audit and harden
- shell, router, auth, route guards, route params
- runtime/data drift
- localStorage/session persistence fragility
- Supabase/local fallback inconsistency
- duplicate transformation logic
- broken image fallback behavior
- placeholder leakage
- upload/import silent failures
- weak validation
- forms that can lose data
- print/export/email brittle behavior
- weak not-found/empty/error states
- mobile layout breakage
- public/private visibility mistakes

### Rules
- prioritize risk reduction over novelty
- do not replace the router
- do not do shallow cleanup
- do not hide broken behavior
- do not ship half-finished hardening abstractions

### Deliverables
1. serious weaknesses found
2. what was hardened
3. what was deferred
4. remaining meaningful risk
5. confirmation that the app builds successfully

---

## 3) Finish-quality polish pass

Perform a **strict finish-quality polish pass** on Outcome Dealer OS after hardening is complete.

### Mission
Take the hardened repo and improve:
- visual consistency
- spacing rhythm
- page formatting
- card/list/table polish
- toolbar/filter polish
- form polish
- typography hierarchy
- micro-interactions
- premium feel
- content readability
- finish-level details
- internal/public presentation quality

### Focus areas
- page-level polish sweep
- card/list/table polish
- toolbar/filter/control polish
- form and step-flow polish
- typography and content hierarchy polish
- theme parity and premium finish
- branding and image polish
- internal/public finish alignment
- micro polish and interaction feel
- final cleanup of rough presentation debt

### Constraints
- do not create new large systems
- do not destabilize hardened flows
- do not sacrifice usability for visual flair
- keep TypeScript clean

### Deliverables
1. biggest polish improvements made
2. pages/surfaces improved most
3. remaining presentation debt
4. note on whether product now feels finish-quality
5. confirmation the app still builds successfully

---

## 4) Inventory page card/list toggle + system-wide light/dark mode + joint credit app

Implement two major upgrades in Outcome Dealer OS:

1. **Inventory page card/list view toggle + real system-wide light/dark mode**
2. **Full joint / co-applicant credit application flow**

### Inventory page
Upgrade `src/app/pages/records/InventoryListPage.tsx` so users can switch between:
- **Card view**
- **List/Table view**

Requirements:
- preserve click-to-open inventory unit, search, status pill, VIN/stock, days in stock, price, public/featured badges
- list mode should be denser and easier to scan
- row click opens unit record
- add clear view toggle near search/tools area
- persist chosen view if practical
- clean loading, no inventory, no search results, filtered empty states

### System-wide theme
Implement a real global theme system with:
- Dark mode
- Light mode
- global theme toggle
- persistent theme preference
- sitewide application

Cover:
- internal app shell
- inventory pages
- record/detail pages
- settings pages
- ops pages
- buyer-hub/public pages where practical

### Joint / co-applicant credit app
Upgrade buyer-facing finance application to support:
- Individual Application
- Joint Application

Requirements:
- clear applicant-type choice
- structured co-applicant data
- same-address option
- manageable step flow
- validation for co-applicant fields
- review page clearly showing both applicants
- structured submit path using `applicationType`, `primaryApplicant`, `coApplicant`
- applicant-aware document requirements where needed
- preserve single-applicant flow

### Acceptance
- inventory page supports both views
- theme is real and persists
- finance app supports both individual and joint applications
- app builds successfully with no TypeScript errors

---

## 5) Manufacturer logos + dark-theme enforcement + clickable make filtering

Implement a **premium dark-theme vehicle manufacturer branding system sitewide** across Outcome Dealer OS.

### Goal
Create a unified manufacturer branding experience that:
1. adds premium vehicle manufacturer logos sitewide
2. makes the logos clickable so users can view all inventory for that manufacturer from the main public page
3. ensures the entire logo system matches the dark luxury theme of the site

### Requirements
- canonical make normalization
- make → logo asset lookup
- graceful fallback behavior
- reusable shared component
- dark-theme-safe rendering
- sitewide usage
- clickable manufacturer filtering
- deep-linkable manufacturer-filtered views like `/shop?make=Ford`
- active filter UI and clear-filter action
- detail-page logo click opens filtered shop view for that make

### Constraints
- no disconnected branding/filter system
- no one-off logo logic scattered across pages
- do not clutter cards with oversized logos
- keep TypeScript clean

---

## 6) Fixed Ops / Recon Cost Hub

Implement a **Fixed Ops / Recon Cost Hub** inside Outcome Dealer OS.

### Goal
Create a real internal **unit-cost and recon operating hub** tied to inventory units.

Support:
- upload POs / invoices / cost records
- log recon activity on units
- note known issues
- move units through recon stages
- track fuel, detail, parts, labor, transport, dealer pack, etc.
- track total invested cost
- track age of inventory
- track floor plan interest expense
- reconcile total unit cost cleanly

### Required sections
1. Recon Overview
2. Known Issues
3. Recon Stage Tracker
4. Cost Ledger
5. Documents / POs / Invoices
6. Floor Plan / Aging
7. Unit Cost Summary

### Runtime/domain work
Create a proper fixed-ops / recon domain that supports:
- recon stages and history
- issue tracking
- cost ledger entries
- document records
- local fallback and Supabase-backed persistence

### Inventory page integration
Add useful ops signals to inventory overview surfaces such as:
- recon stage
- open issues count
- total recon spend
- total invested cost
- frontline-ready status
- days in stock
- stalled/aged indicators

---

## 7) Back Office Management section

Implement a full **Back Office Management** section for the **office / accounting / title-tag department**.

### Goal
Build a serious internal back-office hub for:
- office administration
- accounting
- funding
- title/tag
- payoffs
- deal audit/compliance
- receivables/payables tied to deals and inventory
- document collection and status tracking

### Core work
- create a Back Office Dashboard / Hub
- deal-level back-office jacket/record
- funding workflow
- title/tag workflow
- payoff tracker
- accounting exceptions / payables / receivables support
- tasking and accountability
- queue-based views:
  - Office Review Queue
  - Funding Queue
  - Title/Tag Queue
  - Payoff Queue
  - Accounting Exceptions
  - Missing Documents
  - Ready to Finalize

### Document vault
Implement a **large-document scan vault** for Back Office.

Support:
- large PDF uploads
- large image scan uploads
- multiple files per record
- attaching docs to deal, inventory unit, household/customer, credit app, back-office item
- later retrieval through search/filter/browse
- preview/download access
- organized categorization
- upload progress and clear failure handling
- Supabase-backed storage when configured and local/runtime fallback when not

### Outcome
The system should function as a real dealership back-office operating layer, not a note page.

---

## 8) Password-protected wholesale pricing view

Implement a **password-protected secondary wholesale pricing view** for inventory.

### Goal
Create a separate inventory pricing view for **wholesale pricing** that is:
- hidden from normal public retail experience
- password protected
- usable for internal or approved wholesale buyers
- tied to the same inventory records as retail view
- cleanly separated from standard retail pricing presentation

### Requirements
- extend inventory model for `wholesalePrice`, wholesale visibility, and optional wholesale notes/status
- backend users can manage wholesale fields
- password-gated wholesale routes such as `/wholesale` and `/wholesale/:unitId`
- wholesale access state can persist for a session
- access can be cleared/locked
- wholesale inventory view uses wholesale pricing
- retail public pages remain on retail pricing
- no leakage of wholesale pricing outside gated flow

### Deliverables
- inventory model/runtime support for wholesale pricing
- backend management support for wholesale fields
- password-gated wholesale route(s)
- wholesale inventory/detail UI
- clean access/session helper

---

## 9) How to execute

Recommended order:
1. Master finish roadmap
2. Strict hardening pass
3. Polish pass
4. Inventory/theme/joint app work
5. Manufacturer logos/filtering
6. Fixed Ops / Recon hub
7. Back Office Management
8. Wholesale pricing view

For each prompt:
- identify the highest-risk or highest-value parts first
- make real changes, not superficial stubs
- preserve existing working flows where possible
- keep the app buildable
- summarize what changed and what remains
