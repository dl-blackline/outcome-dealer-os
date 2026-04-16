import type { AssistantAction } from './assistant.types'

export const ASSISTANT_ACTIONS: AssistantAction[] = [
  { id: 'debug-issue', label: 'Debug this issue', description: 'Investigate a bug from plain-English symptoms.', mode: 'debug_problem' },
  { id: 'trace-workflow', label: 'Trace this workflow', description: 'Trace UI → services → data path for a workflow.', mode: 'trace_workflow' },
  { id: 'review-page', label: 'Review this page', description: 'Review a surface for UX friction and clarity.', mode: 'review_code' },
  { id: 'improve-ui', label: 'Improve this UI', description: 'Generate a safe, high-impact UI improvement path.', mode: 'improve_ui' },
  { id: 'find-root-cause', label: 'Find root cause', description: 'Prioritize probable root causes with confidence.', mode: 'find_root_cause' },
  { id: 'explain-feature', label: 'Explain this feature', description: 'Explain behavior and architecture of a feature.', mode: 'explain_feature' },
  { id: 'diagnose-missing-activity', label: 'Diagnose why this activity is missing', description: 'Check event, task, and persistence surfaces.', mode: 'diagnose_data_flow' },
  { id: 'fix-save-update', label: 'Fix this action/save/update', description: 'Identify broken save paths and safest fix sequence.', mode: 'apply_safe_fix' },
  { id: 'diagnose-reminder-task-appointment', label: 'Diagnose reminder/task/appointment issue', description: 'Investigate task and scheduling logic mismatch.', mode: 'diagnose_data_flow' },
  { id: 'diagnose-lead-status', label: 'Diagnose lead status issue', description: 'Trace lead transitions and status propagation.', mode: 'trace_workflow' },
  { id: 'diagnose-deploy-config', label: 'Diagnose deploy/config issue', description: 'Inspect build, env, and integration dependencies.', mode: 'diagnose_deploy' },
  { id: 'apply-safe-fix', label: 'Apply safe fix path', description: 'Plan the smallest effective, regression-aware fix.', mode: 'apply_safe_fix' },
  { id: 'summarize-changes', label: 'Summarize changes', description: 'Produce a concise worklog-style implementation summary.', mode: 'review_code' },
  { id: 'create-implementation-plan', label: 'Create implementation plan', description: 'Generate a structured implementation plan.', mode: 'implementation_plan' },
  { id: 'trace-lead-follow-up-chain', label: 'Trace lead follow-up chain', description: 'Map lead journey, events, and follow-up continuity.', mode: 'trace_workflow' },
  { id: 'review-salesperson-workflow', label: 'Review salesperson workflow', description: 'Evaluate speed, clarity, and follow-up execution.', mode: 'improve_ui' },
  { id: 'review-manager-visibility', label: 'Review manager visibility', description: 'Evaluate oversight, accountability, and signal quality.', mode: 'improve_ui' },
]

export function findAssistantAction(actionId: AssistantAction['id']): AssistantAction {
  return ASSISTANT_ACTIONS.find(action => action.id === actionId) ?? ASSISTANT_ACTIONS[0]
}
