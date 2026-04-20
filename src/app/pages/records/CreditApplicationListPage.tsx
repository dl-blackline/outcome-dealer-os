import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRouter } from '@/app/router'
import { useFinanceApplications, useFinanceApplicationMutations } from '@/domains/credit/financeApplication.hooks'
import { CREDIT_SCORE_LABELS, maskSSNForDisplay } from '@/domains/credit/financeApplication.rules'
import { type FinanceCreditApplication } from '@/domains/credit/financeApplication.types'
import { CaretRight, Plus, Trash, SpinnerGap } from '@phosphor-icons/react'
import { PageEmptyState, PageErrorState, PageLoadingState } from '@/components/core/PageStates'

export function CreditApplicationListPage() {
  const { navigate } = useRouter()
  const query = useFinanceApplications()
  const mutations = useFinanceApplicationMutations()
  const [deleteTarget, setDeleteTarget] = useState<FinanceCreditApplication | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await mutations.deleteApplication(deleteTarget.id)
    query.refresh()
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (query.loading) {
    return <PageLoadingState title="Loading Credit Applications" message="Retrieving finance submissions and completeness status." />
  }

  if (query.error) {
    return <PageErrorState title="Unable to Load Credit Applications" message={query.error} />
  }

  const applications = query.data

  return (
    <div className="ods-page ods-flow-lg">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader
          title="Credit Applications"
          description="Finance-ready applications with score-driven document requirements and completeness tracking"
        />
        <Button size="sm" onClick={() => navigate('/app/records/credit-applications/new')} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Application
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="space-y-4">
              <PageEmptyState title="No Credit Applications Yet" message="Finance applications will appear here once submitted." className="max-w-none" />
              <div className="flex justify-center">
                <Button onClick={() => navigate('/app/records/credit-applications/new')} className="gap-2">
                  <Plus className="h-4 w-4" /> Create Application
                </Button>
              </div>
            </div>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete application"
                      onClick={() => setDeleteTarget(app)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credit Application</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete the credit application for <strong>{deleteTarget?.primaryApplicant.identity.fullLegalName}</strong>?
              This will remove the application and its associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
