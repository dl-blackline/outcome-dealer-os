# Outcome Dealer OS: Product Requirements Document

A premium AI-native dealership operating system that unifies the entire dealership value chain under one intelligent command layer.

**Experience Qualities**:
1. **Professional Confidence** - Every surface feels authoritative and trustworthy, like a command center for high-stakes decisions
2. **Effortless Clarity** - Information hierarchy is immediately apparent; users find what they need without searching
3. **Controlled Power** - The system offers sophisticated capabilities but never overwhelming complexity

**Complexity Level**: Complex Application (advanced functionality with role-based multi-view architecture)

This is a comprehensive dealership operating system with canonical data models, event-driven architecture, role-based access control, approval workflows, and AI co-pilot features. It handles the complete customer lifecycle from lead generation through vehicle delivery and service retention.

## Essential Features

### Role-Based Access Control
- **Functionality**: Enforce granular permissions based on user role (owner, GM, sales rep, F&I manager, etc.)
- **Purpose**: Ensure users only access data and actions appropriate for their job function
- **Trigger**: User login and role assignment
- **Progression**: User authenticates → system loads role → UI adapts to show only permitted features → permission checks enforce data access boundaries
- **Success criteria**: No unauthorized data access; UI dynamically hides unavailable features

### Event-Driven State Management
- **Functionality**: Capture every meaningful state change as immutable events in a central event stream
- **Purpose**: Create audit trails, enable AI training, support analytics, allow state reconstruction
- **Trigger**: Any state change (lead created, deal funded, appointment scheduled, etc.)
- **Progression**: Action occurs → event emitted with structured payload → event persisted → downstream systems react
- **Success criteria**: Complete event history for compliance; ability to reconstruct state from events

### Approval Workflow System
- **Functionality**: Route sensitive actions (trade value changes, financial outputs, AI decisions) through manager approval queues
- **Purpose**: Enforce separation of duties and financial controls
- **Trigger**: User attempts action requiring approval
- **Progression**: Action attempted → permission check → approval request created → manager notified → manager approves/denies → original action completes or fails
- **Success criteria**: No unauthorized financial changes; clear approval audit trail

### Canonical Object Management
- **Functionality**: Maintain single source of truth for all entities (households, leads, deals, inventory, etc.)
- **Purpose**: Eliminate duplicate records and data inconsistency
- **Trigger**: Create or update operations on any entity
- **Progression**: User initiates change → validation → uniqueness check → canonical record updated → event emitted
- **Success criteria**: No duplicate households or leads; complete data lineage

### Premium Role-Aware Shell
- **Functionality**: Navigation sidebar, topbar, command palette, and notification center that adapt to user role
- **Purpose**: Provide context-appropriate interface for each job function
- **Trigger**: Application load with authenticated user
- **Progression**: User logs in → role detected → sidebar shows permitted nav items → dashboard shows role-specific metrics
- **Success criteria**: Sales reps see sales tools; service advisors see service tools; executives see analytics

## Edge Case Handling

- **Network Failures** - Event buffering with retry logic; optimistic UI updates with rollback
- **Duplicate Submissions** - Idempotency keys prevent duplicate event processing
- **Permission Changes Mid-Session** - Session refresh forces re-authentication if role permissions change
- **Orphaned Records** - Foreign key constraints and cascade rules prevent orphaned data
- **Concurrent Edits** - Optimistic locking with conflict resolution UI
- **Invalid Event Payloads** - Zod schema validation rejects malformed events before persistence

## Design Direction

The design should evoke the feeling of a **luxury automotive command center** — sophisticated, powerful, restrained. Think high-end car interiors: premium materials, perfect fit and finish, nothing extraneous. Dark-first palette with rich contrast, cinematic depth, and purposeful use of space.

## Color Selection

This is a dark-first enterprise application with deep backgrounds and vibrant accent colors that feel premium and automotive.

- **Primary Color**: Deep electric blue `oklch(0.68 0.19 264)` - Authority and intelligence, reminiscent of luxury car dashboards
- **Secondary Colors**: Dark charcoal backgrounds `oklch(0.12 0.01 240)` for depth; medium slate `oklch(0.22 0.02 240)` for surfaces
- **Accent Color**: Vibrant cyan `oklch(0.75 0.15 220)` for interactive elements and success states
- **Destructive**: Controlled red `oklch(0.60 0.24 20)` for warnings and dangerous actions

