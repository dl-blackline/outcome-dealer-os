import { useMemo, useState, useCallback } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { ReferenceHero } from '@/components/core/ReferenceHero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ASSISTANT_ACTIONS, findAssistantAction } from '@/domains/assistant/assistant.actions'
import { buildAssistantReport, getAssistantArchitectureSummary } from '@/domains/assistant/assistant.engine'
import { saveAssistantWorklog, useAssistantWorklogs } from '@/domains/assistant/assistant.worklog'
import { buildLeadTimeline, timelineSeverityLabel } from '@/domains/assistant/assistant.timeline'
import { useFixProposals, submitFixProposal } from '@/domains/assistant/assistant.fix'
import type {
  AssistantActionId,
  AssistantReport,
  AssistantFixProposal,
  LeadTimelineEvent,
  CodePatchProposal,
  DeployDiagnosticResult,
} from '@/domains/assistant/assistant.types'
import { useLeads } from '@/domains/leads/lead.hooks'
import { useEvents } from '@/domains/events/event.hooks'
import { useTasks } from '@/hooks/useTasks'
import { useApprovals } from '@/domains/approvals/approval.hooks'
import { useIntegrations } from '@/domains/integrations/integration.hooks'
import { MOCKUP_REFERENCES } from '@/app/mockupReferences'

const DEFAULT_ACTION: AssistantActionId = 'debug-issue'

const SYSTEM_CTX = {
  actorType: 'agent' as const,
  actorId: 'assistant-ops-console',
  actorRole: 'gm',
  source: 'assistant-ops',
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString()
}

function priorityColor(p: CodePatchProposal['priority']): string {
  return { critical: 'destructive', high: 'destructive', medium: 'secondary', low: 'outline' }[p] as string
}

function deployStatusColor(s: DeployDiagnosticResult['status']): string {
  return { ok: 'secondary', warning: 'secondary', error: 'destructive', unknown: 'outline' }[s] as string
}

function severityColor(s: LeadTimelineEvent['severity']): string {
  return { success: 'secondary', info: 'outline', warning: 'secondary', error: 'destructive' }[s] as string
}

function fixStatusColor(s: AssistantFixProposal['status']): string {
  return {
    draft: 'outline',
    pending_approval: 'secondary',
    approved: 'secondary',
    denied: 'destructive',
  }[s] as string
}

/* ─── Sub-components ───────────────────────────────────────────────────── */

function PatchProposalsPanel({ proposals }: { proposals: CodePatchProposal[] }) {
  if (proposals.length === 0) {
    return <p className="text-sm text-muted-foreground">No patch proposals for this analysis. Try a more specific prompt or select a different action.</p>
  }
  return (
    <div className="space-y-3">
      {proposals.map((p, i) => (
        <div key={`${p.file}-${i}`} className="rounded-md border border-border p-3 space-y-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{p.file}</code>
            <div className="flex gap-1 shrink-0">
              <Badge variant={priorityColor(p.priority) as 'destructive' | 'secondary' | 'outline'}>{p.priority}</Badge>
              <Badge variant="outline">{p.changeType}</Badge>
            </div>
          </div>
          <div><strong>{p.description}</strong></div>
          <div className="text-muted-foreground text-xs">{p.rationale}</div>
          <div className="bg-muted rounded p-2 text-xs font-mono whitespace-pre-wrap">{p.pseudocodeSuggestion}</div>
          <div className="text-xs text-muted-foreground">Regression risk: <strong>{p.regressionRisk}</strong></div>
        </div>
      ))}
    </div>
  )
}

function DeployDiagnosticsPanel({ diagnostics }: { diagnostics: DeployDiagnosticResult[] }) {
  if (diagnostics.length === 0) {
    return <p className="text-sm text-muted-foreground">Run "Diagnose deploy/config issue" to see environment diagnostics.</p>
  }
  return (
    <div className="space-y-2">
      {diagnostics.map((d, i) => (
        <div key={`${d.item}-${i}`} className="rounded-md border border-border p-3 space-y-1 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-xs">{d.item}</span>
            <Badge variant={deployStatusColor(d.status) as 'destructive' | 'secondary' | 'outline'}>{d.status}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">{d.detail}</div>
          {d.remediation && (
            <div className="text-xs text-muted-foreground border-l-2 border-border pl-2">{d.remediation}</div>
          )}
        </div>
      ))}
    </div>
  )
}

