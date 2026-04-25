import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Buildings,
  BookOpen,
  UploadSimple,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  SpinnerGap,
} from '@phosphor-icons/react'
import { useLenders, useProcessingJobs } from '@/domains/finance-match/finance-match.hooks'
import { initializeSeedData } from '@/domains/finance-match/finance-match.seed'
import { useRouter } from '@/app/router'

export function ProgramLibraryPage() {
  const { lenders, loading: lendersLoading } = useLenders()
  const { jobs, loading: jobsLoading } = useProcessingJobs()
  const { navigate } = useRouter()

  useEffect(() => {
    initializeSeedData()
  }, [])

  const activeLenders = lenders.filter((l) => l.isActive)

  function JobStatusBadge({ status }: { status: string }) {
    if (status === 'approved') return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200" variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
    if (status === 'pending_review') return <Badge className="bg-amber-100 text-amber-800 border-amber-200" variant="outline"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
    if (status === 'processing') return <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline"><SpinnerGap className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>
    if (status === 'failed') return <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="ods-page space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Program Library</h1>
          <p className="text-sm text-muted-foreground">Manage lender programs, guidelines, and uploaded program documents</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{activeLenders.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Active Lenders</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{lenders.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Lenders</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'pending_review').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending Review</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'approved').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Approved</div>
        </Card>
      </div>

      {/* Lender Cards */}
      <div>
        <h2 className="text-base font-semibold mb-3">Lenders</h2>
        {lendersLoading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <SpinnerGap className="h-4 w-4 animate-spin" /> Loading lenders…
          </div>
        ) : lenders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No lenders found. Seed data will load automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lenders.map((lender) => (
              <Card key={lender.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Buildings className="h-4 w-4 text-muted-foreground shrink-0" />
                      <CardTitle className="text-sm truncate">{lender.name}</CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={lender.isActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0'
                        : 'bg-gray-100 text-gray-600 border-gray-200 shrink-0'}
                    >
                      {lender.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div><span className="font-medium">Type:</span> {lender.lenderType.replace('_', ' ')}</div>
                    {lender.phone && (
                      <div><span className="font-medium">Phone:</span> {lender.phone}</div>
                    )}
                    {lender.website && (
                      <div className="truncate"><span className="font-medium">Web:</span> {lender.website}</div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs h-8"
                    onClick={() => navigate(`/app/finance/programs/${lender.id}`)}
                  >
                    View Programs <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Upload Section */}
      <div>
        <h2 className="text-base font-semibold mb-3">Upload Program Documents</h2>
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <UploadSimple className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium mb-1">Upload Lender Program Sheets</p>
            <p className="text-xs text-muted-foreground mb-4">
              Upload PDF or Excel program rate sheets for AI-assisted rule extraction. Extracted rules require approval before going live.
            </p>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <UploadSimple className="h-4 w-4" />
              Select File (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Processing Jobs */}
      {(jobs.length > 0 || jobsLoading) && (
        <div>
          <h2 className="text-base font-semibold mb-3">Processing Jobs</h2>
          {jobsLoading ? (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <SpinnerGap className="h-4 w-4 animate-spin" /> Loading jobs…
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">Job {job.id.slice(0, 8)}…</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                        {job.extractedRules.length > 0 && ` · ${job.extractedRules.length} rules extracted`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <JobStatusBadge status={job.status} />
                      {job.status === 'pending_review' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => navigate(`/app/finance/program-review/${job.id}`)}
                        >
                          Review <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
