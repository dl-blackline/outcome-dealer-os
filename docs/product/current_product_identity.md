# Current Product Identity

## Product Name

**Outcome Dealer OS**

## Product Type

AI-native dealership operating system — a unified command layer for the entire dealership value chain.

## Design Language

- **Premium, dark-first, enterprise-grade** visual system
- Space Grotesk for headings, Inter for body, JetBrains Mono for data
- Zinc-based neutral palette with blue accent for primary actions
- Information density balanced with clear hierarchy
- Every surface designed to feel like a command center for high-stakes decisions

## Scaffold Heritage

The project was initialized from the **Spark template** — a minimal React + TypeScript + Vite scaffold. The product identity is fully **Outcome Dealer OS**:

- All UI chrome (sidebar, topbar, branding) references Outcome Dealer OS
- All domain modeling, types, events, and roles are dealership-specific
- Architecture documentation describes the Outcome Dealer OS system
- The Spark template provided build tooling and initial file structure only

## Core Pillars

### 1. Role-Based Access Control
13 dealership roles (Owner, General Manager, Sales Manager, F&I Manager, Sales Rep, BDC Agent, Service Advisor, Service Technician, Parts Manager, Accounting Clerk, Compliance Officer, Receptionist, IT Admin) with 28 granular permissions enforced at the route and component level.

### 2. Event-Driven Architecture
Every meaningful state change produces an immutable event with structured payload. 49 event types across all domains create complete audit trails and enable AI training, analytics, and state reconstruction.

### 3. Approval Workflows
Sensitive actions (trade value changes, financial outputs, AI decisions) route through manager approval queues with clear audit trails and separation of duties.

### 4. Canonical Objects
Single source of truth for all entities — households, leads, deals, vehicles, appointments, and more. 30+ business objects defined with full TypeScript typing to eliminate duplicate records and data inconsistency.

### 5. Workstation Execution
Role-specific workstation views that surface contextual tools, tasks, and data for each job function. Sales reps see their pipeline; service advisors see their appointments; executives see analytics.
