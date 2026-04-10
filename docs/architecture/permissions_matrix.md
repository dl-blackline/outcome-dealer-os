# Permissions Matrix

## Purpose

Outcome Dealer OS uses role-based access control with explicit permissions. This document defines the canonical permissions and their mapping to roles.

## Core Principles

1. **Least privilege** — users get only the permissions required for their job function
2. **Explicit grants** — no implicit permission inheritance; every grant is intentional
3. **Separation of duties** — edit power does not automatically grant approval power
4. **Financial sensitivity** — money-related actions require stronger permissions
5. **Audit everything** — permission checks are logged for compliance review

---

## Canonical Permissions

### Executive & Reporting
- `view_executive_dashboard` — Access to owner/GM-level metrics and analytics

### Lead & CRM
- `view_leads` — See lead records
- `edit_leads` — Modify lead data, log contact attempts
- `assign_leads` — Distribute leads to sales reps or BDC

### Trade & Appraisal
- `view_trades` — See trade-in appraisals
- `edit_trades` — Enter appraisal data
- `approve_trade_values` — Authorize trade allowances (manager level)

### Desking & Quoting
- `view_desk_scenarios` — See payment structures
- `edit_desk_scenarios` — Build and modify pencils
- `approve_financial_outputs` — Sign off on quote changes (manager level)

### Credit & Finance
- `view_credit_apps` — See credit applications
- `edit_credit_apps` — Submit and manage credit apps
- `view_lender_decisions` — See lender responses
- `manage_fi` — Present F&I menus, manage product selection

### Service Lane
- `view_service_events` — See service appointments and repair orders
- `edit_service_events` — Log service work, customer decisions

### Recon & Inventory
- `view_recon_jobs` — See reconditioning work orders
- `edit_recon_jobs` — Manage recon status, costs, timelines

### Marketing & Campaigns
- `view_campaigns` — See marketing efforts and attribution
- `edit_campaigns` — Create and manage campaigns

### Workflow
- `manage_tasks` — Assign and complete tasks

### AI & Automation
- `approve_ai_actions` — Review and authorize AI-generated outputs before execution

### System Control
- `view_audit_logs` — Access system audit trail
- `view_approvals` — See approval queue
- `resolve_approvals` — Approve or deny requests
- `manage_integrations` — Configure external system connections
- `admin_platform` — Full system administration

---

## Role-to-Permission Mapping

### owner
Full access to all permissions.

**Rationale**: Executive visibility and control over entire operation.

---

### gm (General Manager)
- `view_executive_dashboard`
- `view_leads`, `edit_leads`, `assign_leads`
- `view_trades`, `edit_trades`, `approve_trade_values`
- `view_desk_scenarios`, `edit_desk_scenarios`, `approve_financial_outputs`
- `view_credit_apps`, `edit_credit_apps`, `view_lender_decisions`, `manage_fi`
- `view_service_events`, `edit_service_events`
- `view_recon_jobs`, `edit_recon_jobs`
- `view_campaigns`, `edit_campaigns`
- `manage_tasks`
- `approve_ai_actions`
- `view_audit_logs`, `view_approvals`, `resolve_approvals`
- `manage_integrations`

**Rationale**: Operational control across all departments, approvals, and integrations.

---

### gsm (General Sales Manager)
- `view_executive_dashboard`
- `view_leads`, `edit_leads`, `assign_leads`
- `view_trades`, `edit_trades`, `approve_trade_values`
- `view_desk_scenarios`, `edit_desk_scenarios`, `approve_financial_outputs`
- `view_credit_apps`, `edit_credit_apps`, `view_lender_decisions`
- `manage_tasks`
- `approve_ai_actions`
- `view_approvals`, `resolve_approvals`

**Rationale**: Sales department leadership with approval authority for deals and financials.

---

### used_car_manager
- `view_leads`, `edit_leads`
- `view_trades`, `edit_trades`, `approve_trade_values`
- `view_desk_scenarios`, `edit_desk_scenarios`, `approve_financial_outputs`
- `view_recon_jobs`, `edit_recon_jobs`
- `manage_tasks`
- `view_approvals`, `resolve_approvals`

**Rationale**: Trade appraisals, recon oversight, and inventory decisions.

---

### bdc_manager
- `view_leads`, `edit_leads`, `assign_leads`
- `view_campaigns`, `edit_campaigns`
- `manage_tasks`

**Rationale**: Lead distribution, contact management, and campaign coordination.

---

### sales_manager
- `view_leads`, `edit_leads`, `assign_leads`
- `view_trades`, `edit_trades`
- `view_desk_scenarios`, `edit_desk_scenarios`, `approve_financial_outputs`
- `view_credit_apps`, `view_lender_decisions`
- `manage_tasks`
- `view_approvals`, `resolve_approvals`

**Rationale**: Floor management, deal structuring, and approval authority for sales.

---

### sales_rep
- `view_leads`, `edit_leads`
- `view_trades`, `edit_trades`
- `view_desk_scenarios`, `edit_desk_scenarios`
- `view_credit_apps`
- `manage_tasks`

**Rationale**: Customer interaction, deal initiation, but no approval authority.

---

### fi_manager
- `view_leads`
- `view_trades`
- `view_desk_scenarios`, `approve_financial_outputs`
- `view_credit_apps`, `edit_credit_apps`, `view_lender_decisions`, `manage_fi`
- `manage_tasks`
- `approve_ai_actions`
- `view_approvals`, `resolve_approvals`

**Rationale**: Finance structuring, lender management, F&I product sales, compliance approvals.

---

### service_director
- `view_service_events`, `edit_service_events`
- `view_recon_jobs`, `edit_recon_jobs`
- `manage_tasks`
- `view_approvals`, `resolve_approvals`

**Rationale**: Service lane oversight, recon coordination, and operational approvals.

---

### service_advisor
- `view_service_events`, `edit_service_events`
- `manage_tasks`

**Rationale**: Customer service interactions, work order management.

---

### recon_manager
- `view_recon_jobs`, `edit_recon_jobs`
- `manage_tasks`
- `view_approvals`, `resolve_approvals`

**Rationale**: Reconditioning workflow, cost approvals, frontline readiness.

---

### marketing_manager
- `view_leads`, `assign_leads`
- `view_campaigns`, `edit_campaigns`
- `manage_tasks`

**Rationale**: Campaign execution, lead nurturing, attribution analysis.

---

### admin
Full access to all permissions.

**Rationale**: Platform administration and emergency access.

---

## Permission Check Examples

### Viewing a lead record
```typescript
if (hasPermission(user, 'view_leads')) {
  // show lead
}
```

### Editing a trade appraisal value
```typescript
if (hasPermission(user, 'edit_trades')) {
  // allow edit
}
```

### Approving a trade value change
```typescript
if (hasPermission(user, 'approve_trade_values')) {
  // allow approval
} else {
  // create approval request
}
```

### Accessing executive dashboard
```typescript
if (hasPermission(user, 'view_executive_dashboard')) {
  // render owner/GM dashboard
} else {
  // render role-specific dashboard
}
```

---

## Approval Flow Permission Requirements

| Approval Type | Required Permission |
|--------------|---------------------|
| `trade_value_change` | `approve_trade_values` |
| `financial_output_change` | `approve_financial_outputs` |
| `ai_action_review` | `approve_ai_actions` |
| Generic fallback | `resolve_approvals` |

---

**Permissions are not suggestions. Enforce them at every boundary.**
