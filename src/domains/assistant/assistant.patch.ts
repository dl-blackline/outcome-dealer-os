import type { AssistantLayer, AssistantMode, CodePatchProposal } from './assistant.types'

interface PatchContext {
  impactedFiles: string[]
  layers: AssistantLayer[]
  mode: AssistantMode
  rootCause: string
}

/** Per-file recipes: surface-id → proposal factory */
const FILE_PATCH_RECIPES: Record<string, (ctx: PatchContext) => CodePatchProposal | null> = {
  'src/domains/leads/lead.service.ts': (ctx) => ({
    file: 'src/domains/leads/lead.service.ts',
    description: 'Harden lead status transition guard',
    rationale: 'Lead status changes should emit a matching event for every valid transition, not only for contacted/qualified.',
    changeType: 'fix',
    priority: ctx.layers.includes('crm_status_logic') ? 'high' : 'medium',
    pseudocodeSuggestion:
      'In updateLead(), after persisting the status update, publish a lead_status_changed event for ALL status transitions (not only contacted/qualified). ' +
      'Also validate that the requested status is a legal next state before persisting.',
    regressionRisk: 'medium',
  }),

  'src/domains/leads/lead.hooks.ts': (ctx) => ({
    file: 'src/domains/leads/lead.hooks.ts',
    description: 'Add reactive lead refresh after mutations',
    rationale: 'Hooks backed by simulated queries return stale snapshots after external mutations; a re-fetch signal is needed.',
    changeType: 'fix',
    priority: ctx.layers.includes('state_data_flow') ? 'high' : 'low',
    pseudocodeSuggestion:
      'Export a refreshLeads() function that re-queries the in-memory store and triggers a React state update. ' +
      'Call this after any lead create/update mutation to ensure consuming views reflect the latest data.',
    regressionRisk: 'low',
  }),

  'src/domains/tasks/task.hooks.ts': (ctx) => ({
    file: 'src/domains/tasks/task.hooks.ts',
    description: 'Wire task hooks to linked-entity IDs for per-lead task filtering',
    rationale: 'Tasks carry linkedEntityId on TaskRow but the public hook does not expose a per-lead filtered variant.',
    changeType: 'improvement',
    priority: ctx.layers.includes('task_appointment_logic') ? 'high' : 'medium',
    pseudocodeSuggestion:
      'Add useTasksForLead(leadId: string) that queries tasks where linked_entity_type === "lead" && linked_entity_id === leadId. ' +
      'This enables the timeline correlation and per-lead task visibility.',
    regressionRisk: 'low',
  }),

  'src/domains/events/event.hooks.ts': (ctx) => ({
    file: 'src/domains/events/event.hooks.ts',
    description: 'Expose useEntityAuditLogs for correlated timeline views',
    rationale: 'AuditLogRow records exist in the DB but no hook exposes them per entity, preventing timeline correlation.',
    changeType: 'improvement',
    priority: 'medium',
    pseudocodeSuggestion:
      'Add useEntityAuditLogs(entityType, entityId) that reads audit_logs from the in-memory store and returns them sorted by timestamp. ' +
      'This enables the assistant timeline and audit-backed investigation.',
    regressionRisk: 'low',
  }),

  'src/app/AppShell.tsx': (ctx) => ({
    file: 'src/app/AppShell.tsx',
    description: 'Prevent full page remount on role switch',
    rationale: ctx.mode === 'improve_ui'
      ? 'Changing the active role re-renders the entire shell, discarding in-flight UI state. Separate role state from page state.'
      : 'Role state should be lifted to a context provider to avoid full subtree re-renders.',
    changeType: 'refactor',
    priority: 'low',
    pseudocodeSuggestion:
      'Move currentRole into a RoleContext provider that wraps AppShell. ' +
      'Any component that only needs currentRole subscribes to context rather than causing AppShell to re-render.',
    regressionRisk: 'medium',
  }),

  'src/components/shell/CommandPalette.tsx': (_ctx) => ({
    file: 'src/components/shell/CommandPalette.tsx',
    description: 'Add assistant quick-actions as a dedicated command group',
    rationale: 'The command palette already shows navigation and record items; surfacing assistant actions here provides the fastest operator access.',
    changeType: 'improvement',
    priority: 'medium',
    pseudocodeSuggestion:
      'Add a fourth category "assistant" to CommandPalette. ' +
      'Populate it from ASSISTANT_ACTIONS mapped to route actions (/app/ops/assistant?action=<id>). ' +
      'This makes every assistant action reachable via ⌘K.',
    regressionRisk: 'low',
  }),

  'src/hooks/useQueryResult.ts': (_ctx) => ({
    file: 'src/hooks/useQueryResult.ts',
    description: 'Add a mutation-safe refresh signal to useSimulatedQuery',
    rationale: 'useSimulatedQuery currently has no external invalidation mechanism, causing stale reads after mutations.',
    changeType: 'fix',
    priority: 'medium',
    pseudocodeSuggestion:
      'Add an optional refreshKey parameter to useSimulatedQuery. ' +
      'When refreshKey changes, the query re-runs and state updates. ' +
      'Mutation hooks increment a counter and pass it as refreshKey.',
    regressionRisk: 'medium',
  }),

  'src/lib/db/helpers.ts': (_ctx) => ({
    file: 'src/lib/db/helpers.ts',
    description: 'Add upsert helper for idempotent seed operations',
    rationale: 'Current seed logic does an existence check then a bulk insert; a proper upsert avoids race conditions and duplicate seeding.',
    changeType: 'improvement',
    priority: 'low',
    pseudocodeSuggestion:
      'Add upsert<T>(table, id, row) that calls update if the row exists, otherwise calls insert. ' +
      'Seed functions can then be safely re-run without the exists-or-skip pattern.',
    regressionRisk: 'low',
  }),

  'src/domains/integrations/integration.hooks.ts': (_ctx) => ({
    file: 'src/domains/integrations/integration.hooks.ts',
    description: 'Expose last-error message and retry count in integration status',
    rationale: 'Integration hooks only expose status and errorCount; the raw error message is needed for deploy diagnostics and ops visibility.',
    changeType: 'improvement',
    priority: 'medium',
    pseudocodeSuggestion:
      'Extend IntegrationStatus to include lastError?: string and retryBackoffSeconds: number. ' +
      'Populate these from IntegrationSyncStateRow.last_error_message and retry_backoff_seconds.',
    regressionRisk: 'low',
  }),

  'vite.config.ts': (_ctx) => ({
    file: 'vite.config.ts',
    description: 'Add explicit path alias type reference to tsconfig',
    rationale: 'The @/ alias is declared in vite.config.ts but tsconfig.paths is not kept in sync, which can silently break type resolution in strict mode.',
    changeType: 'config',
    priority: 'low',
    pseudocodeSuggestion:
      'Add "paths": { "@/*": ["./src/*"] } to compilerOptions in tsconfig.app.json. ' +
      'This ensures TypeScript and Vite agree on the alias resolution at compile and runtime.',
    regressionRisk: 'low',
  }),

  'src/lib/db/supabase.ts': (_ctx) => ({
    file: 'src/lib/db/supabase.ts',
    description: 'Guard SupabaseClient against missing window.spark.kv',
    rationale: 'SupabaseClient accesses window.spark.kv at class instantiation. In non-Spark environments this throws at module load time.',
    changeType: 'fix',
    priority: 'high',
    pseudocodeSuggestion:
      'Lazily resolve window.spark.kv inside each method rather than assigning it at construction. ' +
      'Add a guard that throws a clear "Spark KV not available" error with env context rather than a raw TypeError.',
    regressionRisk: 'low',
  }),
}

/**
 * Generate concrete per-file patch proposals for the set of impacted files
 * identified by the diagnostics engine.
 */
export function deriveCodePatchProposals(ctx: PatchContext): CodePatchProposal[] {
  const proposals: CodePatchProposal[] = []
  for (const file of ctx.impactedFiles) {
    const recipe = FILE_PATCH_RECIPES[file]
    if (recipe) {
      const proposal = recipe(ctx)
      if (proposal) proposals.push(proposal)
    }
  }
  // Always surface the supabase guard proposal for deploy-mode analyses
  if (ctx.mode === 'diagnose_deploy' && !ctx.impactedFiles.includes('src/lib/db/supabase.ts')) {
    const recipe = FILE_PATCH_RECIPES['src/lib/db/supabase.ts']
    if (recipe) {
      const p = recipe(ctx)
      if (p) proposals.push(p)
    }
  }
  return proposals.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })
}
