# Playbook & Execution Center

## Overview

The **Playbook & Execution Center** is a dealership-wide internal strategy, planning, and execution workspace built into Outcome Dealer OS. It gives leadership and management a structured place to:

- Capture notes, ideas, issues, and meeting recaps instantly
- Organize work into playbooks and projects
- Record decisions with rationale
- Track action items through completion
- Review full activity history on a timeline
- Store and reference attached files

---

## Navigation

Access the Playbook module from the main sidebar under **Playbook**. The module includes these sub-sections:

| Section | Purpose |
|---|---|
| Dashboard | Overview — stats, recent entries, open action items, quick navigation |
| Playbooks | Create and manage strategy/operational playbooks |
| Projects | Track active initiatives with owners, deadlines, and milestones |
| Notes | Capture raw notes, ideas, issues, observations |
| Meetings | Log meeting recaps with attendees and next steps |
| Decisions | Record decisions with rationale and impacts |
| Action Items | Track all open tasks with owners and due dates |
| Timeline | Full activity history across playbooks and projects |
| Files & Library | View all file attachments across the module |

---

## Quick Capture (Recommended Workflow)

1. Click **"+ New Entry"** from the dashboard or go to **Notes**
2. Select the **Playbook** to file it under (create one first if needed)
3. Pick the **Entry Type** (idea, issue, meeting note, blocker, etc.)
4. Fill in title, summary, and any notes
5. Add who was discussed with, next step, and due date if applicable
6. Save — the entry is immediately available across all views

**To convert an entry to an Action Item or Decision:**
- Open any entry in Notes
- Click "→ Action Item" or "→ Decision" — it will be created automatically

---

## Data Model

### Playbooks
The top-level organizational container. Think of a playbook as a strategic area or operational domain (e.g., "2025 Sales Growth Plan", "Service Department SOPs").

| Field | Description |
|---|---|
| Title | Name of the playbook |
| Description | What this playbook covers |
| Category | sales, finance, service, marketing, operations, hr, strategy, compliance, other |
| Owner | Person or role responsible |
| Visibility | public, private, or restricted |
| Status | active, draft, paused, archived |
| Priority | low, medium, high, critical |

### Projects
Specific initiatives or campaigns within a playbook.

| Field | Description |
|---|---|
| Playbook | Parent playbook |
| Title | Project name |
| Objective | What we're trying to achieve |
| Owner | Responsible person |
| Status | planning, active, on_hold, completed, cancelled |
| Start / Target Date | Timeline |
| Next Milestone | What's coming up |
| Blockers | Current obstacles |

### Entries / Notes
The core capture unit. Flexible and fast.

| Field | Description |
|---|---|
| Playbook | Required — which playbook this belongs to |
| Project | Optional — associate with a specific project |
| Type | idea, issue, meeting_note, strategy_note, decision, follow_up, update, blocker, observation |
| Title | What it's about |
| Summary | One-liner |
| Body | Full notes / context |
| Discussed With | Who was involved |
| Next Step | What happens next |
| Due Date | When it needs to happen |
| Status | open, in_progress, resolved, archived, converted |

### Decisions
Formal records of decisions made.

| Field | Description |
|---|---|
| Title | The decision |
| Summary | Clear description of what was decided |
| Rationale | Why it was decided |
| Decided By | Who made the decision |
| Date Decided | When |
| Status | proposed, decided, implemented, reversed |
| Impacts | Affected areas (comma separated) |

### Action Items
Trackable tasks with owners and deadlines.

| Field | Description |
|---|---|
| Title | What needs to be done |
| Owner | Who's responsible |
| Due Date | When it's due |
| Priority | low, medium, high, urgent |
| Status | open, in_progress, completed, cancelled, blocked |

---

## Role Access

The Playbook module is available to the following roles:

| Role | Access |
|---|---|
| Owner | ✅ Full access |
| General Manager | ✅ Full access |
| GSM | ✅ Full access |
| Used Car Manager | ✅ Full access |
| BDC Manager | ✅ Full access |
| Sales Manager | ✅ Full access |
| F&I Manager | ✅ Full access |
| Service Director | ✅ Full access |
| Marketing Manager | ✅ Full access |
| Admin | ✅ Full access |
| Sales Rep | ❌ Not available |
| Service Advisor | ❌ Not available |
| Recon Manager | ❌ Not available |

---

## Data Persistence

The module uses a **dual persistence strategy**:

1. **localStorage** (default) — works immediately with no configuration. Data is stored in the browser.
2. **Supabase** — when the database is configured, data is stored in the cloud and shared across all users.

To activate Supabase persistence, run the migration file `migrations/0023_create_playbook_execution_center.sql` against your Supabase project. The module will automatically detect and use the database connection.

---

## Entry Types Reference

| Type | When to Use |
|---|---|
| `idea` | New idea worth capturing |
| `issue` | A problem or concern identified |
| `meeting_note` | Recap of a meeting |
| `strategy_note` | Strategic thinking or direction |
| `decision` | A decision was reached |
| `follow_up` | Something that needs follow-through |
| `update` | Status update on an ongoing situation |
| `blocker` | Something blocking progress |
| `observation` | An operational or behavioral observation |

---

## Tips

- **Create your playbooks first** before adding projects or entries — every entry must be attached to a playbook
- Use the **Meetings** section for quick meeting recaps — it's a filtered view of all `meeting_note` entries
- **Action Items** from the dashboard show all open/in-progress items across every playbook — use it as your daily task review
- Use **"→ Action Item"** on any entry to instantly create a trackable task from a note
- The **Timeline** is append-only and gives you a full history of all activity
- **Files & Library** aggregates all attachments — use it to find files without remembering which entry they were on
