import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { submitQuickApp } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { getSelectedUnitId } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { SelectedVehicleContext } from '@/domains/buyer-hub/components/SelectedVehicleContext'
import { uploadFinanceApplicationDocument } from '@/domains/credit/financeApplication.service'
import {
  CREDIT_SCORE_LABELS,
  DOCUMENT_LABELS,
  getRequiredDocumentsForApplication,
  normalizeAndValidateSSN,
  shouldRequirePreviousEmployer,
  shouldRequirePreviousResidence,
} from '@/domains/credit/financeApplication.rules'
import { type CreditScoreRange, type RequiredDocumentType } from '@/domains/credit/financeApplication.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Briefcase,
  House,
  Lock,
  UploadSimple,
  Warning,
  UsersThree,
} from '@phosphor-icons/react'

type ApplicantKey = 'primary' | 'co'
type ApplicationType = 'individual' | 'joint'
type Step = 'applicationType' | 'primaryIdentity' | 'primaryResidency' | 'primaryEmployment' | 'coIdentity' | 'coResidency' | 'coEmployment' | 'review'

interface UploadedDocState {
  type: RequiredDocumentType
  fileName: string
  status: 'uploaded' | 'failed'
  error?: string
  uploadedAt: string
}

interface ApplicantFormData {
  fullLegalName: string
  email: string
  phone: string
  dateOfBirth: string
  ssnMasked: string
  driverLicenseNumber: string

  currentAddressLine1: string
  currentAddressLine2: string
  currentCity: string
  currentState: string
  currentZip: string
  housingStatus: 'rent' | 'own' | 'mortgage' | 'family' | 'other'
  housingStatusOther: string
  monthlyHousingPayment: string
  residenceYears: string
  residenceMonths: string

  previousResidenceAddressLine1: string
  previousResidenceAddressLine2: string
  previousResidenceCity: string
  previousResidenceState: string
  previousResidenceZip: string
  previousHousingStatus: 'rent' | 'own' | 'mortgage' | 'family' | 'other'
  previousHousingStatusOther: string
  previousMonthlyHousingPayment: string
  previousResidenceYears: string
  previousResidenceMonths: string

  employerName: string
  occupationTitle: string
  employmentStatus: 'full_time' | 'part_time' | 'self_employed' | 'retired' | 'unemployed' | 'other'
  employmentStatusOther: string
  grossMonthlyIncome: string
  annualIncome: string
  employerYears: string
  employerMonths: string

  previousEmployerName: string
  previousOccupationTitle: string
  previousEmployerYears: string
  previousEmployerMonths: string
  previousEmployerGrossMonthlyIncome: string
  previousEmployerAnnualIncome: string

  creditScoreRange: CreditScoreRange | ''
}

interface FormData {
  applicationType: ApplicationType
  coApplicantSameAddress: boolean
  unitId: string
  primary: ApplicantFormData
  co: ApplicantFormData
}

const CREDIT_SCORE_OPTIONS: CreditScoreRange[] = [
  'under_550',
  '550_599',
  '600_649',
  '650_699',
  '700_749',
  '750_plus',
]

const HOUSING_STATUS_OPTIONS: Array<ApplicantFormData['housingStatus']> = ['rent', 'own', 'mortgage', 'family', 'other']
const EMPLOYMENT_STATUS_OPTIONS: Array<ApplicantFormData['employmentStatus']> = ['full_time', 'part_time', 'self_employed', 'retired', 'unemployed', 'other']

const STEP_META: Record<Step, { label: string; icon: typeof User }> = {
  applicationType: { label: 'Application Type', icon: UsersThree },
  primaryIdentity: { label: 'Primary Identity', icon: User },
  primaryResidency: { label: 'Primary Residency', icon: House },
  primaryEmployment: { label: 'Primary Employment', icon: Briefcase },
  coIdentity: { label: 'Co-Applicant Identity', icon: User },
  coResidency: { label: 'Co-Applicant Residency', icon: House },
  coEmployment: { label: 'Co-Applicant Employment', icon: Briefcase },
  review: { label: 'Review', icon: CheckCircle },
}

