import { useState } from 'react'
import { useRouter } from '@/app/router'
import { submitTradeIn } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Car,
  Scales,
  Info,
} from '@phosphor-icons/react'

type Condition = 'excellent' | 'good' | 'fair' | 'poor'

const CONDITIONS: { value: Condition; label: string; description: string }[] = [
  { value: 'excellent', label: 'Excellent', description: 'Like new, no damage, full service history' },
  { value: 'good', label: 'Good', description: 'Minor wear, no major damage, well maintained' },
  { value: 'fair', label: 'Fair', description: 'Noticeable wear, some repairs may be needed' },
  { value: 'poor', label: 'Poor', description: 'Significant damage, mechanical issues present' },
]

export function TradeInPage() {
  const { navigate } = useRouter()
  const { addItem } = useCustomerProgress()

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    mileage: '',
    vin: '',
    condition: 'good' as Condition,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  })

  const set = (field: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))

  const canSubmit =
    form.year.trim() &&
    !isNaN(Number(form.year)) &&
    form.make.trim() &&
    form.model.trim() &&
    form.mileage.trim() &&
    !isNaN(Number(form.mileage)) &&
    form.ownerName.trim() &&
    form.ownerEmail.trim()

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const result = await submitTradeIn({
        year: Number(form.year),
        make: form.make,
        model: form.model,
        trim: form.trim || undefined,
        mileage: Number(form.mileage),
        condition: form.condition,
        vin: form.vin || undefined,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPhone: form.ownerPhone || undefined,
      })

      if (result.ok) {
        addItem({
          type: 'trade_in',
          status: 'trade_info_received',
          title: `Trade-In: ${form.year} ${form.make} ${form.model}`,
          description: `Trade-in submitted. Mileage: ${Number(form.mileage).toLocaleString()} mi. Condition: ${form.condition}.`,
          nextAction: 'Our appraisal team will review your vehicle information and contact you with a value estimate.',
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
        <h1 className="text-2xl font-bold">Trade-In Submitted!</h1>
        <p className="mt-3 text-muted-foreground">
          We received information on your{' '}
          <strong>{form.year} {form.make} {form.model}</strong>. Our appraisal team will
          review the details and contact you at <strong>{form.ownerEmail}</strong> with a
          preliminary value estimate.
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
          onClick={() => navigate('/shop')}
        >
          <ArrowLeft size={18} className="mr-1.5" />
          Back to Inventory
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Scales size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">Value Your Trade-In</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Tell us about your current vehicle and we'll provide a preliminary appraisal estimate.
        </p>
      </div>

      <div className="space-y-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car size={18} />
              Your Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2019"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => set('year', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mileage">Mileage *</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="45000"
                  min="0"
                  value={form.mileage}
                  onChange={(e) => set('mileage', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  placeholder="Toyota"
                  value={form.make}
                  onChange={(e) => set('make', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="Camry"
                  value={form.model}
                  onChange={(e) => set('model', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="trim">Trim (optional)</Label>
                <Input
                  id="trim"
                  placeholder="SE"
                  value={form.trim}
                  onChange={(e) => set('trim', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vin">VIN (optional)</Label>
                <Input
                  id="vin"
                  placeholder="1HGBH41JXMN109186"
                  maxLength={17}
                  value={form.vin}
                  onChange={(e) => set('vin', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicle Condition *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('condition', c.value)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  form.condition === c.value
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{c.label}</span>
                  {form.condition === c.value && (
                    <CheckCircle size={18} weight="fill" className="text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Full Name *</Label>
              <Input
                id="ownerName"
                placeholder="Jane Smith"
                value={form.ownerName}
                onChange={(e) => set('ownerName', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerEmail">Email Address *</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="jane@example.com"
                value={form.ownerEmail}
                onChange={(e) => set('ownerEmail', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerPhone">Phone (optional)</Label>
              <Input
                id="ownerPhone"
                type="tel"
                placeholder="(555) 000-0000"
                value={form.ownerPhone}
                onChange={(e) => set('ownerPhone', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            This is a preliminary value request. A final appraisal requires a physical inspection
            of the vehicle. Values are based on current market conditions.
          </span>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="gap-1.5"
            size="lg"
          >
            {submitting ? 'Submitting…' : 'Submit Trade-In'}
            {!submitting && <ArrowRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
