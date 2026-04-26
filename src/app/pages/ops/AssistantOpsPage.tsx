import { useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Lightning } from '@phosphor-icons/react'
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
            <div className="flex gap-1 flex-shrink-0">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.3))',
              border: '1px solid rgba(139,92,246,0.4)',
              boxShadow: '0 0 16px rgba(139,92,246,0.25)',
            }}
          >
            <Lightning className="h-5 w-5" style={{ color: '#c4b5fd' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Copilot</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Internal AI operating agent — debugging, workflow tracing, patch proposals
            </p>
          </div>
        </div>
        <div
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          Internal AI Operating Layer
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main chat/analysis area (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action selector card */}
          <div style={{
            background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.75rem',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Action Registry
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {ASSISTANT_ACTIONS.map(actionOption => (
                  <button
                    key={actionOption.id}
                    type="button"
                    onClick={() => setActionId(actionOption.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={actionOption.id === actionId ? {
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.25))',
                      color: '#c4b5fd',
                      border: '1px solid rgba(139,92,246,0.4)',
                      boxShadow: '0 0 10px rgba(139,92,246,0.2)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {actionOption.label}
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{action.description}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs">
                  <span className="block mb-1.5 font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Lead Hint (optional)
                  </span>
                  <select
                    className="h-9 w-full rounded-lg text-sm px-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
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
              </div>
              {/* Prompt Composer */}
              <div className="space-y-2">
                <Textarea
                  value={prompt}
                  onChange={ev => setPrompt(ev.target.value)}
                  className="min-h-[8rem] resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                    borderRadius: '0.5rem',
                  }}
                  placeholder="Describe the bug, workflow issue, deploy/config failure, or improvement request…"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void runAnalysis()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.8))',
                      boxShadow: '0 0 16px rgba(139,92,246,0.3)',
                    }}
                  >
                    <Lightning className="h-4 w-4" />
                    Run Analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPrompt(''); setReport(null) }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results tabs */}
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

            <TabsContent value="patches" className="mt-4">
              <Card>
                <CardHeader><CardTitle>Code Patch Proposals</CardTitle></CardHeader>
                <CardContent>
                  <PatchProposalsPanel proposals={report?.codePatchProposals ?? []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader><CardTitle>Lead Timeline Correlation</CardTitle></CardHeader>
                <CardContent>
                  <TimelinePanel events={timeline} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixes" className="mt-4">
              <Card>
                <CardHeader><CardTitle>Approval-Gated Fix Proposals</CardTitle></CardHeader>
                <CardContent>
                  <FixProposalsPanel
                    report={report}
                    actionId={actionId}
                    onSubmit={handleProposalSubmitted}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader><CardTitle>Investigation History (Server-Persisted)</CardTitle></CardHeader>
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

        {/* ── Right Context Sidebar (1/3) ── */}
        <div className="space-y-4">
          {/* Suggested Actions */}
          <div style={{
            background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '0.75rem',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c4b5fd' }}>
                Suggested Actions
              </p>
            </div>
            <div className="p-3 space-y-1">
              {ASSISTANT_ACTIONS.slice(0, 5).map(a => (
                <button
                  key={a.id}
                  onClick={() => setActionId(a.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                  style={{
                    color: actionId === a.id ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                    background: actionId === a.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (actionId !== a.id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    if (actionId !== a.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context Panel */}
          <div style={{
            background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.75rem',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Context
              </p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Leads', value: leads.data.length },
                { label: 'Events', value: events.data.length },
                { label: 'Tasks', value: tasks.data.length },
                { label: 'Pending Approvals', value: approvals.data.filter(item => item.status === 'pending').length },
                { label: 'Unhealthy Integrations', value: integrations.data.filter(item => item.status !== 'healthy').length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                  <span className="text-xs font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Lead Context */}
          {selectedLead && (
            <div style={{
              background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '0.75rem',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#c4b5fd' }}>
                  Selected Lead
                </p>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="font-medium text-white">{selectedLead.customerName}</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Related Events</span>
                    <span className="text-white">{relatedEventNames.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Related Tasks</span>
                    <span className="text-white">{relatedTaskTitles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Timeline Events</span>
                    <span className="text-white">{timeline.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
