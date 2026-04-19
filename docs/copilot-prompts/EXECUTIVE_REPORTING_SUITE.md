# Executive Reporting Suite — Copilot Prompt

Implement a full **Executive Reporting Suite** in Outcome Dealer OS.

Repository: `dl-blackline/outcome-dealer-os`

## Goal
Build a serious internal **executive reporting and scheduled reporting system** for leadership.

This should not be a single export button.
This should be a true reporting suite with:
- customizable reports
- a large selection of pre-saved standard template reports
- filters and date ranges
- print/export/email-ready outputs
- saved report definitions
- scheduled daily email reporting
- the ability to email reports to chosen recipients automatically

The repo already has a strong internal shell with dedicated operations pages and internal routing, so this should live as a real internal management surface, not as a random utility modal.

## Business intent
Leadership should be able to quickly answer questions like:
- What happened today?
- What changed this week?
- What inventory is aging?
- What deals are pending?
- What recon money is being spent?
- What units are stuck?
- What office/title/funding exceptions exist?
- What is the daily executive pulse?
- What should be auto-emailed every morning?

This suite should support both:
- one-off report generation
- recurring scheduled report delivery

---

## Part 1 — Create a true Executive Reporting section

Create a dedicated internal reporting section, either by upgrading existing operations surfaces or by adding a clean new route such as:
- `/app/ops/reports`
- `/app/ops/reports/:id`
- `/app/ops/reports/schedules`
- `/app/ops/reports/templates`

Wire it cleanly into the internal app shell and operations area.

### Required top-level areas
Create:
1. **Reports Dashboard**
2. **Template Reports Library**
3. **Custom Report Builder**
4. **Saved Reports**
5. **Scheduled Reports**
6. **Report Delivery / Email History**

This should feel like a real executive reporting suite.

---

## Part 2 — Pre-saved standard template reports

Create a broad library of built-in template reports.

### Required concept
Leadership should be able to click a report template and run it immediately.

### Include template categories like:
#### Executive summary
- Daily Executive Summary
- Weekly Executive Summary
- Month-to-Date Executive Summary
- Store Health Snapshot
- Performance Pulse Report

#### Inventory
- Current Inventory Snapshot
- Aging Inventory Report
- Inventory by Status
- Inventory by Make/Model
- Featured vs Non-Featured Inventory
- Retail vs Wholesale Visibility Report
- Inventory Missing Photos Report
- Inventory Cost / Recon Summary
- Units Stuck in Recon
- Inventory Pricing Exceptions

#### Sales / deals
- Deals Sold Today
- Deals Pending Delivery
- Deals Pending Funding
- Unfunded Deals Aging Report
- Missing Stips Report
- Gross / Deal Performance Summary
- Salesperson Performance Summary
- F&I Production Summary

#### Back office
- Title Pending Report
- Registration / Tag Pending Report
- Payoff Pending Report
- Accounting Exceptions Report
- Missing Documents Report
- Ready to Finalize Report

#### Fixed ops / recon
- Recon Queue Report
- Recon Spend by Unit
- Open Vehicle Issues Report
- Dealer Pack / Fuel / Soft Cost Summary
- Units With High Invested Cost
- Floor Plan / Age Exposure Report

#### Lead / customer / CRM
- New Leads by Day
- Follow-Up Due Report
- Leads Stuck Without Activity
- Credit App Pipeline Report
- Customer Journey Status Summary

#### Website / marketing / digital
- Public Inventory Health Report
- Website Listing Quality Report
- Missing Description / Missing Images Report
- Marketing / Website Observation Summary if tied to internal ops review

These templates should be easy to extend later.

---

## Part 3 — Custom report builder

Implement a true **custom report builder**.

Users should be able to define:
- report name
- report description
- source dataset(s)
- filters
- columns
- grouping
- sorting
- date range
- output format
- recipients if scheduled

### Data sources should include at minimum:
- inventory
- deals
- credit applications
- back-office records
- fixed ops / recon records
- operating review records
- title/payoff/funding queues
- tasks / follow-ups if present

### Builder capabilities
Allow users to:
- choose a base dataset
- select filters
- select columns to include
- group by fields like status, make, salesperson, lender, stage, category
- sort results
- save as reusable report
- run instantly
- export
- email
- schedule

Do not overbuild a BI warehouse.
Build a practical dealership-grade report builder.

---

## Part 4 — Saved reports

Users should be able to save report definitions.

Support:
- save report
- rename report
- duplicate report
- edit saved report
- archive/delete saved report
- mark favorite/pinned reports

Each saved report should remember:
- name
- source
- filters
- selected columns
- grouping
- sorting
- output settings
- schedule settings if applicable

This should feel like a usable internal tool, not a stateless report page.

---

## Part 5 — Scheduled daily email reporting

This is critical.

Implement **scheduled report delivery**, especially for daily reporting.

### Required behavior
Users should be able to:
- choose a report
- choose recipients
- choose schedule frequency
- choose time of day
- choose timezone
- enable/disable schedule
- edit or delete schedule

### Frequencies to support
At minimum:
- daily
- weekdays only
- weekly
- monthly

### Required daily use case
A user should be able to pre-save a report and configure:
- “Email this every day at 7:00 AM”
- to one or many recipients
- with a clean subject line
- with a polished report body
- with optional attachment/export

This is one of the most important features.

---

## Part 6 — Email delivery behavior

Implement clean report emailing.

### Report email requirements
Emails should support:
- recipient selection
- editable subject line
- optional intro note
- clean HTML/plaintext-friendly report summary
- optional attached export if supported
- useful formatting for leadership consumption

