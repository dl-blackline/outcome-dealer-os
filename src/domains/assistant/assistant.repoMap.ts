import type { AssistantLayer } from './assistant.types'

export interface RepoSurfaceMap {
  id: string
  label: string
  layer: AssistantLayer
  keywords: string[]
  files: string[]
}

export const ASSISTANT_REPO_SURFACES: RepoSurfaceMap[] = [
  {
    id: 'lead-workflow',
    label: 'Lead workflow and customer journey',
    layer: 'lead_workflow_logic',
    keywords: ['lead', 'follow-up', 'follow up', 'routing', 'assignment', 'customer'],
    files: [
      'src/domains/leads/lead.hooks.ts',
      'src/domains/leads/lead.service.ts',
      'src/app/pages/records/LeadListPage.tsx',
      'src/app/pages/records/LeadRecordPage.tsx',
      'src/domains/events/event.hooks.ts',
    ],
  },
  {
    id: 'task-appointment-reminders',
    label: 'Task, appointment, and reminder execution',
    layer: 'task_appointment_logic',
    keywords: ['task', 'appointment', 'reminder', 'schedule', 'calendar', 'due'],
    files: [
      'src/domains/tasks/task.hooks.ts',
      'src/domains/tasks/task.service.ts',
      'src/domains/appointments/appointment.service.ts',
      'src/domains/appointments/appointment.types.ts',
      'src/app/pages/shop/SchedulePage.tsx',
    ],
  },
  {
    id: 'status-transitions',
    label: 'CRM status transitions and workstation continuity',
    layer: 'crm_status_logic',
    keywords: ['status', 'stage', 'transition', 'pipeline', 'qualified', 'converted'],
    files: [
      'src/domains/leads/lead.service.ts',
      'src/domains/workstation/workstation.autoCardRules.ts',
      'src/domains/workstation/workstation.types.ts',
      'src/domains/events/event.constants.ts',
    ],
  },
  {
    id: 'ui-surface',
    label: 'UI interaction and render behavior',
    layer: 'ui',
    keywords: ['ui', 'page', 'button', 'click', 'render', 'layout', 'missing'],
    files: [
      'src/app/AppShell.tsx',
      'src/components/shell/CommandPalette.tsx',
      'src/components/shell/AppSidebar.tsx',
      'src/app/pages',
    ],
  },
  {
    id: 'data-flow',
    label: 'State and data flow',
    layer: 'state_data_flow',
    keywords: ['sync', 'stale', 'state', 'cache', 'query', 'not showing'],
    files: [
      'src/hooks/useQueryResult.ts',
      'src/hooks/useDomainQueries.ts',
      'src/lib/db/helpers.ts',
      'src/lib/db/mappers.ts',
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations and external dependencies',
    layer: 'integration',
    keywords: ['integration', 'webhook', 'email', 'api', 'twilio', 'crm', 'inventory feed'],
    files: [
      'src/domains/integrations/integration.hooks.ts',
      'src/domains/integrations/integration.service.ts',
      'src/domains/communications/communication.service.ts',
    ],
  },
  {
    id: 'deploy-env',
    label: 'Deployment and environment wiring',
    layer: 'deployment_build',
    keywords: ['deploy', 'build', 'netlify', 'env', 'config', 'preview', 'production'],
    files: [
      'package.json',
      'vite.config.ts',
      'runtime.config.json',
      'src/lib/db/supabase.ts',
    ],
  },
  {
    id: 'auth-backend',
    label: 'Auth, backend service, and persistence',
    layer: 'auth_session',
    keywords: ['auth', 'permission', 'session', 'policy', 'save', 'database', 'schema'],
    files: [
      'src/domains/auth/auth.service.ts',
      'src/domains/roles/policy.ts',
      'src/domains/roles/permissions.ts',
      'src/lib/db/supabase.ts',
    ],
  },
]