**Foreground/Background Pairings**:
- Background (Deep Charcoal `oklch(0.12 0.01 240)`): Light Gray text (`oklch(0.96 0.01 240)`) - Ratio 18.2:1 ✓
- Card (Elevated Charcoal `oklch(0.15 0.01 240)`): Light Gray text (`oklch(0.96 0.01 240)`) - Ratio 15.8:1 ✓
- Primary (Electric Blue `oklch(0.68 0.19 264)`): Deep text (`oklch(0.08 0.01 240)`) - Ratio 12.4:1 ✓
- Accent (Vibrant Cyan `oklch(0.75 0.15 220)`): Deep text (`oklch(0.08 0.01 240)`) - Ratio 14.2:1 ✓

## Font Selection

Typography should communicate precision and professionalism while remaining highly readable for data-dense interfaces.

- **Primary Typeface**: Inter - Clean, technical, excellent at small sizes for data tables and forms
- **Display Typeface**: Space Grotesk - Geometric and distinctive for headings and section titles
- **Monospace**: JetBrains Mono - For VINs, IDs, and code-like data

**Typographic Hierarchy**:
- `H1 (Page Title)`: Space Grotesk Bold / 32px / -0.02em tracking
- `H2 (Section Header)`: Space Grotesk SemiBold / 24px / -0.01em tracking
- `H3 (Card Title)`: Inter SemiBold / 18px / normal tracking
- `Body (Default)`: Inter Regular / 14px / 1.5 line height
- `Caption (Muted Text)`: Inter Regular / 12px / 1.4 line height / reduced opacity
- `Monospace (Data)`: JetBrains Mono Regular / 13px / 1.3 line height

## Animations

Animations should feel precise and mechanical, like a luxury vehicle's UI. Every motion serves a functional purpose - orienting users, providing feedback, or establishing spatial relationships.

- **Page Transitions**: 300ms ease-in-out with subtle fade
- **Card Reveals**: Stagger animation for dashboard cards (50ms offset)
- **Approval Actions**: Subtle pulse on pending approval badges
- **Command Palette**: Smooth slide-down with backdrop blur
- **Data Updates**: Brief highlight flash (400ms) on changed values
- **Micro-interactions**: 150ms button press, 200ms hover state transitions

## Component Selection

**Components**:
- **Sidebar**: Shadcn Sidebar with collapsible groups, role-filtered navigation items
- **Cards**: Shadcn Card for dashboard metrics, record previews, and data containers
- **Tables**: Shadcn Table with sortable columns, row selection, and inline actions
- **Forms**: Shadcn Form with react-hook-form integration for record CRUD
- **Dialogs**: Shadcn Dialog for modal interactions (approvals, confirmations)
- **Command Palette**: Shadcn Command for global search and quick actions
- **Notifications**: Sonner toasts for ephemeral feedback; Sheet for notification center
- **Dropdown Menus**: Shadcn DropdownMenu for contextual actions and role switching
- **Status Indicators**: Custom StatusPill component for deal stages, lead statuses
- **Badges**: Shadcn Badge for counts, priority levels, and entity types

**Customizations**:
- **EntityBadge**: Custom component showing entity type icon + label (household, lead, deal)
- **SectionHeader**: Custom component with title, description, and optional action button
- **EmptyState**: Custom component with icon, message, and call-to-action for empty data states
- **ApprovalQueue**: Custom component showing pending approvals with quick approve/deny actions

**States**:
- **Buttons**: Default (muted border) → Hover (primary glow) → Active (slight scale) → Disabled (reduced opacity)
- **Inputs**: Unfocused (border) → Focused (ring + border color shift) → Error (destructive border + message)
- **Cards**: Rest (border) → Hover (border + shadow) → Active (pressed state for clickable cards)
- **Status Pills**: Color-coded by state (neutral/info/warning/danger/success)

**Icon Selection**:
- **Navigation**: Phosphor icons with regular weight for consistency
- **Actions**: Plus, Trash, Pencil, Check, X for CRUD operations
- **Status**: CheckCircle, Clock, Warning, TrendUp for state indicators
- **Entities**: UsersThree (households), ClipboardText (leads), CurrencyDollar (deals), Gauge (inventory)

**Spacing**:
- **Page Padding**: 32px (8 Tailwind units)
- **Section Gaps**: 24px (6 Tailwind units)
- **Card Padding**: 20px (5 Tailwind units)
- **Form Field Gaps**: 16px (4 Tailwind units)
- **Button Padding**: 12px horizontal, 8px vertical for default size

**Mobile**:
- **Sidebar**: Collapses to drawer on mobile (<768px)
- **Dashboard Cards**: Stack vertically on mobile, 2-column grid on tablet, 4-column on desktop
- **Tables**: Horizontal scroll on mobile with sticky first column
- **Command Palette**: Full-screen on mobile
- **Forms**: Single-column layout on mobile, adaptive multi-column on desktop
