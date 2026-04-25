import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  XCircle,
  Warning,
  ArrowLeft,
  FileText,
  SpinnerGap,
} from '@phosphor-icons/react'
import { useProcessingJobs } from '@/domains/finance-match/finance-match.hooks'
import { approveJobRules } from '@/domains/finance-match/finance-match.service'
import { useRouter } from '@/app/router'

function getRuleCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ProgramReviewPage() {
  const { navigate, currentPath } = useRouter()
  const jobId = currentPath.split('/').pop() ?? ''
  const { jobs, loading } = useProcessingJobs()
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const job = jobs.find((j) => j.id === jobId)

  async function handleApprove() {
    if (!job) return
    setApproving(true)
    setError(null)
    const result = await approveJobRules(job.id)
    setApproving(false)
    if (result.ok) {
      setApproved(true)
    } else {
      setError(result.error.message)
    }
  }

  if (loading) {
    return (
      <div className="ods-page flex items-center gap-2 text-muted-foreground">
        <SpinnerGap className="h-5 w-5 animate-spin" /> Loading job…
      </div>
    )
  }

  if (!job) {
    return (
      <div className="ods-page space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance/program-library')} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-muted-foreground">Processing job not found.</div>
      </div>
    )
  }

  return (
    <div className="ods-page space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance/program-library')} className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {job.fileName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Uploaded {new Date(job.createdAt).toLocaleDateString()} · {job.extractedRuleCount ?? 0} rules extracted
          </p>
        </div>
        <Badge
          variant="outline"
          className={approved || job.status === 'approved'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : job.status === 'pending_review'
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'}
        >
          {approved ? 'Approved' : job.status.replace('_', ' ')}
        </Badge>
      </div>

      <Separator />

      {/* Document Preview Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
            <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Document preview not available in demo mode.</p>
            <p className="text-xs text-muted-foreground mt-1">Original file: <span className="font-medium">{job.fileName}</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Rules */}
      <div>
        <h2 className="text-base font-semibold mb-3">Extracted Rules</h2>
        {!job.extractedRuleCount || job.extractedRuleCount === 0 ? (
          <div className="text-sm text-muted-foreground">No rules were extracted from this document.</div>
        ) : (
          <div className="space-y-2">
            {/* Since we don't have the actual extracted rules in the job object, show a placeholder */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Warning className="h-4 w-4 text-amber-500" />
                  <span>Rule details require Supabase integration to display. {job.extractedRuleCount} rules are ready for review.</span>
                </div>
              </CardContent>
            </Card>

            {Array.from({ length: Math.min(job.extractedRuleCount, 5) }, (_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getRuleCategory(['credit', 'ltv', 'income', 'vehicle', 'deal'][i % 5])}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        hard_fail
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Extracted rule #{i + 1} — pending human review
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={approved || job.status === 'approved'}>
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={approved || job.status === 'approved'}>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Approval Actions */}
      {!approved && job.status !== 'approved' && (
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={approving}
            className="gap-2"
          >
            {approving ? (
              <><SpinnerGap className="h-4 w-4 animate-spin" /> Approving…</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Approve All Rules</>
            )}
          </Button>
          <Button variant="outline" onClick={() => navigate('/app/finance/program-library')}>
            Cancel
          </Button>
        </div>
      )}

      {(approved || job.status === 'approved') && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-emerald-800">Rules Approved</div>
            <div className="text-xs text-emerald-700">All extracted rules are now active and will be used in future bank match runs.</div>
          </div>
        </div>
      )}
    </div>
  )
}
