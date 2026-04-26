You are working in the Outcome Dealer OS repo.

I have added a design reference package to the repo. Treat the images in this folder as the visual source of truth for the internal portal redesign:

- `mockups/01_control_center.png`
- `mockups/02_leads_command_center.png`
- `mockups/03_inventory_command.png`
- `mockups/04_customer_360.png`
- `mockups/05_deal_desk.png`
- `mockups/06_finance_center.png`
- `mockups/07_calendar_execution.png`
- `mockups/08_analytics_reports.png`
- `mockups/09_ai_copilot.png`
- `mockups/10_settings_admin.png`

Primary goal:
Redesign the Outcome Dealer OS internal portal so it matches the premium design quality, visual language, layout discipline, and page structure shown in these mockups.

Do not build a basic dark theme. This must feel like a high-end enterprise dealership operating system: dark brushed metal, cinematic automotive, glossy beveled panels, sharp borders, neon red/blue/purple accent lighting, premium spacing, crisp typography, and high-density operational widgets that are still clean and readable.

GLOBAL DESIGN SYSTEM REQUIREMENTS

1. Overall visual direction
- Dark matte black / charcoal / gunmetal base.
- Subtle brushed-metal, carbon, smoke, and glass-panel feel.
- No gold theme.
- Primary accents: performance red, electric blue, ultraviolet purple.
- Secondary status colors: green for success, orange for warnings, red for urgent, blue for neutral/action.
- Use thin glowing dividers, beveled cards, soft inner shadows, glassy overlays, and premium gradient borders.
- UI should feel cinematic, powerful, modern, and automotive.
- Match the quality level of the attached mockups, not just the rough layout.

2. Navigation shell
Implement or refactor a consistent app shell matching the mockups:
- Left vertical sidebar with Outcome Dealer OS logo at top.
- Sidebar items:
  - Control Center
  - Leads
  - Inventory
  - Deals
  - Customers
  - Finance
  - Calendar
  - Tasks
  - AI Copilot
  - Reports
  - Settings
- Add count badges where applicable: Leads, Inventory, Deals, Tasks.
- Active item uses red glow, dark red gradient, and a thin red edge highlight.
- Bottom sidebar area should show a performance/brand card and system status.

3. Top header
Every internal page should use the same header:
- Global search bar with placeholder like: “Search across leads, inventory, deals, customers…”
- Quick Actions dropdown.
- Message/notification icons with badges.
- User avatar/name/role dropdown.
- Thin red highlight line or glow under the header.

4. Shared page styling
Create reusable components where possible:
- AppShell / Sidebar / Topbar
- MetricCard
- DataPanel
- StatusBadge
- GlowButton
- DataTable
- FilterBar
- MiniSparkline
- SectionHeader
- ActionCard
- Empty/Loading/Error states that match the same visual system

All tables should look premium and operational:
- Sticky/clear headers when appropriate.
- Dark row hover states.
- Inline chips for status and priority.
- Action menus on each row.
- Clean pagination and rows-per-page controls.

All cards should use consistent:
- Border radius
- Border color
- Background gradient
- Subtle noise/metal texture if feasible with CSS
- Soft glow around active/important elements
- Proper internal spacing

PAGE-BY-PAGE TARGETS

1. Control Center
Reference: `01_control_center.png`
Build the main operating dashboard with:
- KPI cards: Units Sold, Appointments Set, Leads Today, Gross Profit, Close Rate, Active Tasks.
- Today’s Performance card with pace-to-goal rows and mini trend visuals.
- Sales Funnel card with stages: New Leads, Contacted, Appointments, Demo, Delivered.
- Live Lead Queue table.
- Inventory Spotlight vehicle cards.
- Needs Attention panel.
- Team Activity feed.
- AI Copilot mini dock.
- Upcoming Events preview.
- Today’s Tasks panel.
- Bottom dealership operations strip.

2. Leads
Reference: `02_leads_command_center.png`
Build a Lead Command Center:
- Search/filter bar: source, status, salesperson, more filters.
- Buttons: New Lead, Import, Bulk Actions.
- KPI cards: Total Leads, New This Week, Contact Rate, Appointment Rate, Conversion Rate.
- Pipeline strip: New, Contacted, Appointment Set, Demo, Working Deal, Sold, Lost.
- Large lead table with columns: customer, vehicle interest, source, lead score, last touch, next task, rep, status.
- Right sidebar: Hot Leads, Needs Follow-Up Today, Activity Feed.

3. Inventory
Reference: `03_inventory_command.png`
Build Inventory Command:
- Top controls: search inventory, saved filters, bulk actions, import, export.
- KPI cards: Total Units, New Arrivals, Aged 30+, Aged 60+, Avg Market Price Gap, VDP Views.
- Left filter rail: price, year, body style, make, model, status, age in stock.
- Center inventory cards in grid view with stock number, miles, days in stock, price, market comparison, status tags.
- Grid/table toggle.
- Right sidebar: Pricing Recommendations, Market Alerts, Aged Inventory Actions.

4. Customer 360 / Lead Detail
Reference: `04_customer_360.png`
Build a premium profile view:
- Customer hero card with avatar, contact info, lead score, source, assigned rep, current stage, desired vehicle.
- Quick actions: Call, Text, Email, Schedule, Create Deal.
- Left profile summary and vehicle interests.
- Center customer journey timeline.
- Right upcoming tasks, financing status, documents, AI insights.
- Bottom tabs: Notes, Activity, Vehicles, Trade, Credit App, Documents.

