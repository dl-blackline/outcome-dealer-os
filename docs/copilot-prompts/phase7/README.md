# Outcome Dealer OS Copilot Prompt Pack — Phase 7

This folder contains the **Phase 7** prompt pack for Outcome Dealer OS.

Phase 7 is about wiring the platform for **AI success** across customer follow-up, inbox handling, chat monitoring, prospecting, and future outbound communication infrastructure.

This phase does **not** assume fully autonomous unsupervised selling on day one. It should create the architecture, controls, prompts, runtime flows, and channel bridges needed so AI agents can operate safely and effectively.

## Run order

1. `61_ai_agent_architecture_and_governance.md`
2. `62_gmail_inbox_review_and_response_agent.md`
3. `63_customer_chat_monitor_and_response_agent.md`
4. `64_prospecting_and_reactivation_agent.md`
5. `65_twilio_outbound_messaging_and_calling_readiness.md`
6. `66_agent_task_workstation_and_followup_orchestration.md`
7. `67_prompt_memory_context_and_conversation_store.md`
8. `68_agent_approvals_human_in_loop_and_compliance.md`
9. `69_agent_telemetry_quality_control_and_replay.md`
10. `70_phase7_hardening_and_ai_readiness_review.md`
11. `99_master_run_order_prompt_phase7.md`

## Phase 7 outcomes

By the end of this sequence, Outcome Dealer OS should have:

- a clear AI agent architecture and governance model
- inbox review/response agent planning and surfaces for Gmail integration
- customer-facing chat monitoring and response planning
- prospecting/reactivation agent workflows
- Twilio readiness for future outbound messaging/calling
- agent-generated work flowing into workstation/tasks
- a prompt/context/memory strategy
- human-in-the-loop controls for approvals and sensitive actions
- telemetry, QA, and replay infrastructure for agent actions
- a clean readiness review for moving from AI-assisted to increasingly autonomous workflows

## Notes

- Keep Outcome Dealer OS as one unified platform.
- Do not build uncontrolled autonomous agents that can freely send messages without governance.
- Preserve canonical object continuity between communications, leads, deals, workstation, events, and approvals.
- Treat Gmail, customer chat, and future Twilio channels as first-class operating channels tied into the internal OS.