function createEmptyApplicant(): ApplicantFormData {
  return {
    fullLegalName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssnMasked: '',
    driverLicenseNumber: '',
    currentAddressLine1: '',
    currentAddressLine2: '',
    currentCity: '',
    currentState: '',
    currentZip: '',
    housingStatus: 'rent',
    housingStatusOther: '',
    monthlyHousingPayment: '',
    residenceYears: '',
    residenceMonths: '',
    previousResidenceAddressLine1: '',
    previousResidenceAddressLine2: '',
    previousResidenceCity: '',
    previousResidenceState: '',
    previousResidenceZip: '',
    previousHousingStatus: 'rent',
    previousHousingStatusOther: '',
    previousMonthlyHousingPayment: '',
    previousResidenceYears: '',
    previousResidenceMonths: '',
    employerName: '',
    occupationTitle: '',
    employmentStatus: 'full_time',
    employmentStatusOther: '',
    grossMonthlyIncome: '',
    annualIncome: '',
    employerYears: '',
    employerMonths: '',
    previousEmployerName: '',
    previousOccupationTitle: '',
    previousEmployerYears: '',
    previousEmployerMonths: '',
    previousEmployerGrossMonthlyIncome: '',
    previousEmployerAnnualIncome: '',
    creditScoreRange: '',
  }
}

function formatSsnInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