5. Deals / Deal Desk
Reference: `05_deal_desk.png`
Build a high-end Deal Desk page:
- Selected customer and selected vehicle header.
- Actions: Save Deal, Print Worksheet, Present to Customer.
- Deal Structure panel: sale price, cash down, trade, payoff, fees, products, taxes, front/back gross, total financed.
- Payment scenarios.
- Lender comparison cards with APR, term, payment, approval likelihood, max advance.
- Deal workflow panel with stipulations, approval status, send-to-lender, e-sign/doc checklist.
- Trade appraisal snapshot, product menu, profitability summary.

6. Finance Center
Reference: `06_finance_center.png`
Build finance/lender management:
- KPI cards: Pending Applications, Approvals Today, Average APR, Subprime Approvals, Stips Outstanding.
- Credit Application Queue table.
- Lender Matrix / Qualification table.
- Application Preview.
- Document Requirements upload/status panel.
- Recent Lender Communication panel.

7. Calendar & Execution
Reference: `07_calendar_execution.png`
Build calendar/tasks execution center:
- Controls: Today, date range, Month/Week/Day/Agenda, department filter, salesperson filter.
- Left rail: Agenda Snapshot, Quick Add, Task Filters, Overdue Tasks.
- Central week calendar grid with color-coded appointments, demos, deliveries, meetings, team events.
- Right panel: Today task checklist, reminders, team availability.
- Bottom summary strip.

8. Analytics & Reports
Reference: `08_analytics_reports.png`
Build reports dashboard:
- Filters: date range, department, salesperson, lead source, store.
- KPI cards: Units Sold, Gross Profit, Finance Penetration, Close Rate, Appointment Show Rate, Avg Front/Back Gross.
- Charts: sales trend, lead source performance, gross profit by salesperson, funnel conversion, inventory aging, leaderboard.
- Right AI Insights panel with recommended actions.
- Export and refresh controls.

9. AI Copilot
Reference: `09_ai_copilot.png`
Build ChatGPT-style AI workspace:
- Main conversation panel.
- Prompt composer with Attach, Voice, Tools, Send.
- Assistant cards with KPI summaries, tables, generated follow-up drafts, and action buttons.
- Right context sidebar: recent leads, selected customer, actionable recommendations, suggested automations, one-click actions.
- Keep it functional and ready to connect to actual AI endpoints later.

10. Settings & Admin
Reference: `10_settings_admin.png`
Build admin settings:
- Internal settings sub-nav: General, Users & Roles, Pipeline, Integrations, Goals & KPIs, Notifications, Branding, Security.
- Users & Roles table.
- Permission matrix preview.
- KPI goal settings.
- Theme and preferences controls.
- Active integrations card.

IMPLEMENTATION INSTRUCTIONS

1. First inspect the existing repo structure.
- Identify framework, routing, layout components, pages, state management, styling method, and existing data models.
- Do not break current functionality.
- Preserve existing routes where possible.
- Replace weak/placeholder UI with the new premium design language.

2. Add the mockups into the repo in a clear design reference folder if not already there.
Suggested path:
- `docs/design/outcome-dealer-os-premium-redesign/mockups/`

3. Create or update a design system layer.
Prefer reusable CSS variables/classes/tokens:
- colors
- shadows/glows
- card borders
- typography scale
- spacing
- status colors
- table styles
- button styles
- input styles
- badge styles

4. Implement the shell first.
- Sidebar and topbar should match all mockups.
- Then update pages one by one.

5. Use realistic mock/sample data only where live data is not already available.
- Do not remove existing data fetches.
- When data is missing, gracefully fall back to sample/demo records that match the page designs.
- Any demo data should be clearly isolated and easy to replace with real data.

6. Responsive priority
- Desktop is the priority.
- Layout must be excellent on 1440px+ screens.
- Tablet/mobile can stack panels, but do not compromise desktop quality.

7. Quality bar
Do not stop at “functional.” This must look finished:
- Align everything precisely.
- Avoid cramped spacing.
- Ensure tables are readable.
- Use consistent panel widths/heights.
- Use hover states, active states, loading skeletons, empty states, and error states.
- No broken icons.
- No unreadable contrast.
- No default browser-looking controls.

8. Hardening
After implementation:
- Run typecheck/lint/build/test scripts available in package.json.
- Fix compile errors.
- Verify all routes load.
- Verify sidebar navigation works.
- Verify the app does not show a blank page.
- Verify no console errors from missing variables/components.
- Commit changes with a clear message.

Suggested commit message:
`feat: redesign Outcome Dealer OS internal portal with premium dealer command UI`

Acceptance criteria:
- Outcome Dealer OS visually matches the attached mockup direction across the main internal portal pages.
- App shell is consistent across pages.
- Main modules exist and load: Control Center, Leads, Inventory, Customers, Deals, Finance, Calendar, Reports, AI Copilot, Settings.
- Existing functionality/data integrations are preserved where present.
- Build passes.
- UI feels premium, cinematic, dark metal, enterprise-grade, and dealership-specific.
