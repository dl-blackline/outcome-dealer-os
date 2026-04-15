# Prompt 64 — Prospecting and Reactivation Agent

Design and begin the prospecting/reactivation AI agent for Outcome Dealer OS.

## Goals
- support proactive outreach to stale leads, unsold opportunities, and prospecting lists
- generate targeted follow-up plans, drafts, and sequencing
- create governed outbound work instead of uncontrolled automation

## Tasks
1. Create or update:
   - `/docs/architecture/prospecting_agent_flow.md`
   - `/docs/architecture/reactivation_and_followup_policy.md`
   - `/docs/ux/agent_outbound_review_surface.md`
2. Define prospecting/reactivation agent behaviors for:
   - identifying stale leads and no-response opportunities
   - proposing message/call/email sequences
   - drafting outreach copy
   - recommending next-best actions
   - creating workstation cards/tasks for reps or managers
3. Define what outreach can be:
   - suggested only
   - drafted only
   - approved batch sends later under policy
4. Define how prospecting results map into leads, households, events, tasks, and workstation.

## Rules
- do not allow unrestricted autonomous outbound prospecting by default
- preserve auditability and approval flows
- optimize for relevance, professionalism, and conversion

## Deliverable
- prospecting/reactivation agent docs
- outbound policy model
- internal OS linkage for AI-driven follow-up