### Email output should feel executive-ready
Not ugly raw dumps.

Examples:
- top summary metrics
- grouped sections
- exceptions highlighted
- clean tables/blocks
- concise narrative summary if useful

### Delivery history
Track:
- sent date/time
- recipients
- report name
- status
- failure reason if any

If full email infrastructure is not already configured, build the scheduling and delivery architecture cleanly so it works with the repo’s existing runtime patterns and can integrate with actual email delivery later.

---

## Part 7 — Report rendering and export formats

Each report should support:
- in-app view
- print-friendly view
- export-ready view
- email-ready view

### At minimum support:
- print
- copy/export text summary
- CSV export where logical
- PDF-ready print layout if practical

### Requirements
- print should be polished
- report pages should not print app chrome accidentally
- grouped data should remain readable
- executive summary blocks should render well

---

## Part 8 — Executive dashboard / pulse report

Create a high-level executive report/dashboard surface that leadership can use quickly.

### Include blocks like:
- total active inventory
- aged inventory count
- total units in recon
- open title/funding/payoff exceptions
- today’s sold deals
- unfunded deals
- missing docs count
- recon spend today / this week
- floor plan exposure snapshot
- major red-flag items
- quick links to detailed reports

This should work as:
- an at-a-glance internal page
- a source for daily scheduled email summaries

---

## Part 9 — Report architecture and data model

Create a proper reporting domain.

Suggested modules:
- `src/domains/reporting/reporting.types.ts`
- `src/domains/reporting/reporting.runtime.ts`
- `src/domains/reporting/reporting.templates.ts`
- `src/domains/reporting/reporting.scheduler.ts`
- `src/domains/reporting/reporting.email.ts`

Or an equivalent clean structure.

### Requirements
Support:
- template definitions
- saved report definitions
- scheduled report definitions
- report run results / renderable outputs
- delivery history
- local/runtime fallback if backend is not configured
- Supabase-backed persistence if configured

Do not create a disconnected throwaway reporting utility.

---

## Part 10 — Filters and customization rules

A strong reporting suite depends on usable filtering.

Support filters like:
- date range
- status
- make/model
- salesperson
- F&I manager
- lender
- title status
- funding status
- recon stage
- issue severity
- published / hidden
- featured / non-featured
- days-in-stock bucket
- cost thresholds
- missing docs
- assigned owner
- store/department if relevant

The builder and templates should both use a coherent filtering model.

---

## Part 11 — UX requirements

This suite should feel:
- executive
- powerful
- clean
- highly usable
- premium
- not cluttered
- not like a spreadsheet dumped into the app

Prioritize:
- scanability
- clarity
- speed to useful output
- clean configuration
- obvious next actions
- practical operational value

---

## Part 12 — Constraints
- do not replace the router
- do not create a disconnected reporting mini-app
- do not make this only one export button and call it done
- do not overbuild a full enterprise BI platform
- do not ignore scheduling and email delivery
- do not break current internal operational flows
- keep TypeScript clean
- keep the design premium and internally usable

---

## Acceptance criteria
This is only complete if:
1. there is a dedicated executive reporting section
2. there is a substantial library of pre-saved standard report templates
3. users can build custom reports
4. users can save reusable report definitions
5. reports can be viewed in-app cleanly
6. reports can be printed/exported cleanly
7. reports can be emailed manually
8. reports can be scheduled for daily/recurring email delivery
9. recipients, schedules, and delivery history can be managed
10. the suite feels like a real executive reporting system
11. the app builds successfully with no TypeScript errors

## Deliverables
- reporting domain/runtime/types
- executive reporting routes/pages
- template report library
- custom report builder
- saved reports support
- scheduled reports support
- email delivery/delivery history support
- print/export/report rendering support
- short implementation summary explaining:
  - how templates are defined
  - how custom reports are saved
  - how scheduled delivery works
  - what data sources are included
  - what future integrations could make it even stronger

---

# Bonus Prompt — Daily Executive Email Digest

Implement a **Daily Executive Email Digest** inside Outcome Dealer OS.

## Goal
Create a polished, leadership-ready daily digest that can be scheduled to send automatically every morning.

This should be one of the core default reports in the Executive Reporting Suite.

## Required content
Build a branded executive email digest that can include:
- executive summary headline
- inventory snapshot
- aging inventory alerts
- deals sold today / yesterday
- unfunded deals
- title / payoff / funding exceptions
- recon queue summary
- high-cost units / high-risk units
- missing docs summary
- key operating red flags
- links back into the relevant pages in the internal portal if practical

## Format expectations
The email should feel:
- premium
- concise
- executive-ready
- cleanly structured
- easy to scan on desktop and mobile

Use:
- strong section hierarchy
- compact summary blocks
- clear counts and exceptions
- tasteful visual emphasis
- not a giant raw dump of rows

## Scheduling behavior
Support:
- daily schedule
- weekdays-only schedule
- configurable send time
- timezone-aware scheduling
- recipient list management
- subject line templates

## Subject examples
- Daily Executive Summary — Outcome Dealer OS
- Morning Store Pulse — [Date]
- Daily Dealership Health Report — [Date]

## Delivery requirements
- log each send
- log success/failure
- allow preview before sending
- allow manual send now
- allow schedule enable/disable

## Acceptance
This is complete if:
- a polished daily executive email digest exists
- it can be previewed in-app
- it can be sent manually
- it can be scheduled automatically
- it uses live dealership/system data cleanly
- it fits naturally into the Executive Reporting Suite