function TimelinePanel({ events }: { events: LeadTimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Select a lead hint to see correlated timeline events, tasks, and appointments.</p>
  }
  return (
    <ol className="relative border-l border-border space-y-4 pl-4">
      {events.map(evt => (
        <li key={evt.id} className="relative">
          <div className="absolute -left-[1.15rem] top-1 h-3 w-3 rounded-full border-2 border-background bg-border" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{evt.label}</span>
              <Badge variant={severityColor(evt.severity) as 'destructive' | 'secondary' | 'outline'} className="text-[10px] px-1 py-0">
                {timelineSeverityLabel(evt.severity)}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{formatTimestamp(evt.timestamp)}</div>
            <div className="text-xs">{evt.detail}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function FixProposalsPanel({
  report,
  actionId,
  onSubmit,
}: {
  report: AssistantReport | null
  actionId: AssistantActionId
  onSubmit: (proposal: AssistantFixProposal) => void
}) {
  const { proposals, loading, reload } = useFixProposals()
  const [submitting, setSubmitting] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    if (!report || report.codePatchProposals.length === 0) return
    setSubmitting(true)
    setLastError(null)
    try {
      const proposal = await submitFixProposal(
        actionId,
        report.objective,
        report.codePatchProposals,
        SYSTEM_CTX,
      )
      onSubmit(proposal)
      reload()
    } catch (err) {
      setLastError(String(err))
    } finally {
      setSubmitting(false)
    }
  }, [report, actionId, onSubmit, reload])

  return (
    <div className="space-y-6 pb-8">
      {report && report.codePatchProposals.length > 0 && (
        <div className="rounded-md border border-border p-3 space-y-2">
          <div className="text-sm font-medium">Submit current patch proposals for approval</div>
          <p className="text-xs text-muted-foreground">
            This will persist {report.codePatchProposals.length} patch proposal(s) and create an
            ai_action_review approval request visible in the Approval Queue.
          </p>
          {lastError && <p className="text-xs text-destructive">{lastError}</p>}
          <Button
            type="button"
            size="sm"
            disabled={submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading fix proposals…</p>
      ) : proposals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fix proposals yet. Run analysis and submit patch proposals above.</p>
      ) : (
        <div className="space-y-3">
          {proposals.map(fp => (
            <div key={fp.id} className="rounded-md border border-border p-3 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{fp.issueSummary}</span>
                <Badge variant={fixStatusColor(fp.status) as 'destructive' | 'secondary' | 'outline'}>
                  {fp.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-muted-foreground">{fp.actionId} • {formatTimestamp(fp.createdAt)}</div>
              {fp.approvalId && (
                <div className="text-muted-foreground">Approval ID: <code className="font-mono">{fp.approvalId}</code></div>
              )}
              <div className="font-medium">{fp.patchProposals.length} patch proposal(s):</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {fp.patchProposals.map((p, i) => (
                  <li key={`${p.file}-${i}`}>
                    <code className="font-mono">{p.file}</code> — {p.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────────── */

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
  const [worklogKey, setWorklogKey] = useState(0)

  const { worklogs } = useAssistantWorklogs(worklogKey)

  const action = findAssistantAction(actionId)
  const architectureSummary = useMemo(() => getAssistantArchitectureSummary(), [])

  const selectedLead = leads.data.find(lead => lead.id === leadHint)

  // Memoize derived arrays so runAnalysis's useCallback only re-creates when
  // the correlated subset actually changes, not on every data frame.
  const relatedEventNames = useMemo(
    () => selectedLead
      ? events.data
          .filter(evt => evt.entityType === 'lead' && evt.entityId === selectedLead.id)
          .map(evt => evt.eventName)
      : [],
    [selectedLead, events.data],
  )

  const relatedTaskTitles = useMemo(
    () => selectedLead
      ? tasks.data
          .filter(task => task.title.toLowerCase().includes(selectedLead.customerName.toLowerCase()))
          .map(task => task.title)
      : [],
    [selectedLead, tasks.data],
  )

  const timeline = useMemo(
    () => buildLeadTimeline(leadHint, selectedLead, events.data, tasks.data),
    [leadHint, selectedLead, events.data, tasks.data],
  )

  const runAnalysis = useCallback(async () => {
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
    await saveAssistantWorklog(actionId, prompt || action.description, nextReport)
    setWorklogKey(k => k + 1)
  }, [
    actionId,
    prompt,
    leads.data.length,
    events.data.length,
    tasks.data.length,
    approvals.data,
    integrations.data,
    selectedLead,
    relatedEventNames,
    relatedTaskTitles,
    action.description,
  ])

  const handleProposalSubmitted = useCallback((_proposal: AssistantFixProposal) => {
    // Proposal is already persisted; the FixProposalsPanel reloads itself
  }, [])

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader
        title="Assistant Ops Console"
        description="Full-spectrum internal AI operating agent for debugging, workflow tracing, safe patch proposals, and approval-gated fixes."
        action={<Badge variant="outline">Internal AI Operating Layer</Badge>}
      />

      <ReferenceHero reference={MOCKUP_REFERENCES.aiCopilot} />

      <section className="rounded-2xl border border-white/15 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-4 shadow-[0_22px_70px_rgba(2,6,23,0.42)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-blue-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Leads Indexed</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{leads.data.length}</p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Events Indexed</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{events.data.length}</p>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Pending Approvals</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{approvals.data.filter((item) => item.status === 'pending').length}</p>
          </div>
          <div className="rounded-xl border border-rose-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Unhealthy Integrations</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{integrations.data.filter((item) => item.status !== 'healthy').length}</p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Stored Worklogs</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{worklogs.length}</p>
          </div>
        </div>
      </section>

      {/* ── Input panel ── */}
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
                onChange={ev => setLeadHint(ev.target.value)}
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
            onChange={ev => setPrompt(ev.target.value)}
            className="min-h-[8rem]"
            placeholder="Describe the bug, workflow issue, deploy/config failure, or improvement request."
          />
          <div className="flex gap-2">
            <Button type="button" onClick={() => void runAnalysis()}>Run analysis</Button>
            <Button type="button" variant="outline" onClick={() => { setPrompt(''); setReport(null) }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabbed results ── */}
      <Tabs defaultValue="analysis">
        <TabsList>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="patches">
            Patch Proposals
            {report && report.codePatchProposals.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">{report.codePatchProposals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline
            {timeline.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">{timeline.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fixes">Fix Approvals</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ── Analysis tab ── */}
        <TabsContent value="analysis" className="space-y-6 mt-4">
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

                {/* Deploy diagnostics inline in analysis if present */}
                {report.deployDiagnostics.length > 0 && (
                  <div>
                    <strong className="block mb-2">Deploy / Env Diagnostics:</strong>
                    <DeployDiagnosticsPanel diagnostics={report.deployDiagnostics} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Patch proposals tab ── */}
        <TabsContent value="patches" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Patch Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <PatchProposalsPanel proposals={report?.codePatchProposals ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Timeline tab ── */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Timeline Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelinePanel events={timeline} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Fix approvals tab ── */}
        <TabsContent value="fixes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval-Gated Fix Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <FixProposalsPanel
                report={report}
                actionId={actionId}
                onSubmit={handleProposalSubmitted}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── History tab ── */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Investigation History (Server-Persisted)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {worklogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No worklogs yet. Run an analysis to begin the audit trail.</p>
              ) : (
                worklogs.map(entry => (
                  <div key={entry.id} className="rounded-md border border-border p-3 text-xs space-y-1">
                    <div className="font-medium">{entry.issueSummary}</div>
                    <div className="text-muted-foreground">{entry.actionId} • {formatTimestamp(entry.timestamp)}</div>
                    <div><strong>Likely cause:</strong> {entry.likelyCause}</div>
                    <div><strong>Files:</strong> {entry.filesInspected.slice(0, 3).join(', ')}{entry.filesInspected.length > 3 ? ` +${entry.filesInspected.length - 3} more` : ''}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