function toNumberOrUndefined(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function toInt(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0
}

function hasDurationInput(years: string, months: string): boolean {
  return years.trim() !== '' || months.trim() !== ''
}

function StepIndicator({ current, steps }: { current: Step; steps: Step[] }) {
  const currentIdx = steps.findIndex((s) => s === current)

  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const Icon = STEP_META[step].icon
        const isDone = idx < currentIdx
        const isCurrent = idx === currentIdx

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? 'border-primary/60 bg-primary/20 text-primary'
                    : isCurrent
                    ? 'border-primary/50 bg-primary/15 text-primary'
                    : 'border-border bg-muted/40 text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle size={20} weight="fill" /> : <Icon size={18} />}
              </div>
              <span className={`mt-1.5 text-xs font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {STEP_META[step].label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`mb-5 h-0.5 w-10 sm:w-14 transition-colors ${idx < currentIdx ? 'bg-primary/50' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function QuickAppPage() {
  const { navigate } = useRouter()
  const { addItem } = useCustomerProgress()
  const { publicRecords } = useInventoryCatalog()

  const [step, setStep] = useState<Step>('applicationType')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [applicationLeadId, setApplicationLeadId] = useState<string | null>(null)
  const [applicationCustomerId, setApplicationCustomerId] = useState<string | null>(null)
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocumentType[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocState[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadingType, setUploadingType] = useState<RequiredDocumentType | null>(null)

  const [form, setForm] = useState<FormData>({
    applicationType: 'individual',
    coApplicantSameAddress: false,
    unitId: '',
    primary: createEmptyApplicant(),
    co: createEmptyApplicant(),
  })

  const steps = useMemo<Step[]>(() => {
    if (form.applicationType === 'joint') {
      return ['applicationType', 'primaryIdentity', 'primaryResidency', 'primaryEmployment', 'coIdentity', 'coResidency', 'coEmployment', 'review']
    }

    return ['applicationType', 'primaryIdentity', 'primaryResidency', 'primaryEmployment', 'review']
  }, [form.applicationType])

  useEffect(() => {
    if (!steps.includes(step)) {
      setStep('applicationType')
    }
  }, [step, steps])

  useEffect(() => {
    if (!form.coApplicantSameAddress) return

    setForm((prev) => ({
      ...prev,
      co: {
        ...prev.co,
        currentAddressLine1: prev.primary.currentAddressLine1,
        currentAddressLine2: prev.primary.currentAddressLine2,
        currentCity: prev.primary.currentCity,
        currentState: prev.primary.currentState,
        currentZip: prev.primary.currentZip,
        housingStatus: prev.primary.housingStatus,
        housingStatusOther: prev.primary.housingStatusOther,
        monthlyHousingPayment: prev.primary.monthlyHousingPayment,
        residenceYears: prev.primary.residenceYears,
        residenceMonths: prev.primary.residenceMonths,
      },
    }))
  }, [
    form.coApplicantSameAddress,
    form.primary.currentAddressLine1,
    form.primary.currentAddressLine2,
    form.primary.currentCity,
    form.primary.currentState,
    form.primary.currentZip,
    form.primary.housingStatus,
    form.primary.housingStatusOther,
    form.primary.monthlyHousingPayment,
    form.primary.residenceYears,
    form.primary.residenceMonths,
  ])

  function setApplicantField(applicant: ApplicantKey, field: keyof ApplicantFormData, value: string) {
    setForm((prev) => ({ ...prev, [applicant]: { ...prev[applicant], [field]: value } }))
  }

  function getApplicant(applicant: ApplicantKey): ApplicantFormData {
    return form[applicant]
  }

  const selectedUnit = publicRecords.find((u) => u.id === form.unitId)

  useEffect(() => {
    if (form.unitId) return
    const selectedId = getSelectedUnitId()
    if (!selectedId) return
    const match = publicRecords.find((u) => u.id === selectedId)
    if (!match) return
    setForm((prev) => ({ ...prev, unitId: match.id }))
  }, [form.unitId, publicRecords])

  function applicantResidenceRequired(applicant: ApplicantKey) {
    const data = getApplicant(applicant)
    return (
      hasDurationInput(data.residenceYears, data.residenceMonths) &&
      shouldRequirePreviousResidence({
        addressLine1: data.currentAddressLine1,
        city: data.currentCity,
        state: data.currentState,
        zip: data.currentZip,
        housingStatus: data.housingStatus,
        housingStatusOther: data.housingStatusOther || undefined,
        monthlyHousingPayment: toNumberOrUndefined(data.monthlyHousingPayment),
        timeAtResidence: { years: toInt(data.residenceYears), months: toInt(data.residenceMonths) },
      })
    )
  }

  function applicantEmploymentRequired(applicant: ApplicantKey) {
    const data = getApplicant(applicant)
    return (
      hasDurationInput(data.employerYears, data.employerMonths) &&
      shouldRequirePreviousEmployer({
        employerName: data.employerName,
        occupationTitle: data.occupationTitle,
        employmentStatus: data.employmentStatus,
        employmentStatusOther: data.employmentStatusOther || undefined,
        grossMonthlyIncome: toNumberOrUndefined(data.grossMonthlyIncome),
        annualIncome: toNumberOrUndefined(data.annualIncome),
        timeAtEmployer: { years: toInt(data.employerYears), months: toInt(data.employerMonths) },
      })
    )
  }

  function identityValid(applicant: ApplicantKey) {
    const data = getApplicant(applicant)
    return (
      data.fullLegalName.trim().length >= 3 &&
      data.email.trim().length > 3 &&
      data.phone.trim().length >= 10 &&
      !!normalizeAndValidateSSN(data.ssnMasked)
    )
  }

  function residencyValid(applicant: ApplicantKey) {
    const data = getApplicant(applicant)
    const requiresPreviousResidence = applicantResidenceRequired(applicant)

    return (
      data.currentAddressLine1.trim() &&
      data.currentCity.trim() &&
      data.currentState.trim() &&
      data.currentZip.trim() &&
      data.residenceYears.trim() !== '' &&
      data.residenceMonths.trim() !== '' &&
      (!requiresPreviousResidence ||
        (data.previousResidenceAddressLine1.trim() &&
          data.previousResidenceCity.trim() &&
          data.previousResidenceState.trim() &&
          data.previousResidenceZip.trim()))
    )
  }

  function employmentValid(applicant: ApplicantKey) {
    const data = getApplicant(applicant)
    const requiresPreviousEmployer = applicantEmploymentRequired(applicant)

    return (
      data.employerName.trim() &&
      data.occupationTitle.trim() &&
      data.employerYears.trim() !== '' &&
      data.employerMonths.trim() !== '' &&
      data.creditScoreRange !== '' &&
      (!requiresPreviousEmployer || data.previousEmployerName.trim())
    )
  }

  const dynamicRequiredDocs = useMemo(() => {
    if (!form.primary.creditScoreRange) return []

    return getRequiredDocumentsForApplication(
      form.applicationType,
      form.primary.creditScoreRange,
      form.applicationType === 'joint' ? form.co.creditScoreRange || undefined : undefined,
    )
  }, [form.applicationType, form.co.creditScoreRange, form.primary.creditScoreRange])

  const allRequiredDocsUploaded = requiredDocs.every((docType) =>
    uploadedDocs.some((d) => d.type === docType && d.status === 'uploaded')
  )

  function buildApplicantPayload(applicant: ApplicantKey) {
    const data = getApplicant(applicant)
    const requiresPreviousResidence = applicantResidenceRequired(applicant)
    const requiresPreviousEmployer = applicantEmploymentRequired(applicant)
    const ssnParsed = normalizeAndValidateSSN(data.ssnMasked)

    if (!ssnParsed) return null

    return {
      fullLegalName: data.fullLegalName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      ssnRaw: ssnParsed.digitsOnly,
      driverLicenseNumber: data.driverLicenseNumber || undefined,
      currentAddressLine1: data.currentAddressLine1,
      currentAddressLine2: data.currentAddressLine2 || undefined,
      currentCity: data.currentCity,
      currentState: data.currentState,
      currentZip: data.currentZip,
      housingStatus: data.housingStatus,
      housingStatusOther: data.housingStatus === 'other' ? data.housingStatusOther : undefined,
      monthlyHousingPayment: toNumberOrUndefined(data.monthlyHousingPayment),
      residenceYears: toInt(data.residenceYears),
      residenceMonths: toInt(data.residenceMonths),
      previousResidenceAddressLine1: requiresPreviousResidence ? data.previousResidenceAddressLine1 : undefined,
      previousResidenceAddressLine2: requiresPreviousResidence ? data.previousResidenceAddressLine2 : undefined,
      previousResidenceCity: requiresPreviousResidence ? data.previousResidenceCity : undefined,
      previousResidenceState: requiresPreviousResidence ? data.previousResidenceState : undefined,
      previousResidenceZip: requiresPreviousResidence ? data.previousResidenceZip : undefined,
      previousHousingStatus: requiresPreviousResidence ? data.previousHousingStatus : undefined,
      previousHousingStatusOther:
        requiresPreviousResidence && data.previousHousingStatus === 'other' ? data.previousHousingStatusOther : undefined,
      previousMonthlyHousingPayment: requiresPreviousResidence ? toNumberOrUndefined(data.previousMonthlyHousingPayment) : undefined,
      previousResidenceYears: requiresPreviousResidence ? toInt(data.previousResidenceYears) : undefined,
      previousResidenceMonths: requiresPreviousResidence ? toInt(data.previousResidenceMonths) : undefined,
      employerName: data.employerName,
      occupationTitle: data.occupationTitle,
      employmentStatus: data.employmentStatus,
      employmentStatusOther: data.employmentStatus === 'other' ? data.employmentStatusOther : undefined,
      grossMonthlyIncome: toNumberOrUndefined(data.grossMonthlyIncome),
      annualIncome: toNumberOrUndefined(data.annualIncome),
      employerYears: toInt(data.employerYears),
      employerMonths: toInt(data.employerMonths),
      previousEmployerName: requiresPreviousEmployer ? data.previousEmployerName : undefined,
      previousOccupationTitle: requiresPreviousEmployer ? data.previousOccupationTitle : undefined,
      previousEmployerYears: requiresPreviousEmployer ? toInt(data.previousEmployerYears) : undefined,
      previousEmployerMonths: requiresPreviousEmployer ? toInt(data.previousEmployerMonths) : undefined,
      previousEmployerGrossMonthlyIncome: requiresPreviousEmployer ? toNumberOrUndefined(data.previousEmployerGrossMonthlyIncome) : undefined,
      previousEmployerAnnualIncome: requiresPreviousEmployer ? toNumberOrUndefined(data.previousEmployerAnnualIncome) : undefined,
      creditScoreRange: data.creditScoreRange as CreditScoreRange,
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const primaryApplicant = buildApplicantPayload('primary')
      if (!primaryApplicant) {
        setSubmitError('Primary Applicant SSN must be valid and complete.')
        return
      }

      if (!form.primary.creditScoreRange) {
        setSubmitError('Select a credit score range for the Primary Applicant.')
        return
      }

      if (form.applicationType === 'joint') {
        if (!form.co.creditScoreRange) {
          setSubmitError('Select a credit score range for the Co-Applicant.')
          return
        }

        if (!identityValid('co') || !residencyValid('co') || !employmentValid('co')) {
          setSubmitError('Co-Applicant details are incomplete. Complete all required co-applicant fields.')
          return
        }
      }

      const coApplicant = form.applicationType === 'joint' ? buildApplicantPayload('co') : undefined
      if (form.applicationType === 'joint' && !coApplicant) {
        setSubmitError('Co-Applicant SSN must be valid and complete.')
        return
      }

      const result = await submitQuickApp({
        applicationType: form.applicationType,
        primaryApplicant,
        coApplicant,
        unitId: form.unitId || undefined,
      })

      if (result.ok) {
        setApplicationId(result.applicationId)
        setApplicationLeadId(result.leadId)
        setApplicationCustomerId(result.customerId)
        setRequiredDocs(result.requiredDocuments as RequiredDocumentType[])
        addItem({
          type: 'application',
          status: 'application_submitted',
          title: 'Credit Application Submitted',
          description:
            form.applicationType === 'joint'
              ? `Joint finance application submitted for ${form.primary.fullLegalName} and ${form.co.fullLegalName}.`
              : `Finance application submitted for ${form.primary.fullLegalName}.`,
          nextAction: 'Upload the required supporting documents to move to review.',
          linkedUnitId: form.unitId || undefined,
        })
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUploadDocument(docType: RequiredDocumentType, file: File | null) {
    if (!file || !applicationId) return

    setUploadError(null)
    setUploadingType(docType)

    const uploadResult = await uploadFinanceApplicationDocument(
      {
        applicationId,
        leadId: applicationLeadId || undefined,
        customerId: applicationCustomerId || undefined,
        documentType: docType,
        fileName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        uploadedByActorType: 'system',
      },
      {
        actorType: 'system',
        actorId: 'buyer_hub',
        source: 'buyer_hub',
      }
    )

    if (uploadResult.ok) {
      setUploadedDocs((prev) => {
        const withoutType = prev.filter((doc) => doc.type !== docType)
        return [
          ...withoutType,
          {
            type: docType,
            fileName: uploadResult.value.fileName,
            status: 'uploaded',
            uploadedAt: uploadResult.value.createdAt,
          },
        ]
      })
    } else {
      setUploadError(uploadResult.error.message)
      setUploadedDocs((prev) => {
        const withoutType = prev.filter((doc) => doc.type !== docType)
        return [
          ...withoutType,
          {
            type: docType,
            fileName: file.name,
            status: 'failed',
            error: uploadResult.error.message,
            uploadedAt: new Date().toISOString(),
          },
        ]
      })
    }

    setUploadingType(null)
  }

  if (applicationId) {
    const stillMissing = requiredDocs.filter((docType) => !uploadedDocs.some((doc) => doc.type === docType && doc.status === 'uploaded'))

    return (
      <div className="ods-buyer-page mx-auto max-w-3xl space-y-8 px-3 pb-24 pt-6 sm:px-4 sm:pt-8">
        {selectedUnit ? <SelectedVehicleContext unit={selectedUnit} label="Application Vehicle" /> : null}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" />
              Application Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your finance application is on file. Complete your required document checklist below to move into internal review.</p>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="text-xs uppercase tracking-[0.13em] text-muted-foreground">Application ID</div>
              <div className="mt-1 font-mono text-xs text-foreground">{applicationId}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Type: {form.applicationType === 'joint' ? 'Joint Application' : 'Individual Application'}</Badge>
              <Badge variant={allRequiredDocsUploaded ? 'secondary' : 'outline'}>
                {allRequiredDocsUploaded ? 'Complete' : `${stillMissing.length} document(s) missing`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Required Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocs.map((docType) => {
              const uploaded = uploadedDocs.find((d) => d.type === docType)
              return (
                <div key={docType} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{DOCUMENT_LABELS[docType]}</p>
                      <p className="text-xs text-muted-foreground">
                        {uploaded?.status === 'uploaded' ? `Uploaded ${new Date(uploaded.uploadedAt).toLocaleString()}` : 'Required for finance review'}
                      </p>
                    </div>
                    <Badge variant={uploaded?.status === 'uploaded' ? 'secondary' : 'outline'}>
                      {uploaded?.status === 'uploaded' ? 'Received' : 'Missing'}
                    </Badge>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground hover:bg-muted/40">
                    <UploadSimple size={16} />
                    {uploadingType === docType ? 'Uploading...' : 'Upload file'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(event) => {
                        void handleUploadDocument(docType, event.target.files?.[0] || null)
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>

                  {uploaded?.status === 'uploaded' && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">{uploaded.fileName}</p>}
                  {uploaded?.status === 'failed' && <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">Upload failed: {uploaded.error}</p>}
                </div>
              )
            })}

            {uploadError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-200">
                <Warning size={14} /> {uploadError}
              </div>
            )}

            {allRequiredDocsUploaded && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-100">
                All required documents are received. Your application is now ready for internal finance review.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button onClick={() => navigate('/my-next-steps')} className="rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                View My Next Steps
              </Button>
              <Button variant="outline" onClick={() => navigate('/shop')} className="rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderIdentity(applicant: ApplicantKey, title: string, next: Step, back?: Step) {
    const data = getApplicant(applicant)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full legal name *</Label>
            <Input value={data.fullLegalName} onChange={(e) => setApplicantField(applicant, 'fullLegalName', e.target.value)} placeholder="Jane Alexandra Smith" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={data.email} onChange={(e) => setApplicantField(applicant, 'email', e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input type="tel" value={data.phone} onChange={(e) => setApplicantField(applicant, 'phone', e.target.value)} placeholder="(555) 010-0101" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Date of birth</Label>
              <Input type="date" value={data.dateOfBirth} onChange={(e) => setApplicantField(applicant, 'dateOfBirth', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Social Security Number *</Label>
              <Input
                inputMode="numeric"
                value={data.ssnMasked}
                onChange={(e) => setApplicantField(applicant, 'ssnMasked', formatSsnInput(e.target.value))}
                placeholder="123-45-6789"
                maxLength={11}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Driver license number</Label>
            <Input value={data.driverLicenseNumber} onChange={(e) => setApplicantField(applicant, 'driverLicenseNumber', e.target.value)} placeholder="S123-4567-8901" />
          </div>

          {applicant === 'primary' && (
            <div className="space-y-1.5">
              <Label>Interested vehicle (optional)</Label>
              <select
                value={form.unitId}
                onChange={(e) => setForm((prev) => ({ ...prev, unitId: e.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">No specific vehicle</option>
                {publicRecords.map((u) => (
                  <option key={u.id} value={u.id}>{u.year} {u.make} {u.model} {u.trim}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between pt-2">
            {back ? (
              <Button variant="outline" onClick={() => setStep(back)} className="rounded-full px-5 text-xs uppercase tracking-[0.14em]">
                <ArrowLeft size={16} className="mr-1.5" />Back
              </Button>
            ) : <div />}
            <Button disabled={!identityValid(applicant)} onClick={() => setStep(next)} className="gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
              Continue
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  function renderResidency(applicant: ApplicantKey, title: string, next: Step, back: Step) {
    const data = getApplicant(applicant)
    const requiresPreviousResidence = applicantResidenceRequired(applicant)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicant === 'co' && (
            <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form.coApplicantSameAddress}
                onChange={(e) => setForm((prev) => ({ ...prev, coApplicantSameAddress: e.target.checked }))}
              />
              Co-Applicant lives at same address as Primary Applicant
            </label>
          )}

          <div className="space-y-1.5"><Label>Current address line 1 *</Label><Input value={data.currentAddressLine1} onChange={(e) => setApplicantField(applicant, 'currentAddressLine1', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Address line 2</Label><Input value={data.currentAddressLine2} onChange={(e) => setApplicantField(applicant, 'currentAddressLine2', e.target.value)} /></div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>City *</Label><Input value={data.currentCity} onChange={(e) => setApplicantField(applicant, 'currentCity', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>State *</Label><Input value={data.currentState} onChange={(e) => setApplicantField(applicant, 'currentState', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>ZIP *</Label><Input value={data.currentZip} onChange={(e) => setApplicantField(applicant, 'currentZip', e.target.value)} /></div>
          </div>

          <div className="space-y-1.5">
            <Label>Housing status *</Label>
            <div className="flex flex-wrap gap-2">
              {HOUSING_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setApplicantField(applicant, 'housingStatus', status)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                    data.housingStatus === status
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {data.housingStatus === 'other' && (
            <div className="space-y-1.5"><Label>Specify housing status</Label><Input value={data.housingStatusOther} onChange={(e) => setApplicantField(applicant, 'housingStatusOther', e.target.value)} /></div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Monthly housing payment</Label><Input type="number" min="0" value={data.monthlyHousingPayment} onChange={(e) => setApplicantField(applicant, 'monthlyHousingPayment', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Years at residence *</Label><Input type="number" min="0" value={data.residenceYears} onChange={(e) => setApplicantField(applicant, 'residenceYears', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Months at residence *</Label><Input type="number" min="0" max="11" value={data.residenceMonths} onChange={(e) => setApplicantField(applicant, 'residenceMonths', e.target.value)} /></div>
          </div>

          {requiresPreviousResidence && (
            <div className="space-y-4 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
              <p className="text-sm font-medium">Previous residence is required when current residency is under 2 years.</p>
              <div className="space-y-1.5"><Label>Previous address line 1 *</Label><Input value={data.previousResidenceAddressLine1} onChange={(e) => setApplicantField(applicant, 'previousResidenceAddressLine1', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Previous address line 2</Label><Input value={data.previousResidenceAddressLine2} onChange={(e) => setApplicantField(applicant, 'previousResidenceAddressLine2', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5"><Label>City *</Label><Input value={data.previousResidenceCity} onChange={(e) => setApplicantField(applicant, 'previousResidenceCity', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>State *</Label><Input value={data.previousResidenceState} onChange={(e) => setApplicantField(applicant, 'previousResidenceState', e.target.value)} /></div>
                <div className="space-y-1.5"><Label>ZIP *</Label><Input value={data.previousResidenceZip} onChange={(e) => setApplicantField(applicant, 'previousResidenceZip', e.target.value)} /></div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(back)} className="rounded-full px-5 text-xs uppercase tracking-[0.14em]"><ArrowLeft size={16} className="mr-1.5" />Back</Button>
            <Button disabled={!residencyValid(applicant)} onClick={() => setStep(next)} className="gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">Continue<ArrowRight size={16} /></Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  function renderEmployment(applicant: ApplicantKey, title: string, next: Step, back: Step) {
    const data = getApplicant(applicant)
    const requiresPreviousEmployer = applicantEmploymentRequired(applicant)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label>Current employer *</Label><Input value={data.employerName} onChange={(e) => setApplicantField(applicant, 'employerName', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Job title / occupation *</Label><Input value={data.occupationTitle} onChange={(e) => setApplicantField(applicant, 'occupationTitle', e.target.value)} /></div>

          <div className="space-y-1.5">
            <Label>Employment status *</Label>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setApplicantField(applicant, 'employmentStatus', status)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                    data.employmentStatus === status
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {data.employmentStatus === 'other' && (
            <div className="space-y-1.5"><Label>Specify employment status</Label><Input value={data.employmentStatusOther} onChange={(e) => setApplicantField(applicant, 'employmentStatusOther', e.target.value)} /></div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Gross monthly income</Label><Input type="number" min="0" value={data.grossMonthlyIncome} onChange={(e) => setApplicantField(applicant, 'grossMonthlyIncome', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Annual income</Label><Input type="number" min="0" value={data.annualIncome} onChange={(e) => setApplicantField(applicant, 'annualIncome', e.target.value)} /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Years at employer *</Label><Input type="number" min="0" value={data.employerYears} onChange={(e) => setApplicantField(applicant, 'employerYears', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Months at employer *</Label><Input type="number" min="0" max="11" value={data.employerMonths} onChange={(e) => setApplicantField(applicant, 'employerMonths', e.target.value)} /></div>
          </div>

          {requiresPreviousEmployer && (
            <div className="space-y-4 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
              <p className="text-sm font-medium">Previous employment is required when current employment is under 2 years.</p>
              <div className="space-y-1.5"><Label>Previous employer *</Label><Input value={data.previousEmployerName} onChange={(e) => setApplicantField(applicant, 'previousEmployerName', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Previous job title</Label><Input value={data.previousOccupationTitle} onChange={(e) => setApplicantField(applicant, 'previousOccupationTitle', e.target.value)} /></div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Credit score range *</Label>
            <select
              value={data.creditScoreRange}
              onChange={(e) => setApplicantField(applicant, 'creditScoreRange', e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select range</option>
              {CREDIT_SCORE_OPTIONS.map((range) => (
                <option key={range} value={range}>{CREDIT_SCORE_LABELS[range]}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(back)} className="rounded-full px-5 text-xs uppercase tracking-[0.14em]"><ArrowLeft size={16} className="mr-1.5" />Back</Button>
            <Button disabled={!employmentValid(applicant)} onClick={() => setStep(next)} className="gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
              {next === 'review' ? 'Review Application' : 'Continue'}
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="ods-buyer-page mx-auto max-w-3xl space-y-8 px-3 pb-24 pt-6 sm:px-4 sm:pt-8">
      {selectedUnit ? <SelectedVehicleContext unit={selectedUnit} label="Vehicle In Focus" /> : null}
      <div className="rounded-3xl border border-border bg-card/80 p-6 sm:p-7">
        <Button variant="ghost" size="sm" className="mb-4 rounded-full border border-border px-4 text-xs uppercase tracking-[0.14em]" onClick={() => navigate('/finance')}>
          <ArrowLeft size={18} className="mr-1.5" />
          Back to Finance
        </Button>
        <div className="mb-2 flex items-center gap-3">
          <Lock size={24} className="text-primary" />
          <h1 className="text-2xl font-bold">Finance Credit Application</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete the full application and upload required documents based on application type and applicant credit ranges.
        </p>
      </div>

      <StepIndicator current={step} steps={steps} />

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-200">
          <Warning size={16} /> {submitError}
        </div>
      )}

      {step === 'applicationType' && (
        <Card>
          <CardHeader>
            <CardTitle>Application Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, applicationType: 'individual' }))}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  form.applicationType === 'individual' ? 'border-primary/50 bg-primary/10' : 'border-border bg-background hover:bg-muted/30'
                }`}
              >
                <p className="font-semibold">Individual Application</p>
                <p className="mt-1 text-sm text-muted-foreground">Single applicant credit profile and documents.</p>
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, applicationType: 'joint' }))}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  form.applicationType === 'joint' ? 'border-primary/50 bg-primary/10' : 'border-border bg-background hover:bg-muted/30'
                }`}
              >
                <p className="font-semibold">Joint Application</p>
                <p className="mt-1 text-sm text-muted-foreground">Primary Applicant + Co-Applicant with separate validation.</p>
              </button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep('primaryIdentity')} className="gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                Continue
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'primaryIdentity' && renderIdentity('primary', 'Primary Applicant Identity and Contact', 'primaryResidency', 'applicationType')}
      {step === 'primaryResidency' && renderResidency('primary', 'Primary Applicant Residency', 'primaryEmployment', 'primaryIdentity')}
      {step === 'primaryEmployment' && renderEmployment('primary', 'Primary Applicant Employment and Credit Profile', form.applicationType === 'joint' ? 'coIdentity' : 'review', 'primaryResidency')}
      {step === 'coIdentity' && renderIdentity('co', 'Co-Applicant Identity and Contact', 'coResidency', 'primaryEmployment')}
      {step === 'coResidency' && renderResidency('co', 'Co-Applicant Residency', 'coEmployment', 'coIdentity')}
      {step === 'coEmployment' && renderEmployment('co', 'Co-Applicant Employment and Credit Profile', 'review', 'coResidency')}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review and Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Application type</p>
                <p className="font-medium">{form.applicationType === 'joint' ? 'Joint Application' : 'Individual Application'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Vehicle of interest</p>
                <p className="font-medium">{selectedUnit ? `${selectedUnit.year} ${selectedUnit.make} ${selectedUnit.model} ${selectedUnit.trim}` : 'No specific vehicle selected'}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-5 sm:grid-cols-2 text-sm">
              <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-4">
                <p className="font-semibold">Primary Applicant</p>
                <p>{form.primary.fullLegalName}</p>
                <p className="text-muted-foreground">{form.primary.email} • {form.primary.phone}</p>
                <p className="text-muted-foreground">Credit score: {form.primary.creditScoreRange ? CREDIT_SCORE_LABELS[form.primary.creditScoreRange] : 'Not selected'}</p>
                <p className="text-muted-foreground font-mono text-xs">SSN: {normalizeAndValidateSSN(form.primary.ssnMasked)?.masked || 'Invalid SSN'}</p>
              </div>

              {form.applicationType === 'joint' && (
                <div className="space-y-1.5 rounded-lg border border-border bg-muted/20 p-4">
                  <p className="font-semibold">Co-Applicant</p>
                  <p>{form.co.fullLegalName}</p>
                  <p className="text-muted-foreground">{form.co.email} • {form.co.phone}</p>
                  <p className="text-muted-foreground">Credit score: {form.co.creditScoreRange ? CREDIT_SCORE_LABELS[form.co.creditScoreRange] : 'Not selected'}</p>
                  <p className="text-muted-foreground font-mono text-xs">SSN: {normalizeAndValidateSSN(form.co.ssnMasked)?.masked || 'Invalid SSN'}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Required documents after submit</p>
              <ul className="space-y-1">
                {dynamicRequiredDocs.map((docType) => (
                  <li key={docType}>- {DOCUMENT_LABELS[docType]}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <Lock size={14} className="mt-0.5 shrink-0" />
              <span>
                SSN is tokenized at submission. Browser views keep masked display only, and internal records do not store plaintext SSN.
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(form.applicationType === 'joint' ? 'coEmployment' : 'primaryEmployment')}
                className="rounded-full px-5 text-xs uppercase tracking-[0.14em]"
              >
                <ArrowLeft size={16} className="mr-1.5" />Back
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={submitting} className="gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                {submitting ? 'Submitting...' : 'Submit Application'}
                {!submitting && <CheckCircle size={16} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
