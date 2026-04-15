import { findAssistantAction } from './assistant.actions'
import { ASSISTANT_REPO_SURFACES } from './assistant.repoMap'
import type {
  AssistantActionId,
  AssistantInputContext,
  AssistantLayer,
  AssistantMode,
  AssistantReport,
} from './assistant.types'

function roundConfidence(value: number): number {
  return Math.max(0.3, Math.min(0.95, Math.round(value * 100) / 100))
}

function inferLayers(input: string): AssistantLayer[] {
  const text = input.toLowerCase()
  const layers = new Set<AssistantLayer>()
  if (text.includes('click') || text.includes('page') || text.includes('ui')) layers.add('ui')
  if (text.includes('stale') || text.includes('sync') || text.includes('state')) layers.add('state_data_flow')
  if (text.includes('save') || text.includes('submit') || text.includes('update')) layers.add('form_action_logic')
  if (text.includes('lead') || text.includes('customer')) layers.add('lead_workflow_logic')
  if (text.includes('task') || text.includes('appointment') || text.includes('reminder')) layers.add('task_appointment_logic')
  if (text.includes('status') || text.includes('transition') || text.includes('stage')) layers.add('crm_status_logic')
  if (text.includes('service') || text.includes('api')) layers.add('api_service_layer')
  if (text.includes('auth') || text.includes('permission') || text.includes('session')) layers.add('auth_session')
  if (text.includes('db') || text.includes('schema') || text.includes('query')) layers.add('db_schema_query')
  if (text.includes('build') || text.includes('deploy')) layers.add('deployment_build')
  if (text.includes('env') || text.includes('config')) layers.add('env_config')
  if (text.includes('integration') || text.includes('webhook') || text.includes('crm')) layers.add('integration')
  return layers.size ? [...layers] : ['ui', 'state_data_flow']
}

function deriveRootCause(input: string, layers: AssistantLayer[], mode: AssistantMode): string {
  const text = input.toLowerCase()
  if (text.includes('not showing') || text.includes('missing')) {
    return 'Most likely a data propagation gap: event/task/state is created or updated in one layer but not surfaced in the consuming view or filtered out.'
  }
  if (text.includes('didn') && (text.includes('save') || text.includes('update'))) {
    return 'Most likely a broken save/update path caused by action validation, incomplete payload mapping, or missing persistence/update handling.'
  }
  if (layers.includes('crm_status_logic')) {
    return 'Most likely status transition rules are inconsistent across lead/deal/workstation state and event signals.'
  }
  if (mode === 'diagnose_deploy') {
    return 'Most likely environment/runtime mismatch between expected config usage and actual deployment context values.'
  }
  return 'Likely a cross-layer contract drift between UI intent, service mapping, and runtime data visibility.'
}

function deriveFixPath(mode: AssistantMode): string[] {
  const common = [
    'Confirm expected workflow outcome and exact failing symptom.',
    'Inspect impacted files and trace the execution path end-to-end.',
    'Apply the smallest effective change at the true failure point.',
    'Re-verify impacted workflow and adjacent operator paths.',
  ]
  if (mode === 'improve_ui') {
    return [
      'Identify highest-friction operator steps and ambiguous states.',
      'Simplify action hierarchy and status clarity with minimal UI change.',
      'Preserve existing workflow behavior while improving readability and speed.',
      'Validate the revised flow with salesperson and manager perspectives.',
    ]
  }
  if (mode === 'diagnose_deploy') {
    return [
      'Map functionality to its environment/config dependencies.',
      'Verify build/runtime config references and fallback behavior.',
      'Patch missing or unsafe config assumptions without broad rewrites.',
      'Validate preview and production parity for the affected flow.',
    ]
  }
  if (mode === 'implementation_plan') {
    return [
      'Define objective, scope, and affected workflow boundaries.',
      'List concrete file touch points and acceptance conditions.',
      'Sequence work into safe, incremental implementation slices.',
      'Define verification and rollback criteria for each slice.',
    ]
  }
  return common
}

