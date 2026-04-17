import { useRef, useEffect } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { StatusPill } from '@/components/core/StatusPill'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  useRepPerformances,
  useCloseProbabilities,
  useVinEnrichments,
  useIngestionStream,
} from '@/domains/intelligence/intelligence.hooks'
import {
  Brain,
  ChartBar,
  Car,
  UserCircle,
  Lightning,
  Play,
  ArrowClockwise,
  CheckCircle,
  Warning,
  SpinnerGap,
  TrendUp,
  ShieldCheck,
  Robot,
} from '@phosphor-icons/react'
import type { IngestionEvent } from '@/domains/intelligence/intelligence.types'

// ─── Rep Leaderboard ──────────────────────────────────────────────────────────

function RepLeaderboard() {
  const { data: reps, loading } = useRepPerformances()

  const sorted = [...reps].sort(
    (a, b) => b.weightedAttributionScore - a.weightedAttributionScore
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          Rep Performance Ledger
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No rep data yet. Create or convert a deal to generate attribution.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((rep, i) => (
              <div
                key={rep.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {rep.repName ?? rep.repId}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      Score: {rep.weightedAttributionScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{rep.totalDeals} closed</span>
                    <span>${rep.totalProfit.toLocaleString()} profit</span>
                    <span>{(rep.conversionRate * 100).toFixed(0)}% conv.</span>
                    <span>${rep.avgProfitPerDeal.toLocaleString()} avg</span>
                  </div>
                  <Progress
                    value={Math.min((rep.weightedAttributionScore / 5) * 100, 100)}
                    className="mt-2 h-1.5"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Close Probability Panel ──────────────────────────────────────────────────

function CloseProbabilityPanel() {
  const { data: scores, loading } = useCloseProbabilities()

  const sorted = [...scores].sort((a, b) => b.closeProbability - a.closeProbability)

  function probabilityVariant(score: number): 'success' | 'warning' | 'danger' | 'neutral' {
    if (score >= 70) return 'success'
    if (score >= 45) return 'warning'
    if (score >= 25) return 'danger'
    return 'neutral'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Close Probability
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No scores yet. Deals are scored automatically after creation.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((score) => (
              <div
                key={score.id}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground truncate max-w-[140px]">
                    {score.dealId}
                  </span>
                  <StatusPill variant={probabilityVariant(score.closeProbability)} dot={false}>
                    {score.closeProbability}% close
                  </StatusPill>
                </div>
                <Progress value={score.closeProbability} className="h-2" />
                <div className="flex flex-wrap gap-2">
                  {Object.entries(score.scoringBreakdown).map(([key, val]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key.replace(/([A-Z])/g, ' $1').trim()}: {val}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {score.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── VIN Enrichment Panel ─────────────────────────────────────────────────────

function VinEnrichmentPanel() {
  const { data: enrichments, loading } = useVinEnrichments()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          VIN Enrichment Layer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : enrichments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No VIN data yet. VINs are decoded automatically for imported inventory.
          </p>
        ) : (
          <div className="space-y-3">
            {enrichments.map((e) => (
              <div key={e.id} className="rounded-lg border border-border p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{e.vin}</span>
                  <Badge
                    variant={e.enrichmentSource === 'nhtsa' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {e.enrichmentSource === 'nhtsa' ? 'NHTSA' : 'Fallback'}
                  </Badge>
                </div>
                <p className="text-sm font-medium">
                  {[e.decodedYear, e.decodedMake, e.decodedModel, e.decodedTrim]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                {e.bodyType && (
                  <p className="text-xs text-muted-foreground">Body: {e.bodyType}</p>
                )}
                {e.engineDescription && (
                  <p className="text-xs text-muted-foreground">Engine: {e.engineDescription}</p>
                )}
                {e.estimatedMarketValue != null && e.estimatedMarketValue > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Est. Market Value</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">
                        ${e.estimatedMarketValue.toLocaleString()}
                      </span>
                      {e.priceAccuracyScore != null && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(e.priceAccuracyScore * 100)}% accuracy
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Live Ingestion Stream ─────────────────────────────────────────────────────

const EVENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  job_started: Lightning,
  job_complete: CheckCircle,
  row_parsed: ChartBar,
  ai_extracted: Robot,
  customer_created: UserCircle,
  deal_created: TrendUp,
  vin_enriched: Car,
  clv_updated: ShieldCheck,
  rep_attributed: UserCircle,
  probability_scored: Brain,
  row_error: Warning,
  deduplicated: CheckCircle,
}

function eventVariant(type: string): 'success' | 'warning' | 'info' | 'danger' {
  if (type === 'job_complete' || type === 'customer_created' || type === 'deal_created') return 'success'
  if (type === 'row_error') return 'danger'
  if (type === 'job_started') return 'warning'
  return 'info'
}

function IngestionFeedItem({ event }: { event: IngestionEvent }) {
  const Icon = EVENT_ICON[event.type] ?? Lightning
  const variant = eventVariant(event.type)
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusPill variant={variant} dot={false} className="text-xs shrink-0">
            {event.type.replace(/_/g, ' ')}
          </StatusPill>
          <span className="text-xs text-foreground truncate">{event.message}</span>
        </div>
        {event.confidence != null && (
          <div className="text-xs text-muted-foreground mt-0.5">
            AI confidence: {Math.round(event.confidence * 100)}%
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
        {new Date(event.timestamp).toLocaleTimeString()}
      </span>
    </div>
  )
}

function LiveIngestionPanel() {
  const { events, jobState, startJob, resetJob } = useIngestionStream()
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0
    }
  }, [events.length])

  const progressPct =
    jobState.totalRows > 0
      ? Math.round((jobState.processedRows / jobState.totalRows) * 100)
      : 0

  const { high, medium, low } = jobState.aiConfidenceDistribution
  const totalConf = high + medium + low

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightning className="h-5 w-5 text-primary" />
            Live Ingestion Stream
          </CardTitle>
          <div className="flex gap-2">
            {jobState.status === 'idle' || jobState.status === 'complete' || jobState.status === 'error' ? (
              <>
                {jobState.status !== 'idle' && (
                  <Button variant="outline" size="sm" onClick={resetJob} className="gap-1.5">
                    <ArrowClockwise className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
                <Button size="sm" onClick={startJob} className="gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Run Demo Job
                </Button>
              </>
            ) : (
              <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/20">
                <SpinnerGap className="h-3 w-3 animate-spin" />
                Running — {jobState.rowsPerSecond} rows/sec
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job stats */}
        {jobState.status !== 'idle' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-xl font-bold">{jobState.totalRows}</div>
              <div className="text-xs text-muted-foreground">Total Rows</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-xl font-bold text-emerald-600">{jobState.successCount}</div>
              <div className="text-xs text-muted-foreground">Succeeded</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-xl font-bold text-red-500">{jobState.errorCount}</div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-xl font-bold">{progressPct}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {jobState.status === 'running' && (
          <div className="space-y-1">
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {jobState.processedRows} / {jobState.totalRows} rows processed
            </p>
          </div>
        )}

        {jobState.status === 'complete' && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Job complete — all rows processed successfully
            </span>
          </div>
        )}

        {/* AI Confidence Distribution */}
        {totalConf > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">AI Confidence Distribution</p>
            <div className="flex gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                High ({high})
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                Medium ({medium})
              </Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                Low ({low})
              </Badge>
            </div>
          </div>
        )}

        {/* Live feed */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {events.length > 0 ? `Live feed (${events.length} events)` : 'Live feed'}
          </p>
          <div
            ref={feedRef}
            className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/30 px-3"
          >
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Click &quot;Run Demo Job&quot; to see the live ingestion stream in action.
              </p>
            ) : (
              events.map((event) => (
                <IngestionFeedItem key={event.id} event={event} />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function IntelligencePage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dealer Intelligence Engine"
        description="CLV, Rep Attribution, AI Close Probability, VIN Enrichment &amp; Live Ingestion Stream"
      />

      {/* Top row: Rep Leaderboard + Close Probability */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RepLeaderboard />
        <CloseProbabilityPanel />
      </div>

      {/* Middle row: VIN Enrichment + Ingestion Stream (2/3 width) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <VinEnrichmentPanel />
        <LiveIngestionPanel />
      </div>
    </div>
  )
}
