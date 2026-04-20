import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/app/router'
import { useFinanceApplicationMutations } from '@/domains/credit/financeApplication.hooks'
import { CREDIT_SCORE_RANGES } from '@/domains/credit/financeApplication.types'
import { CREDIT_SCORE_LABELS } from '@/domains/credit/financeApplication.rules'
import { ArrowLeft, FloppyDisk, SpinnerGap } from '@phosphor-icons/react'

const HOUSING_OPTIONS = [
  { value: 'own', label: 'Own' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'rent', label: 'Rent' },
  { value: 'family', label: 'Living with Family' },
  { value: 'other', label: 'Other' },
]

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

interface CreditAppFormValues {
  // Applicant
  fullLegalName: string
  dateOfBirth: string
  phone: string
  email: string
  driverLicense: string
  ssn: string
  creditScoreRange: string
  // Residence
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
  housingStatus: string
  monthlyHousingPayment: string
  residenceYears: string
  residenceMonths: string
  // Employment
  employerName: string
  occupationTitle: string
  employmentStatus: string
  grossMonthlyIncome: string
  employmentYears: string
  employmentMonths: string
  // App type
  applicationType: 'individual' | 'joint'
}

const EMPTY: CreditAppFormValues = {
  fullLegalName: '', dateOfBirth: '', phone: '', email: '',
  driverLicense: '', ssn: '', creditScoreRange: '650_699',
  addressLine1: '', addressLine2: '', city: '', state: '', zip: '',
  housingStatus: 'rent', monthlyHousingPayment: '',
  residenceYears: '2', residenceMonths: '0',
  employerName: '', occupationTitle: '', employmentStatus: 'full_time',
  grossMonthlyIncome: '', employmentYears: '2', employmentMonths: '0',
  applicationType: 'individual',
}

