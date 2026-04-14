import { useState } from 'react'
import { useRouter } from '@/app/router'
import { submitQuickApp } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/buyerHub.mock'
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
  Car,
  ShieldCheck,
  Lock,
} from '@phosphor-icons/react'

type Step = 'personal' | 'employment' | 'review'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  employerName: string
  annualIncome: string
  employmentType: string
  unitId: string
}

const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Self-Employed', 'Retired', 'Other']

const STEPS: { id: Step; label: string; icon: typeof User }[] = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'review', label: 'Review & Submit', icon: CheckCircle },
]

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="flex items-center justify-center gap-0">
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'border-primary bg-background text-primary'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground/40'
                }`}
              >
                {isDone ? <CheckCircle size={20} weight="fill" /> : <Icon size={18} />}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mb-5 h-0.5 w-16 transition-colors ${
                  idx < currentIdx ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
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

  const [step, setStep] = useState<Step>('personal')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    employerName: '',
    annualIncome: '',
    employmentType: 'Full-Time',
    unitId: '',
  })

  const set = (field: keyof FormData, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))

  const selectedUnit = BUYER_HUB_INVENTORY.find((u) => u.id === form.unitId)

  const canAdvancePersonal =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.dateOfBirth.trim()

  const canAdvanceEmployment =
    form.annualIncome.trim() && !isNaN(Number(form.annualIncome))

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const result = await submitQuickApp({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        annualIncome: Number(form.annualIncome),
        employerName: form.employerName || undefined,
        unitId: form.unitId || undefined,
      })

      if (result.ok) {
        addItem({
          type: 'application',
          status: 'application_submitted',
          title: 'Credit Application',
          description: `Pre-qualification application submitted for ${form.firstName} ${form.lastName}.`,
          nextAction: 'Our finance team will review your application and contact you shortly.',
          linkedUnitId: form.unitId || undefined,
        })
        setDone(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle size={48} weight="fill" className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold">Application Submitted!</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you, <strong>{form.firstName}</strong>. Our finance team will review your
          application and reach out to you at <strong>{form.email}</strong> within one business day.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate('/my-next-steps')} className="gap-1.5">
            View My Next Steps
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/finance')}
        >
          <ArrowLeft size={18} className="mr-1.5" />
          Back to Finance
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">Quick Credit Application</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Takes about 2 minutes. No impact to your credit score to check pre-qualification.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <StepIndicator current={step} />
      </div>

      {/* Step: Personal */}
      {step === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User size={18} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                disabled={!canAdvancePersonal}
                onClick={() => setStep('employment')}
                className="gap-1.5"
              >
                Continue
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Employment */}
      {step === 'employment' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase size={18} />
              Employment &amp; Income
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employment Type *</Label>
              <div className="flex flex-wrap gap-2">
                {EMPLOYMENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('employmentType', t)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      form.employmentType === t
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background hover:bg-accent'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employer">Employer Name</Label>
              <Input
                id="employer"
                placeholder="Acme Corp"
                value={form.employerName}
                onChange={(e) => set('employerName', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="income">Annual Gross Income *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="income"
                  type="number"
                  min="0"
                  placeholder="60000"
                  className="pl-7"
                  value={form.annualIncome}
                  onChange={(e) => set('annualIncome', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Interested Vehicle (optional)</Label>
              <select
                value={form.unitId}
                onChange={(e) => set('unitId', e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">No specific vehicle</option>
                {BUYER_HUB_INVENTORY.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.year} {u.make} {u.model} {u.trim}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('personal')}>
                <ArrowLeft size={16} className="mr-1.5" />
                Back
              </Button>
              <Button
                disabled={!canAdvanceEmployment}
                onClick={() => setStep('review')}
                className="gap-1.5"
              >
                Review Application
                <ArrowRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle size={18} />
              Review &amp; Submit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Personal
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{form.firstName} {form.lastName}</span>
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{form.email}</span>
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{form.phone}</span>
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium">{form.dateOfBirth}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Employment
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{form.employmentType}</span>
                {form.employerName && (
                  <>
                    <span className="text-muted-foreground">Employer</span>
                    <span className="font-medium">{form.employerName}</span>
                  </>
                )}
                <span className="text-muted-foreground">Annual Income</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  }).format(Number(form.annualIncome))}
                </span>
              </div>
            </div>

            {selectedUnit && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Interested Vehicle
                  </div>
                  <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                    <Car size={24} className="text-muted-foreground" />
                    <div>
                      <div className="text-sm font-semibold">
                        {selectedUnit.year} {selectedUnit.make} {selectedUnit.model} {selectedUnit.trim}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(selectedUnit.askingPrice)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">{selectedUnit.bodyStyle}</Badge>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <Lock size={14} className="mt-0.5 shrink-0" />
              <span>
                Your information is encrypted and used only to provide financing options. This is
                a soft inquiry and does not affect your credit score.
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('employment')}>
                <ArrowLeft size={16} className="mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
                {submitting ? 'Submitting…' : 'Submit Application'}
                {!submitting && <CheckCircle size={16} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
