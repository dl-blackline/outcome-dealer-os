import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useRouteParam, hasRouteParam } from '@/app/router/routeParams'
import { PageErrorState, PageLoadingState, PageNotFoundState } from '@/components/core/PageStates'
import { useFinanceApplication, useFinanceApplicationDocuments } from '@/domains/credit/financeApplication.hooks'
import { CREDIT_SCORE_LABELS, DOCUMENT_LABELS, maskSSNForDisplay } from '@/domains/credit/financeApplication.rules'
import { ArrowLeft } from '@phosphor-icons/react'

export function CreditApplicationRecordPage() {
  const { navigate } = useRouter()
  const appId = useRouteParam('id')
  const appQuery = useFinanceApplication(appId)
  const docsQuery = useFinanceApplicationDocuments(appId)

  if (!hasRouteParam(appId)) {
    return <PageNotFoundState title="Credit Application Missing" message="No application id was provided in this route." />
  }

  if (appQuery.loading || docsQuery.loading) {
    return <PageLoadingState title="Loading Credit Application" message="Retrieving application and supporting document records." />
  }

  if (appQuery.error || docsQuery.error) {
    return <PageErrorState title="Unable to Load Credit Application" message={appQuery.error || docsQuery.error || 'An unexpected error occurred.'} />
  }

  const application = appQuery.data
  if (!application) {
    return <PageNotFoundState title="Credit Application Not Found" message="This application could not be found or may have been removed." />
  }

  const uploadedDocTypes = new Set(docsQuery.data.map((doc) => doc.documentType))

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/credit-applications')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Credit Applications
      </Button>

      <SectionHeader
        title={`Credit Review: ${application.primaryApplicant.identity.fullLegalName}`}
        description={`Submitted ${new Date(application.createdAt).toLocaleString()} • Application ${application.id}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Applicant Identity</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="mb-3 rounded-lg border border-border p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary Applicant</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Full legal name</span><span>{application.primaryApplicant.identity.fullLegalName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{application.primaryApplicant.identity.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{application.primaryApplicant.identity.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span>{application.primaryApplicant.identity.dateOfBirth || 'Not provided'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SSN</span><span>{maskSSNForDisplay(application.primaryApplicant.identity.ssnLast4)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Driver license</span><span>{application.primaryApplicant.identity.driverLicenseNumber || 'Not provided'}</span></div>
            </div>

            {application.coApplicant && (
              <div className="rounded-lg border border-border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Co-Applicant</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Full legal name</span><span>{application.coApplicant.identity.fullLegalName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{application.coApplicant.identity.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{application.coApplicant.identity.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span>{application.coApplicant.identity.dateOfBirth || 'Not provided'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SSN</span><span>{maskSSNForDisplay(application.coApplicant.identity.ssnLast4)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Driver license</span><span>{application.coApplicant.identity.driverLicenseNumber || 'Not provided'}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Credit Profile and Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Application type</span>
              <StatusPill variant={application.applicationType === 'joint' ? 'info' : 'neutral'}>{application.applicationType}</StatusPill>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Credit score range</span>
              <span>{CREDIT_SCORE_LABELS[application.creditScoreRange]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Application status</span>
              <StatusPill variant={application.applicationStatus === 'ready_for_review' ? 'success' : 'warning'}>{application.applicationStatus.replace(/_/g, ' ')}</StatusPill>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completeness</span>
              <StatusPill variant={application.completenessStatus === 'ready' ? 'success' : 'warning'}>{application.completenessStatus}</StatusPill>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Residency</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Current residence</p>
              <p className="text-muted-foreground">{application.currentResidence.addressLine1}{application.currentResidence.addressLine2 ? `, ${application.currentResidence.addressLine2}` : ''}, {application.currentResidence.city}, {application.currentResidence.state} {application.currentResidence.zip}</p>
              <p className="text-muted-foreground">{application.currentResidence.housingStatus} • {application.currentResidence.timeAtResidence.years}y {application.currentResidence.timeAtResidence.months}m</p>
            </div>
            {application.previousResidence && (
              <div>
                <p className="font-medium">Previous residence</p>
                <p className="text-muted-foreground">{application.previousResidence.addressLine1}{application.previousResidence.addressLine2 ? `, ${application.previousResidence.addressLine2}` : ''}, {application.previousResidence.city}, {application.previousResidence.state} {application.previousResidence.zip}</p>
                <p className="text-muted-foreground">{application.previousResidence.housingStatus} • {application.previousResidence.timeAtResidence.years}y {application.previousResidence.timeAtResidence.months}m</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Employment</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Current employment</p>
              <p className="text-muted-foreground">{application.currentEmployment.employerName} • {application.currentEmployment.occupationTitle}</p>
              <p className="text-muted-foreground">{application.currentEmployment.employmentStatus} • {application.currentEmployment.timeAtEmployer.years}y {application.currentEmployment.timeAtEmployer.months}m</p>
            </div>
            {application.previousEmployment && (
              <div>
                <p className="font-medium">Previous employment</p>
                <p className="text-muted-foreground">{application.previousEmployment.employerName} • {application.previousEmployment.occupationTitle}</p>
                <p className="text-muted-foreground">{application.previousEmployment.timeAtEmployer.years}y {application.previousEmployment.timeAtEmployer.months}m</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Required Document Checklist</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {application.requiredDocuments.map((docType) => (
              <div key={docType} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <span>{DOCUMENT_LABELS[docType]}</span>
                <StatusPill variant={uploadedDocTypes.has(docType) ? 'success' : 'warning'}>
                  {uploadedDocTypes.has(docType) ? 'Received' : 'Missing'}
                </StatusPill>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {docsQuery.data.length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              docsQuery.data.map((doc) => (
                <div key={doc.id} className="rounded-md border border-border px-3 py-2">
                  <p className="font-medium">{DOCUMENT_LABELS[doc.documentType]}</p>
                  <p className="text-muted-foreground">{doc.fileName} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB</p>
                  <p className="text-xs text-muted-foreground">Uploaded {new Date(doc.createdAt).toLocaleString()} • {doc.uploadStatus}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