export function CreditAppFormPage() {
  const { navigate } = useRouter()
  const { createInternalApplication } = useFinanceApplicationMutations()

  const [form, setForm] = useState<CreditAppFormValues>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const set = (field: keyof CreditAppFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!form.fullLegalName.trim()) errs.push('Full legal name is required')
    if (!form.phone.trim()) errs.push('Phone is required')
    if (!form.email.trim()) errs.push('Email is required')
    if (!form.ssn.replace(/\D/g, '').trim()) errs.push('SSN is required')
    if (!form.addressLine1.trim()) errs.push('Address is required')
    if (!form.city.trim()) errs.push('City is required')
    if (!form.state) errs.push('State is required')
    if (!form.zip.trim()) errs.push('ZIP is required')
    if (!form.employerName.trim()) errs.push('Employer name is required')
    if (!form.occupationTitle.trim()) errs.push('Job title is required')

    if (errs.length > 0) {
      setErrors(errs)
      return
    }

    setErrors([])
    setSaving(true)

    const resYears = parseInt(form.residenceYears) || 0
    const resMonths = parseInt(form.residenceMonths) || 0
    const empYears = parseInt(form.employmentYears) || 0
    const empMonths = parseInt(form.employmentMonths) || 0

    try {
      const result = await createInternalApplication({
        applicationType: form.applicationType,
        primaryApplicant: {
          identity: {
            fullLegalName: form.fullLegalName.trim(),
            dateOfBirth: form.dateOfBirth || undefined,
            phone: form.phone.trim(),
            email: form.email.trim(),
            driverLicenseNumber: form.driverLicense.trim() || undefined,
            ssnRaw: form.ssn.replace(/\D/g, ''),
          },
          creditScoreRange: form.creditScoreRange as typeof CREDIT_SCORE_RANGES[number],
          currentResidence: {
            addressLine1: form.addressLine1.trim(),
            addressLine2: form.addressLine2.trim() || undefined,
            city: form.city.trim(),
            state: form.state,
            zip: form.zip.trim(),
            housingStatus: form.housingStatus as 'own' | 'mortgage' | 'rent' | 'family' | 'other',
            monthlyHousingPayment: form.monthlyHousingPayment ? parseFloat(form.monthlyHousingPayment) : undefined,
            timeAtResidence: { years: resYears, months: resMonths },
          },
          currentEmployment: {
            employerName: form.employerName.trim(),
            occupationTitle: form.occupationTitle.trim(),
            employmentStatus: form.employmentStatus as 'full_time' | 'part_time' | 'self_employed' | 'retired' | 'unemployed' | 'other',
            grossMonthlyIncome: form.grossMonthlyIncome ? parseFloat(form.grossMonthlyIncome) : undefined,
            timeAtEmployer: { years: empYears, months: empMonths },
          },
        },
      })

      if (result.ok) {
        navigate(`/app/records/credit-applications/${result.value.id}`)
      } else {
        setErrors([result.error.message])
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/credit-applications')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Credit Applications
      </Button>

      <SectionHeader
        title="New Credit Application"
        description="Manually enter a credit application for staff processing"
      />

      <form onSubmit={handleSubmit} className="ods-flow-lg">
        {/* App type */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Application Type</p>
            <div className="flex gap-4">
              {(['individual', 'joint'] as const).map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="applicationType"
                    value={t}
                    checked={form.applicationType === t}
                    onChange={() => setForm(prev => ({ ...prev, applicationType: t }))}
                    className="accent-primary"
                  />
                  <span className="text-sm capitalize">{t}</span>
                </label>
              ))}
            </div>
            {form.applicationType === 'joint' && (
              <p className="mt-2 text-xs text-muted-foreground">
                Joint application: after creating, use the buyer portal or a follow-up form to capture co-applicant details.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Identity */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Applicant Identity</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullLegalName">Full Legal Name <span className="text-destructive">*</span></Label>
                <Input id="fullLegalName" value={form.fullLegalName} onChange={set('fullLegalName')} placeholder="As shown on ID" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ssn">SSN <span className="text-destructive">*</span></Label>
                <Input id="ssn" type="password" value={form.ssn} onChange={set('ssn')} placeholder="9 digits" maxLength={11} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driverLicense">Driver License #</Label>
                <Input id="driverLicense" value={form.driverLicense} onChange={set('driverLicense')} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="creditScore">Credit Score Range <span className="text-destructive">*</span></Label>
                <select
                  id="creditScore"
                  value={form.creditScoreRange}
                  onChange={set('creditScoreRange')}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {CREDIT_SCORE_RANGES.map(r => (
                    <option key={r} value={r}>{CREDIT_SCORE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residence */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Current Residence</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="addr1">Street Address <span className="text-destructive">*</span></Label>
                <Input id="addr1" value={form.addressLine1} onChange={set('addressLine1')} placeholder="123 Main St" required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="addr2">Apt / Suite</Label>
                <Input id="addr2" value={form.addressLine2} onChange={set('addressLine2')} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reCity">City <span className="text-destructive">*</span></Label>
                <Input id="reCity" value={form.city} onChange={set('city')} placeholder="City" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reState">State <span className="text-destructive">*</span></Label>
                  <select
                    id="reState"
                    value={form.state}
                    onChange={set('state')}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    required
                  >
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reZip">ZIP <span className="text-destructive">*</span></Label>
                  <Input id="reZip" value={form.zip} onChange={set('zip')} placeholder="ZIP" maxLength={10} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="housingStatus">Housing Status</Label>
                <select
                  id="housingStatus"
                  value={form.housingStatus}
                  onChange={set('housingStatus')}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {HOUSING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monthlyHousing">Monthly Housing Payment ($)</Label>
                <Input id="monthlyHousing" type="number" min="0" step="0.01" value={form.monthlyHousingPayment} onChange={set('monthlyHousingPayment')} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Time at Residence</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min="0" max="50" value={form.residenceYears} onChange={set('residenceYears')} className="w-20" />
                  <span className="text-sm text-muted-foreground">yr</span>
                  <Input type="number" min="0" max="11" value={form.residenceMonths} onChange={set('residenceMonths')} className="w-20" />
                  <span className="text-sm text-muted-foreground">mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Current Employment</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="employerName">Employer Name <span className="text-destructive">*</span></Label>
                <Input id="employerName" value={form.employerName} onChange={set('employerName')} placeholder="Company name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job Title <span className="text-destructive">*</span></Label>
                <Input id="jobTitle" value={form.occupationTitle} onChange={set('occupationTitle')} placeholder="Job title" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="empStatus">Employment Status</Label>
                <select
                  id="empStatus"
                  value={form.employmentStatus}
                  onChange={set('employmentStatus')}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {EMPLOYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grossIncome">Gross Monthly Income ($)</Label>
                <Input id="grossIncome" type="number" min="0" step="0.01" value={form.grossMonthlyIncome} onChange={set('grossMonthlyIncome')} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Time at Employer</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min="0" max="50" value={form.employmentYears} onChange={set('employmentYears')} className="w-20" />
                  <span className="text-sm text-muted-foreground">yr</span>
                  <Input type="number" min="0" max="11" value={form.employmentMonths} onChange={set('employmentMonths')} className="w-20" />
                  <span className="text-sm text-muted-foreground">mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {errors.length > 0 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3 space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-destructive">• {err}</p>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/records/credit-applications')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <FloppyDisk className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Create Application'}
          </Button>
        </div>
      </form>
    </div>
  )
}
