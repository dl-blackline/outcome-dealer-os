# Prompt 63 — Customer Chat Monitor and Response Agent

Design and begin the customer-facing chat monitoring and response agent.

## Goals
- monitor buyer-hub or customer-facing chat channels
- classify visitor intent and urgency
- respond safely, capture leads, and escalate into the internal OS

## Tasks
1. Create or update:
   - `/docs/architecture/customer_chat_agent_flow.md`
   - `/docs/architecture/chat_intent_and_escalation_model.md`
   - `/docs/ux/chat_agent_review_and_handoff.md`
2. Define chat agent behaviors for:
   - greet and qualify visitors
   - answer common inventory/finance/process questions
   - detect high-intent shoppers
   - create or update lead/inquiry records
   - create workstation follow-up cards where appropriate
   - escalate to human staff when confidence or policy requires it
3. Define allowed chat response modes:
   - suggest only
   - draft/assist
   - autonomous response within narrow rules
4. Define how customer-chat transcripts, actions, and handoffs map into events, audit, and records.

## Rules
- do not let the chat agent fabricate vehicle, pricing, or finance claims
- preserve canonical record linkage and auditability
- keep customer-facing language premium, clear, and trust-building

## Deliverable
- customer chat agent flow docs
- intent/escalation model
- internal linkage plan for chat monitoring and response
