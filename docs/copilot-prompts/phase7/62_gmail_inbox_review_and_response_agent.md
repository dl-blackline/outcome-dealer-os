# Prompt 62 — Gmail Inbox Review and Response Agent

Design and begin the Gmail-connected inbox review/response agent.

## Goals
- let the system review inbound customer emails
- classify, prioritize, and draft responses
- eventually support supervised or rules-based sending

## Tasks
1. Create or update:
   - `/docs/architecture/gmail_agent_runtime_flow.md`
   - `/docs/architecture/email_classification_and_reply_policy.md`
2. Define inbox agent behaviors for:
   - classify email type and urgency
   - link email to lead/customer/deal where possible
   - create/update workstation cards
   - draft replies
   - route to human review when needed
3. Define what kinds of emails may be:
   - auto-categorized only
   - auto-drafted only
   - auto-sent only under narrow rules
4. Design mailbox threading, CRM linkage, and audit behavior.

## Rules
- do not assume unrestricted autonomous email sending
- preserve thread context and canonical record linkage
- every send/draft must be attributable and auditable

## Deliverable
- Gmail agent flow docs
- email classification/reply policy
- CRM/workstation linkage model for email operations
