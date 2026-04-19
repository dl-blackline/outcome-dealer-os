import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { submitQuickApp } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { uploadFinanceApplicationDocument } from '@/domains/credit/financeApplication.service'
import {
  CREDIT_SCORE_LABELS,
  DOCUMENT_LABELS,
  getRequiredDocumentsForScoreRange,
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
} from '@phosphor-icons/react'

type Step = 'identity' | 'residency' | 'employment' | 'review'

interface UploadedDocState {
  type: RequiredDocumentType
  fileName: string
  status: 'uploaded' | 'failed'
  error?: string
  uploadedAt: string
}

interface FormData {
  fullLegalName: string
  email: string
  phone: string
  dateOfBirth: string
  ssnMasked: string
  driverLicenseNumber: string
  unitId: string

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

const STEPS: { id: Step; label: string; icon: typeof User }[] = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'residency', label: 'Residency', icon: House },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'review', label: 'Review', icon: CheckCircle },
]

const CREDIT_SCORE_OPTIONS: CreditScoreRange[] = [
  'under_550',
  '550_599',
  '600_649',
  '650_699',
  '700_749',
  '750_plus',
]

const HOUSING_STATUS_OPTIONS: Array<FormData['housingStatus']> = ['rent', 'own', 'mortgage', 'family', 'other']
const EMPLOYMENT_STATUS_OPTIONS: Array<FormData['employmentStatus']> = ['full_time', 'part_time', 'self_employed', 'retired', 'unemployed', 'other']

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2">
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const isDone = idx < currentIdx
        const isCurrent = idx === currentIdx
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? 'border-blue-200/45 bg-blue-300/18 text-blue-100'
                    : isCurrent
                    ? 'border-blue-200/45 bg-black/20 text-blue-100'
                    : 'border-white/20 bg-black/25 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle size={20} weight="fill" /> : <Icon size={18} />}
              </div>
              <span className={`mt-1.5 text-xs font-medium ${isCurrent ? 'text-slate-100' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`mb-5 h-0.5 w-12 sm:w-16 transition-colors ${idx < currentIdx ? 'bg-blue-300/50' : 'bg-white/15'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
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

export function QuickAppPage() {
  const { navigate } = useRouter()
  const { addItem } = useCustomerProgress()
  const { publicRecords } = useInventoryCatalog()

  const [step, setStep] = useState<Step>('identity')
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
    fullLegalName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssnMasked: '',
    driverLicenseNumber: '',
    unitId: '',

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
  })

  const set = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const selectedUnit = publicRecords.find((u) => u.id === form.unitId)

  const residenceYears = toInt(form.residenceYears)
  const residenceMonths = toInt(form.residenceMonths)
  const employerYears = toInt(form.employerYears)
  const employerMonths = toInt(form.employerMonths)

  const requiresPreviousResidence =
    hasDurationInput(form.residenceYears, form.residenceMonths) &&
    shouldRequirePreviousResidence({
      addressLine1: form.currentAddressLine1,
      city: form.currentCity,
      state: form.currentState,
      zip: form.currentZip,
      housingStatus: form.housingStatus,
      housingStatusOther: form.housingStatusOther || undefined,
      monthlyHousingPayment: toNumberOrUndefined(form.monthlyHousingPayment),
      timeAtResidence: { years: residenceYears, months: residenceMonths },
    })

  const requiresPreviousEmployer =
    hasDurationInput(form.employerYears, form.employerMonths) &&
    shouldRequirePreviousEmployer({
      employerName: form.employerName,
      occupationTitle: form.occupationTitle,
      employmentStatus: form.employmentStatus,
      employmentStatusOther: form.employmentStatusOther || undefined,
      grossMonthlyIncome: toNumberOrUndefined(form.grossMonthlyIncome),
      annualIncome: toNumberOrUndefined(form.annualIncome),
      timeAtEmployer: { years: employerYears, months: employerMonths },
    })

  const dynamicRequiredDocs = useMemo(
    () => (form.creditScoreRange ? getRequiredDocumentsForScoreRange(form.creditScoreRange as CreditScoreRange) : []),
    [form.creditScoreRange]
  )

  const identityValid =
    form.fullLegalName.trim().length >= 3 &&
    form.email.trim().length > 3 &&
    form.phone.trim().length >= 10 &&
    !!normalizeAndValidateSSN(form.ssnMasked)

  const residencyValid =
    form.currentAddressLine1.trim() &&
    form.currentCity.trim() &&
    form.currentState.trim() &&
    form.currentZip.trim() &&
    form.residenceYears.trim() !== '' &&
    form.residenceMonths.trim() !== '' &&
    (!requiresPreviousResidence ||
      (form.previousResidenceAddressLine1.trim() &&
        form.previousResidenceCity.trim() &&
        form.previousResidenceState.trim() &&
        form.previousResidenceZip.trim()))

  const employmentValid =
    form.employerName.trim() &&
    form.occupationTitle.trim() &&
    form.employerYears.trim() !== '' &&
    form.employerMonths.trim() !== '' &&
    form.creditScoreRange !== '' &&
    (!requiresPreviousEmployer || form.previousEmployerName.trim())

  const allRequiredDocsUploaded = requiredDocs.every((docType) =>
    uploadedDocs.some((d) => d.type === docType && d.status === 'uploaded')
  )

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const ssnParsed = normalizeAndValidateSSN(form.ssnMasked)
      if (!ssnParsed) {
        setSubmitError('Please enter a valid SSN in the format 123-45-6789.')
        return
      }

      if (!form.creditScoreRange) {
        setSubmitError('Please select your credit score range.')
        return
      }

      const result = await submitQuickApp({
        fullLegalName: form.fullLegalName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        ssnRaw: ssnParsed.digitsOnly,
        driverLicenseNumber: form.driverLicenseNumber || undefined,
        currentAddressLine1: form.currentAddressLine1,
        currentAddressLine2: form.currentAddressLine2 || undefined,
        currentCity: form.currentCity,
        currentState: form.currentState,
        currentZip: form.currentZip,
        housingStatus: form.housingStatus,
        housingStatusOther: form.housingStatus === 'other' ? form.housingStatusOther : undefined,
        monthlyHousingPayment: toNumberOrUndefined(form.monthlyHousingPayment),
        residenceYears,
        residenceMonths,
        previousResidenceAddressLine1: requiresPreviousResidence ? form.previousResidenceAddressLine1 : undefined,
        previousResidenceAddressLine2: requiresPreviousResidence ? form.previousResidenceAddressLine2 : undefined,
        previousResidenceCity: requiresPreviousResidence ? form.previousResidenceCity : undefined,
        previousResidenceState: requiresPreviousResidence ? form.previousResidenceState : undefined,
        previousResidenceZip: requiresPreviousResidence ? form.previousResidenceZip : undefined,
        previousHousingStatus: requiresPreviousResidence ? form.previousHousingStatus : undefined,
        previousHousingStatusOther:
          requiresPreviousResidence && form.previousHousingStatus === 'other'
            ? form.previousHousingStatusOther
            : undefined,
        previousMonthlyHousingPayment: requiresPreviousResidence
          ? toNumberOrUndefined(form.previousMonthlyHousingPayment)
          : undefined,
        previousResidenceYears: requiresPreviousResidence ? toInt(form.previousResidenceYears) : undefined,
        previousResidenceMonths: requiresPreviousResidence ? toInt(form.previousResidenceMonths) : undefined,
        employerName: form.employerName,
        occupationTitle: form.occupationTitle,
        employmentStatus: form.employmentStatus,
        employmentStatusOther: form.employmentStatus === 'other' ? form.employmentStatusOther : undefined,
        grossMonthlyIncome: toNumberOrUndefined(form.grossMonthlyIncome),
        annualIncome: toNumberOrUndefined(form.annualIncome),
        employerYears,
        employerMonths,
        previousEmployerName: requiresPreviousEmployer ? form.previousEmployerName : undefined,
        previousOccupationTitle: requiresPreviousEmployer ? form.previousOccupationTitle : undefined,
        previousEmployerYears: requiresPreviousEmployer ? toInt(form.previousEmployerYears) : undefined,
        previousEmployerMonths: requiresPreviousEmployer ? toInt(form.previousEmployerMonths) : undefined,
        previousEmployerGrossMonthlyIncome: requiresPreviousEmployer
          ? toNumberOrUndefined(form.previousEmployerGrossMonthlyIncome)
          : undefined,
        previousEmployerAnnualIncome: requiresPreviousEmployer
          ? toNumberOrUndefined(form.previousEmployerAnnualIncome)
          : undefined,
        creditScoreRange: form.creditScoreRange as CreditScoreRange,
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
          description: `Finance application submitted for ${form.fullLegalName}.`,
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
    const stillMissing = requiredDocs.filter(
      (docType) => !uploadedDocs.some((doc) => doc.type === docType && doc.status === 'uploaded')
    )

    return (
      <div className="mx-auto max-w-3xl space-y-8 px-3 pb-24 pt-6 sm:px-4 sm:pt-8">
        <Card className="vault-panel-soft rounded-3xl border-white/15 bg-black/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle size={20} className="text-emerald-400" />
              Application Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>
              Your finance application is on file. Complete your required document checklist below to move into
              internal review.
            </p>
            <div className="rounded-lg border border-white/15 bg-black/25 p-3">
              <div className="text-xs uppercase tracking-[0.13em] text-slate-400">Application ID</div>
              <div className="mt-1 font-mono text-xs text-slate-200">{applicationId}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="vault-chip">
                Score range: {CREDIT_SCORE_LABELS[form.creditScoreRange as CreditScoreRange]}
              </Badge>
              <Badge
                className={
                  allRequiredDocsUploaded
                    ? 'bg-emerald-500/20 text-emerald-200'
                    : 'bg-amber-500/20 text-amber-200'
                }
              >
                {allRequiredDocsUploaded ? 'Complete' : `${stillMissing.length} document(s) missing`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="vault-panel rounded-3xl border-white/15 bg-black/35">
          <CardHeader>
            <CardTitle className="text-base text-white">Required Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredDocs.map((docType) => {
              const uploaded = uploadedDocs.find((d) => d.type === docType)
              return (
                <div key={docType} className="rounded-xl border border-white/15 bg-black/25 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{DOCUMENT_LABELS[docType]}</p>
                      <p className="text-xs text-slate-400">
                        {uploaded?.status === 'uploaded'
                          ? `Uploaded ${new Date(uploaded.uploadedAt).toLocaleString()}`
                          : 'Required for finance review'}
                      </p>
                    </div>
                    <Badge
                      className={
                        uploaded?.status === 'uploaded'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-amber-500/20 text-amber-200'
                      }
                    >
                      {uploaded?.status === 'uploaded' ? 'Received' : 'Missing'}
                    </Badge>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 hover:bg-white/8">
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

                  {uploaded?.status === 'uploaded' && (
                    <p className="mt-2 text-xs text-emerald-200">{uploaded.fileName}</p>
                  )}
                  {uploaded?.status === 'failed' && (
                    <p className="mt-2 text-xs text-rose-200">Upload failed: {uploaded.error}</p>
                  )}
                </div>
              )
            })}

            {uploadError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <Warning size={14} /> {uploadError}
              </div>
            )}

            {allRequiredDocsUploaded && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                All required documents are received. Your application is now ready for internal finance review.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button onClick={() => navigate('/my-next-steps')} className="vault-btn vault-tap rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                View My Next Steps
              </Button>
              <Button variant="outline" onClick={() => navigate('/shop')} className="vault-btn-muted vault-tap rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-3 pb-24 pt-6 sm:px-4 sm:pt-8">
      <div className="vault-panel-soft rounded-4xl border border-white/15 p-6 sm:p-7">
        <Button
          variant="ghost"
          size="sm"
          className="vault-btn-muted mb-4 rounded-full border border-white/15 px-4 text-xs uppercase tracking-[0.14em] text-slate-300"
          onClick={() => navigate('/finance')}
        >
          <ArrowLeft size={18} className="mr-1.5" />
          Back to Finance
        </Button>
        <div className="mb-2 flex items-center gap-3">
          <Lock size={26} className="text-primary" />
          <h1 className="text-2xl font-bold text-white">Finance Credit Application</h1>
        </div>
        <p className="text-sm text-slate-300">
          Complete the full application and upload required documents based on your selected credit score range.
        </p>
      </div>

      <StepIndicator current={step} />

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <Warning size={16} /> {submitError}
        </div>
      )}

      {step === 'identity' && (
        <Card className="vault-panel rounded-3xl border-white/15 bg-black/30">
          <CardHeader>
            <CardTitle className="text-base text-white">Identity and Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullLegalName">Full legal name *</Label>
              <Input id="fullLegalName" value={form.fullLegalName} onChange={(e) => set('fullLegalName', e.target.value)} placeholder="Jane Alexandra Smith" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 010-0101" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ssn">Social Security Number *</Label>
                <Input
                  id="ssn"
                  inputMode="numeric"
                  value={form.ssnMasked}
                  onChange={(e) => set('ssnMasked', formatSsnInput(e.target.value))}
                  placeholder="123-45-6789"
                  maxLength={11}
                />
                <p className="text-xs text-slate-400">Stored securely as tokenized reference with masked display only.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="driverLicense">Driver license number (optional at this stage)</Label>
              <Input id="driverLicense" value={form.driverLicenseNumber} onChange={(e) => set('driverLicenseNumber', e.target.value)} placeholder="S123-4567-8901" />
            </div>

            <div className="space-y-1.5">
              <Label>Interested vehicle (optional)</Label>
              <select
                value={form.unitId}
                onChange={(e) => set('unitId', e.target.value)}
                className="h-10 w-full rounded-full border border-white/20 bg-white/3 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200/40"
              >
                <option value="">No specific vehicle</option>
                {publicRecords.map((u) => (
                  <option key={u.id} value={u.id}>{u.year} {u.make} {u.model} {u.trim}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <Button disabled={!identityValid} onClick={() => setStep('residency')} className="vault-btn vault-tap gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
                Continue
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'residency' && (
        <Card className="vault-panel rounded-3xl border-white/15 bg-black/30">
          <CardHeader>
            <CardTitle className="text-base text-white">Current Residency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="addr1">Current address line 1 *</Label>
              <Input id="addr1" value={form.currentAddressLine1} onChange={(e) => set('currentAddressLine1', e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr2">Address line 2</Label>
              <Input id="addr2" value={form.currentAddressLine2} onChange={(e) => set('currentAddressLine2', e.target.value)} placeholder="Apt 2B" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label htmlFor="city">City *</Label><Input id="city" value={form.currentCity} onChange={(e) => set('currentCity', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="state">State *</Label><Input id="state" value={form.currentState} onChange={(e) => set('currentState', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="zip">ZIP *</Label><Input id="zip" value={form.currentZip} onChange={(e) => set('currentZip', e.target.value)} /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Housing status *</Label>
              <div className="flex flex-wrap gap-2">
                {HOUSING_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set('housingStatus', status)}
                    className={`vault-tap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                      form.housingStatus === status
                        ? 'border-blue-200/45 bg-blue-300/18 text-blue-100'
                        : 'border-white/15 bg-white/3 text-slate-300 hover:bg-white/8'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {form.housingStatus === 'other' && (
              <div className="space-y-1.5">
                <Label htmlFor="housingOther">Specify housing status</Label>
                <Input id="housingOther" value={form.housingStatusOther} onChange={(e) => set('housingStatusOther', e.target.value)} placeholder="Describe your housing arrangement" />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5"><Label htmlFor="housingPayment">Monthly housing payment</Label><Input id="housingPayment" type="number" min="0" value={form.monthlyHousingPayment} onChange={(e) => set('monthlyHousingPayment', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="resYears">Years at current residence *</Label><Input id="resYears" type="number" min="0" value={form.residenceYears} onChange={(e) => set('residenceYears', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="resMonths">Months at current residence *</Label><Input id="resMonths" type="number" min="0" max="11" value={form.residenceMonths} onChange={(e) => set('residenceMonths', e.target.value)} /></div>
            </div>

            {requiresPreviousResidence && (
              <div className="space-y-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-4">
                <p className="text-sm font-medium text-amber-100">Previous residence is required when current residency is under 2 years.</p>
                <div className="space-y-1.5">
                  <Label htmlFor="prevAddr1">Previous address line 1 *</Label>
                  <Input id="prevAddr1" value={form.previousResidenceAddressLine1} onChange={(e) => set('previousResidenceAddressLine1', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prevAddr2">Previous address line 2</Label>
                  <Input id="prevAddr2" value={form.previousResidenceAddressLine2} onChange={(e) => set('previousResidenceAddressLine2', e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5"><Label htmlFor="prevCity">City *</Label><Input id="prevCity" value={form.previousResidenceCity} onChange={(e) => set('previousResidenceCity', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="prevState">State *</Label><Input id="prevState" value={form.previousResidenceState} onChange={(e) => set('previousResidenceState', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="prevZip">ZIP *</Label><Input id="prevZip" value={form.previousResidenceZip} onChange={(e) => set('previousResidenceZip', e.target.value)} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5"><Label htmlFor="prevResYears">Years</Label><Input id="prevResYears" type="number" min="0" value={form.previousResidenceYears} onChange={(e) => set('previousResidenceYears', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="prevResMonths">Months</Label><Input id="prevResMonths" type="number" min="0" max="11" value={form.previousResidenceMonths} onChange={(e) => set('previousResidenceMonths', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="prevHousingPayment">Monthly payment</Label><Input id="prevHousingPayment" type="number" min="0" value={form.previousMonthlyHousingPayment} onChange={(e) => set('previousMonthlyHousingPayment', e.target.value)} /></div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('identity')} className="vault-btn-muted vault-tap rounded-full px-5 text-xs uppercase tracking-[0.14em]"><ArrowLeft size={16} className="mr-1.5" />Back</Button>
              <Button disabled={!residencyValid} onClick={() => setStep('employment')} className="vault-btn vault-tap gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">Continue<ArrowRight size={16} /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'employment' && (
        <Card className="vault-panel rounded-3xl border-white/15 bg-black/30">
          <CardHeader>
            <CardTitle className="text-base text-white">Employment and Credit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="employer">Current employer *</Label><Input id="employer" value={form.employerName} onChange={(e) => set('employerName', e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="occupation">Job title / occupation *</Label><Input id="occupation" value={form.occupationTitle} onChange={(e) => set('occupationTitle', e.target.value)} /></div>

            <div className="space-y-1.5">
              <Label>Employment status *</Label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set('employmentStatus', status)}
                    className={`vault-tap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                      form.employmentStatus === status
                        ? 'border-blue-200/45 bg-blue-300/18 text-blue-100'
                        : 'border-white/15 bg-white/3 text-slate-300 hover:bg-white/8'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {form.employmentStatus === 'other' && (
              <div className="space-y-1.5"><Label htmlFor="employmentOther">Specify employment status</Label><Input id="employmentOther" value={form.employmentStatusOther} onChange={(e) => set('employmentStatusOther', e.target.value)} /></div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="monthlyIncome">Gross monthly income</Label><Input id="monthlyIncome" type="number" min="0" value={form.grossMonthlyIncome} onChange={(e) => set('grossMonthlyIncome', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="annualIncome">Annual income</Label><Input id="annualIncome" type="number" min="0" value={form.annualIncome} onChange={(e) => set('annualIncome', e.target.value)} /></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="empYears">Years at current employer *</Label><Input id="empYears" type="number" min="0" value={form.employerYears} onChange={(e) => set('employerYears', e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="empMonths">Months at current employer *</Label><Input id="empMonths" type="number" min="0" max="11" value={form.employerMonths} onChange={(e) => set('employerMonths', e.target.value)} /></div>
            </div>

            {requiresPreviousEmployer && (
              <div className="space-y-4 rounded-xl border border-amber-300/30 bg-amber-500/10 p-4">
                <p className="text-sm font-medium text-amber-100">Previous employment is required when current employment is under 2 years.</p>
                <div className="space-y-1.5"><Label htmlFor="prevEmployer">Previous employer *</Label><Input id="prevEmployer" value={form.previousEmployerName} onChange={(e) => set('previousEmployerName', e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="prevOccupation">Previous job title</Label><Input id="prevOccupation" value={form.previousOccupationTitle} onChange={(e) => set('previousOccupationTitle', e.target.value)} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="prevEmpYears">Years</Label><Input id="prevEmpYears" type="number" min="0" value={form.previousEmployerYears} onChange={(e) => set('previousEmployerYears', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label htmlFor="prevEmpMonths">Months</Label><Input id="prevEmpMonths" type="number" min="0" max="11" value={form.previousEmployerMonths} onChange={(e) => set('previousEmployerMonths', e.target.value)} /></div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="creditScore">Credit score range *</Label>
              <select
                id="creditScore"
                value={form.creditScoreRange}
                onChange={(e) => set('creditScoreRange', e.target.value)}
                className="h-10 w-full rounded-full border border-white/20 bg-white/3 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200/40"
              >
                <option value="">Select range</option>
                {CREDIT_SCORE_OPTIONS.map((range) => (
                  <option key={range} value={range}>{CREDIT_SCORE_LABELS[range]}</option>
                ))}
              </select>
            </div>

            {form.creditScoreRange && (
              <div className="rounded-xl border border-blue-300/25 bg-blue-500/10 p-4">
                <p className="mb-2 text-sm font-medium text-blue-100">Required documents for this score range:</p>
                <ul className="space-y-1 text-sm text-slate-200">
                  {dynamicRequiredDocs.map((docType) => (
                    <li key={docType}>- {DOCUMENT_LABELS[docType]}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('residency')} className="vault-btn-muted vault-tap rounded-full px-5 text-xs uppercase tracking-[0.14em]"><ArrowLeft size={16} className="mr-1.5" />Back</Button>
              <Button disabled={!employmentValid} onClick={() => setStep('review')} className="vault-btn vault-tap gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">Review Application<ArrowRight size={16} /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'review' && (
        <Card className="vault-panel rounded-3xl border-white/15 bg-black/35">
          <CardHeader>
            <CardTitle className="text-base text-white">Review and Submit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <p className="text-slate-400">Applicant</p>
                <p className="font-medium text-white">{form.fullLegalName}</p>
                <p className="text-slate-300">{form.email}</p>
                <p className="text-slate-300">{form.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400">Sensitive data handling</p>
                <p className="font-medium text-white">SSN collected securely</p>
                <p className="text-slate-300">Only masked SSN is shown in review</p>
                <p className="font-mono text-xs text-slate-300">{normalizeAndValidateSSN(form.ssnMasked)?.masked || 'Invalid SSN'}</p>
              </div>
            </div>

            <Separator className="bg-white/15" />

            <div className="space-y-2 text-sm">
              <p className="text-slate-400">Credit score range</p>
              <p className="font-medium text-white">{form.creditScoreRange ? CREDIT_SCORE_LABELS[form.creditScoreRange as CreditScoreRange] : 'Not selected'}</p>
              <p className="text-xs text-slate-400">Required docs after submit:</p>
              <ul className="space-y-1 text-sm text-slate-200">
                {dynamicRequiredDocs.map((docType) => (
                  <li key={docType}>- {DOCUMENT_LABELS[docType]}</li>
                ))}
              </ul>
            </div>

            {selectedUnit && (
              <>
                <Separator className="bg-white/15" />
                <div className="space-y-1 text-sm">
                  <p className="text-slate-400">Interested vehicle</p>
                  <p className="font-medium text-white">{selectedUnit.year} {selectedUnit.make} {selectedUnit.model} {selectedUnit.trim}</p>
                </div>
              </>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-slate-400">
              <Lock size={14} className="mt-0.5 shrink-0" />
              <span>
                SSN is tokenized at submission. We do not store plaintext SSN in browser storage, and internal views only display masked SSN.
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('employment')} className="vault-btn-muted vault-tap rounded-full px-5 text-xs uppercase tracking-[0.14em]"><ArrowLeft size={16} className="mr-1.5" />Back</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="vault-btn vault-tap gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
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