function deriveValidation(mode: AssistantMode): string[] {
  if (mode === 'diagnose_deploy') {
    return [
      'Run `npm run build` and verify no new build/runtime errors.',
      'Validate the affected flow in preview-like environment with required config.',
      'Confirm behavior parity against intended production behavior.',
    ]
  }
  return [
    'Reproduce the original issue path and confirm expected outcome.',
    'Verify nearby workflows (lead status, activity, tasks, appointments) still behave correctly.',
    'Run `npm run build` and confirm no type/build regressions.',
  ]
}

export function buildAssistantReport(
  actionId: AssistantActionId,
  issue: string,
  context: AssistantInputContext
): AssistantReport {
  const action = findAssistantAction(actionId)
  const normalized = issue.trim() || action.description
  const detectedLayers = inferLayers(normalized)
  const surfaceMatches = ASSISTANT_REPO_SURFACES.filter(surface =>
    surface.keywords.some(keyword => normalized.toLowerCase().includes(keyword))
  )
  const matchedFiles = surfaceMatches.flatMap(surface => surface.files)
  const impactedFiles = [...new Set(matchedFiles)].slice(0, 10)
  const confidence = roundConfidence(
    0.45 +
      Math.min(surfaceMatches.length * 0.07, 0.28) +
      Math.min(detectedLayers.length * 0.03, 0.15) +
      (context.relatedEventNames?.length ? 0.05 : 0)
  )
  const rootCause = deriveRootCause(normalized, detectedLayers, action.mode)
  const contextLine = `Runtime context: ${context.leadCount} leads, ${context.eventCount} events, ${context.taskCount} tasks, ${context.pendingApprovalCount} pending approvals, ${context.unhealthyIntegrationCount} unhealthy integrations.`
  const relatedEvents = context.relatedEventNames?.length
    ? `Related events: ${context.relatedEventNames.join(', ')}.`
    : 'No direct related events detected from current hint.'
  const relatedTasks = context.relatedTaskTitles?.length
    ? `Related tasks: ${context.relatedTaskTitles.join(' | ')}.`
    : 'No directly related task titles matched from current hint.'

  return {
    objective: `${action.label}: ${normalized}`,
    diagnosis: `${contextLine} ${relatedEvents} ${relatedTasks}`,
    rootCause,
    confidence,
    impactedLayers: detectedLayers,
    impactedFiles: impactedFiles.length ? impactedFiles : ['src/app/AppShell.tsx', 'src/domains/events/event.hooks.ts', 'src/domains/leads/lead.service.ts'],
    fixOrImprovementPath: deriveFixPath(action.mode),
    changesMade: ['No code changes executed from this panel yet; this output is the recommended internal fix path and file targeting map.'],
    validationSteps: deriveValidation(action.mode),
    risksAndFollowUps: [
      'Shared workflow logic may affect multiple pages and role views.',
      'Mock/runtime parity gaps can hide persistence defects until integrated environments.',
      'Status and event naming drift can create silent reporting inconsistencies.',
    ],
    selfReviewChecklist: [
      'Confirm file-level change scope is minimal and targeted.',
      'Confirm no missing imports/types and no broken references.',
      'Confirm lead/task/activity visibility still aligns with manager and operator expectations.',
      'Confirm deployment/runtime assumptions remain explicit and safe.',
    ],
    worklogSummary: `${action.label} completed with ${Math.round(confidence * 100)}% confidence across ${detectedLayers.length} impacted layer(s).`,
  }
}

export function getAssistantArchitectureSummary(): string[] {
  return [
    'UI shell uses AppShell route resolution with role-aware sidebar and command palette entry points.',
    'Domain logic is organized under src/domains/* with hook/service/type separation.',
    'Runtime data currently relies on in-memory/mock-backed hooks plus DB helper abstractions.',
    'Event, audit, approvals, integrations, and workstation layers provide cross-workflow operational visibility.',
    'Assistant layer now adds a modular action registry, repo surface map, diagnostics engine, and worklog persistence.',
  ]
}
