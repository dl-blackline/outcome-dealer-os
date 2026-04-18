import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useFinanceApplication, useFinanceApplicationDocuments } from '@/domains/credit/financeApplication.hooks'
import { CREDIT_SCORE_LABELS, DOCUMENT_LABELS, maskSSNForDisplay } from '@/domains/credit/financeApplication.rules'
import { ArrowLeft, SpinnerGap } from '@phosphor-icons/react'

export function CreditApplicationRecordPage() {
  const { params, navigate } = useRouter()
  const appId = params.id || ''
  const appQuery = useFinanceApplication(appId)
  const docsQuery = useFinanceApplicationDocuments(appId)

  if (appQuery.loading || docsQuery.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const application = appQuery.data
  if (!application) {
    return <div className="py-24 text-center text-muted-foreground">Credit application not found.</div>
  }

  const uploadedDocTypes = new Set(docsQuery.data.map((doc) => doc.documentType))

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/credit-applications')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Credit Applications
      </Button>

      <SectionHeader
        title={`Credit Review: ${application.applicant.fullLegalName}`}
        description={`Submitted ${new Date(application.createdAt).toLocaleString()} • Application ${application.id}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Applicant Identity</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Full legal name</span><span>{application.applicant.fullLegalName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{application.applicant.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{application.applicant.phone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span>{application.applicant.dateOfBirth || 'Not provided'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">SSN</span><span>{maskSSNForDisplay(application.applicant.ssnLast4)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">SSN token ref</span><span className="font-mono text-xs">{application.applicant.ssnTokenRef}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Driver license</span><span>{application.applicant.driverLicenseNumber || 'Not provided'}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Credit Profile and Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
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
