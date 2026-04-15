import { useMemo, useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ASSISTANT_ACTIONS, findAssistantAction } from '@/domains/assistant/assistant.actions'
import { buildAssistantReport, getAssistantArchitectureSummary } from '@/domains/assistant/assistant.engine'
import { getAssistantWorklogs, saveAssistantWorklog } from '@/domains/assistant/assistant.worklog'
import type { AssistantActionId, AssistantReport, AssistantWorklogEntry } from '@/domains/assistant/assistant.types'
import { useLeads } from '@/domains/leads/lead.hooks'
import { useEvents } from '@/domains/events/event.hooks'
import { useTasks } from '@/hooks/useTasks'
import { useApprovals } from '@/domains/approvals/approval.hooks'
import { useIntegrations } from '@/domains/integrations/integration.hooks'

const DEFAULT_ACTION: AssistantActionId = 'debug-issue'

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString()
}

export function AssistantOpsPage() {
  const leads = useLeads()
  const events = useEvents()
  const tasks = useTasks()
  const approvals = useApprovals()
  const integrations = useIntegrations()
  const [actionId, setActionId] = useState<AssistantActionId>(DEFAULT_ACTION)
  const [prompt, setPrompt] = useState('')
  const [leadHint, setLeadHint] = useState('')
  const [report, setReport] = useState<AssistantReport | null>(null)
  const [worklogs, setWorklogs] = useState<AssistantWorklogEntry[]>(() => getAssistantWorklogs())

  const action = findAssistantAction(actionId)
  const architectureSummary = useMemo(() => getAssistantArchitectureSummary(), [])

  const selectedLead = leads.data.find(lead => lead.id === leadHint)
  const relatedEventNames = selectedLead
    ? events.data.filter(evt => evt.entityType === 'lead' && evt.entityId === selectedLead.id).map(evt => evt.eventName)
    : []
  const relatedTaskTitles = selectedLead
    ? tasks.data.filter(task => task.title.toLowerCase().includes(selectedLead.customerName.toLowerCase())).map(task => task.title)
    : []

  const runAnalysis = () => {
    const nextReport = buildAssistantReport(actionId, prompt, {
      leadCount: leads.data.length,
      eventCount: events.data.length,
      taskCount: tasks.data.length,
      pendingApprovalCount: approvals.data.filter(item => item.status === 'pending').length,
      unhealthyIntegrationCount: integrations.data.filter(item => item.status !== 'healthy').length,
      leadHint: selectedLead?.id,
      relatedEventNames,
      relatedTaskTitles,
    })
    setReport(nextReport)
    const updated = saveAssistantWorklog(actionId, prompt || action.description, nextReport)
    setWorklogs(updated)
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Assistant Ops Console"
        description="Full-spectrum internal AI operating agent for debugging, workflow tracing, and safe implementation planning."
        action={<Badge variant="outline">Internal AI Operating Layer</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Assistant Action Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ASSISTANT_ACTIONS.map(actionOption => (
              <Button
                key={actionOption.id}
                type="button"
                size="sm"
                variant={actionOption.id === actionId ? 'default' : 'outline'}
                onClick={() => setActionId(actionOption.id)}
              >
                {actionOption.label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{action.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Lead hint (optional)</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={leadHint}
                onChange={event => setLeadHint(event.target.value)}
              >
                <option value="">No lead selected</option>
                {leads.data.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.customerName} ({lead.id})
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-muted-foreground rounded-md border border-border p-3">
              <div>Leads: {leads.data.length}</div>
              <div>Events: {events.data.length}</div>
              <div>Tasks: {tasks.data.length}</div>
              <div>Pending approvals: {approvals.data.filter(item => item.status === 'pending').length}</div>
              <div>Unhealthy integrations: {integrations.data.filter(item => item.status !== 'healthy').length}</div>
            </div>
          </div>
          <Textarea
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            className="min-h-[8rem]"
            placeholder="Describe the bug, workflow issue, deploy/config failure, or improvement request."
          />
          <div className="flex gap-2">
            <Button type="button" onClick={runAnalysis}>Run analysis</Button>
            <Button type="button" variant="outline" onClick={() => { setPrompt(''); setReport(null) }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assistant Architecture Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {architectureSummary.map(line => <li key={line}>{line}</li>)}
              </ul>
            </CardContent>
          </Card>

          {report && (
            <Card>
              <CardHeader>
                <CardTitle>Structured Investigation Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div><strong>Objective:</strong> {report.objective}</div>
                <div><strong>Diagnosis:</strong> {report.diagnosis}</div>
                <div><strong>Root Cause:</strong> {report.rootCause}</div>
                <div className="flex items-center gap-2">
                  <strong>Confidence:</strong>
                  <Badge>{Math.round(report.confidence * 100)}%</Badge>
                </div>
                <div>
                  <strong>Impacted Layers:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {report.impactedLayers.map(layer => <Badge variant="secondary" key={layer}>{layer}</Badge>)}
                  </div>
                </div>
                <div>
                  <strong>Impacted Files:</strong>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    {report.impactedFiles.map(file => <li key={file}>{file}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Fix / Improvement Path:</strong>
                  <ul className="list-disc space-y-1 pl-5">
                    {report.fixOrImprovementPath.map(step => <li key={step}>{step}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Changes Made:</strong>
                  <ul className="list-disc space-y-1 pl-5">
                    {report.changesMade.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Validation Steps:</strong>
                  <ul className="list-disc space-y-1 pl-5">
                    {report.validationSteps.map(step => <li key={step}>{step}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Risks / Follow-ups:</strong>
                  <ul className="list-disc space-y-1 pl-5">
                    {report.risksAndFollowUps.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Self-review Quality Gate:</strong>
                  <ul className="list-disc space-y-1 pl-5">
                    {report.selfReviewChecklist.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div><strong>Worklog Summary:</strong> {report.worklogSummary}</div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Investigation History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {worklogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No worklogs yet.</p>
            ) : (
              worklogs.map(entry => (
                <div key={entry.id} className="rounded-md border border-border p-3 text-xs space-y-1">
                  <div className="font-medium">{entry.issueSummary}</div>
                  <div className="text-muted-foreground">{entry.actionId} • {formatTimestamp(entry.timestamp)}</div>
                  <div><strong>Likely cause:</strong> {entry.likelyCause}</div>
                  <div><strong>Files:</strong> {entry.filesInspected.slice(0, 3).join(', ')}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
