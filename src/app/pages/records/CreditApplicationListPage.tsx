import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useFinanceApplications } from '@/domains/credit/financeApplication.hooks'
import { CREDIT_SCORE_LABELS, maskSSNForDisplay } from '@/domains/credit/financeApplication.rules'
import { CaretRight } from '@phosphor-icons/react'
import { PageEmptyState, PageErrorState, PageLoadingState } from '@/components/core/PageStates'

export function CreditApplicationListPage() {
  const { navigate } = useRouter()
  const query = useFinanceApplications()

  if (query.loading) {
    return <PageLoadingState title="Loading Credit Applications" message="Retrieving finance submissions and completeness status." />
  }

  if (query.error) {
    return <PageErrorState title="Unable to Load Credit Applications" message={query.error} />
  }

  const applications = query.data

  return (
    <div className="ods-page ods-flow-lg">
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
            <PageEmptyState title="No Credit Applications Yet" message="Finance applications will appear here once shoppers submit them." className="max-w-none" />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <div className="space-y-1">
                    <p className="font-medium">{app.primaryApplicant.identity.fullLegalName}</p>
                    <p className="text-sm text-muted-foreground">{app.primaryApplicant.identity.email} • {app.primaryApplicant.identity.phone}</p>
                    <p className="text-xs text-muted-foreground">SSN: {maskSSNForDisplay(app.primaryApplicant.identity.ssnLast4)} • Score: {CREDIT_SCORE_LABELS[app.creditScoreRange]}</p>
                    {app.applicationType === 'joint' && app.coApplicant && (
                      <p className="text-xs text-muted-foreground">Co-Applicant: {app.coApplicant.identity.fullLegalName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill variant={app.applicationType === 'joint' ? 'info' : 'neutral'}>
                      {app.applicationType === 'joint' ? 'Joint' : 'Individual'}
                    </StatusPill>
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
