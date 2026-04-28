import { useState } from 'react'
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
      {/* Header — bold mockup-style */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
        background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
        border: '1px solid rgba(6,182,212,0.18)',
        boxShadow: '0 0 60px rgba(6,182,212,0.04)',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #06b6d4 0%, #1E3A8A 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #06b6d4 0%, rgba(6,182,212,0.3) 40%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="pl-3">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#22d3ee' }}>National Car Mart · Dealer OS</div>
            <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em' }}>CREDIT APPLICATIONS</h1>
            <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>Finance-ready applications with score-driven document requirements · {applications.length} submissions</p>
          </div>
          <Button size="sm" onClick={() => navigate('/app/records/credit-applications/new')} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> New Application
          </Button>
        </div>
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
