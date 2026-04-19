import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useFinanceApplications } from '@/domains/credit/financeApplication.hooks'
import { CREDIT_SCORE_LABELS, maskSSNForDisplay } from '@/domains/credit/financeApplication.rules'
import { SpinnerGap, CaretRight } from '@phosphor-icons/react'

export function CreditApplicationListPage() {
  const { navigate } = useRouter()
  const query = useFinanceApplications()

  if (query.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const applications = query.data

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader
        title="Credit Applications"
        description="Finance-ready applications with score-driven document requirements and completeness tracking"
      />

      <Card>
        <CardHeader>
          <CardTitle>Submitted Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credit applications submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{app.applicant.fullLegalName}</p>
                    <p className="text-sm text-muted-foreground">{app.applicant.email} • {app.applicant.phone}</p>
                    <p className="text-xs text-muted-foreground">SSN: {maskSSNForDisplay(app.applicant.ssnLast4)} • Score: {CREDIT_SCORE_LABELS[app.creditScoreRange]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill variant={app.completenessStatus === 'ready' ? 'success' : 'warning'}>
                      {app.completenessStatus === 'ready' ? 'Ready' : 'Missing Docs'}
                    </StatusPill>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/app/records/credit-applications/${app.id}`)} className="gap-1">
                      Review
                      <CaretRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
