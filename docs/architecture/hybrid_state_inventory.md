# Hybrid State Inventory — Phase 3 Audit

> Last updated: Phase 3, Prompt 20

## Classification Key

| Category | Meaning |
|---|---|
| **Runtime-backed** | Uses KV-backed db layer (`lib/db/supabase.ts`) with real CRUD |
| **Runtime-seeded** | Runtime-backed but initialized from mock/demo seed data |
| **UI-only / local-only** | State lives only in React component state; no persistence |
| **Planned only** | UI placeholder with no backing logic |

## System Inventory

### Workstation
| Surface | Classification | Notes |
|---|---|---|
| Card list/board | **Runtime-seeded** | `workstation.service.ts` uses KV via `db`; seeds from `workstation.mock.ts` if empty |
| Card create | **Runtime-seeded** | Creates via `db.insert`; persists to KV |
| Card move (column) | **Runtime-seeded** | Updates via `db.update`; persists to KV |
| Drag-and-drop | **UI-only** | HTML5 drag works but state update is local `useState` in WorkstationPage |
| Card edit/update | **Runtime-seeded** | `updateWorkstationCard` exists in service but UI does not expose full editing |
| Auto-card from event | **Runtime-seeded** | `event.bus.ts` → `generateCardFromEvent` → `createWorkstationCard` |

### Approvals
| Surface | Classification | Notes |
|---|---|---|
| Approval list (page) | **UI-only** | `ApprovalQueuePage` reads `MOCK_APPROVALS` directly, resolves via local `useState` |
| Approval service (domain) | **Runtime-backed** | `approval.service.ts` uses KV for full CRUD, emits events, writes audit |
| Approve/Deny actions | **UI-only** | Page uses `setApprovals` local state, does NOT call approval service |

### Notifications
| Surface | Classification | Notes |
|---|---|---|
| Notification center | **UI-only** | `NotificationCenter.tsx` transforms `MOCK_EVENTS` into notifications at mount; mark-read is local state |
| Notification derivation | **UI-only** | No connection to event bus or runtime event stream |

### Command Palette
| Surface | Classification | Notes |
|---|---|---|
| Navigation commands | **Working** | Navigates via router correctly |
| Record search | **UI-only** | Searches `MOCK_LEADS`, `MOCK_DEALS`, `MOCK_INVENTORY` directly |
| Context actions | **Planned only** | No context-aware actions exist yet |

### Record Pages
| Surface | Classification | Notes |
|---|---|---|
| Lead list | **UI-only** | Reads `MOCK_LEADS` directly |
| Lead detail | **UI-only** | Reads `MOCK_LEADS` and `MOCK_EVENTS` directly |
| Deal list | **UI-only** | Reads `MOCK_DEALS` directly |
| Deal detail | **UI-only** | Reads `MOCK_DEALS`, `MOCK_APPROVALS`, `MOCK_EVENTS` directly |
| Household list | **UI-only** | Has inline `MOCK_HOUSEHOLDS` array (duplicated from useDomainQueries) |
| Household detail | **UI-only** | Has its own inline `MOCK_HOUSEHOLDS` (different shape from list page) |
| Inventory list | **UI-only** | Reads `MOCK_INVENTORY` directly |
| Inventory detail | **UI-only** | Reads `MOCK_INVENTORY` directly |

### Dashboard
| Surface | Classification | Notes |
|---|---|---|
| DashboardPage | **UI-only** | Reads `MOCK_*` arrays directly; no role-specific behavior |
| Dashboard adapters | **UI-only** | `dashboard.adapters.ts` has role-aware `getDashboardSignals()` but page does not use it |

### Event Explorer
| Surface | Classification | Notes |
|---|---|---|
| Event list | **UI-only** | Reads `MOCK_EVENTS` directly; no connection to runtime event bus |
| Event service | **Runtime-backed** | `event.service.ts` queries KV-backed event_bus table |

### Audit Explorer
| Surface | Classification | Notes |
|---|---|---|
| Audit list | **UI-only** | Has inline `MOCK_AUDIT_LOGS` array; no connection to audit service |
| Audit service | **Runtime-backed** | `audit.service.ts` writes/reads KV-backed audit_logs table |

### Settings
| Surface | Classification | Notes |
|---|---|---|
| Roles page | **Working** | Reads from `roles.ts` and `permissions.ts` — these are code-defined, not mock |
| Integrations page | **UI-only** | Has inline `MOCK_INTEGRATIONS` array; does not use integration.service.ts |

### Domain Query Hooks
| Hook | Classification | Notes |
|---|---|---|
| `useDomainQueries.ts` | **UI-only** | All hooks return mock data with simulated 80ms loading delay; no connection to runtime services |

## Key Observations

1. **Dual data paths exist**: Runtime services (approval, event, audit, workstation) use KV-backed persistence, but UI pages bypass them entirely and read mock arrays directly.
2. **Household data is duplicated**: Three different household datasets exist (useDomainQueries, HouseholdListPage inline, HouseholdRecordPage inline).
3. **Dashboard ignores its own adapter**: `dashboard.adapters.ts` exists with role-aware metrics but `DashboardPage.tsx` doesn't use it.
4. **Approval resolution is deceptive**: The page shows approve/deny buttons that only update local state, giving the appearance of real resolution.
5. **Notifications are disconnected**: NotificationCenter reads static mock events at mount time; no runtime subscription.
