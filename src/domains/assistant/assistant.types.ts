export type AssistantMode =
  | 'debug_problem'
  | 'trace_workflow'
  | 'review_code'
  | 'implement_change'
  | 'improve_ui'
  | 'diagnose_deploy'
  | 'diagnose_data_flow'
  | 'explain_feature'
  | 'find_root_cause'
  | 'apply_safe_fix'
  | 'implementation_plan'

export type AssistantLayer =
  | 'ui'
  | 'state_data_flow'
  | 'form_action_logic'
  | 'lead_workflow_logic'
  | 'task_appointment_logic'
  | 'crm_status_logic'
  | 'api_service_layer'
  | 'auth_session'
  | 'db_schema_query'
  | 'deployment_build'
  | 'env_config'
  | 'integration'

export type AssistantActionId =
  | 'debug-issue'
  | 'trace-workflow'
  | 'review-page'
  | 'improve-ui'
  | 'find-root-cause'
  | 'explain-feature'
  | 'diagnose-missing-activity'
  | 'fix-save-update'
  | 'diagnose-reminder-task-appointment'
  | 'diagnose-lead-status'
  | 'diagnose-deploy-config'
  | 'apply-safe-fix'
  | 'summarize-changes'
  | 'create-implementation-plan'
  | 'trace-lead-follow-up-chain'
  | 'review-salesperson-workflow'
  | 'review-manager-visibility'

export interface AssistantAction {
  id: AssistantActionId
  label: string
  description: string
  mode: AssistantMode
}

export interface AssistantInputContext {
  leadCount: number
  eventCount: number
  taskCount: number
  pendingApprovalCount: number
  unhealthyIntegrationCount: number
  leadHint?: string
  relatedEventNames?: string[]
  relatedTaskTitles?: string[]
}

export interface AssistantReport {
  objective: string
  diagnosis: string
  rootCause: string
  confidence: number
  impactedLayers: AssistantLayer[]
  impactedFiles: string[]
  fixOrImprovementPath: string[]
  changesMade: string[]
  validationSteps: string[]
  risksAndFollowUps: string[]
  selfReviewChecklist: string[]
  worklogSummary: string
}

export interface AssistantWorklogEntry {
  id: string
  timestamp: string
  actionId: AssistantActionId
  issueSummary: string
  symptoms: string
  likelyCause: string
  filesInspected: string[]
  changesProposed: string[]
  validationSteps: string[]
  openQuestions: string[]
}
