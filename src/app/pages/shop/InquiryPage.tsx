import { useState, useMemo } from 'react'
import { useRouter } from '@/app/router'
import { submitInquiry } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChatCircle,
  Car,
  Lock,
} from '@phosphor-icons/react'

type ContactMethod = 'email' | 'phone' | 'sms'

const CONTACT_METHODS: { value: ContactMethod; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'sms', label: 'Text / SMS' },
]

export function InquiryPage() {
  const { params, navigate } = useRouter()
  const { addItem } = useCustomerProgress()
  const { publicRecords } = useInventoryCatalog()

  const unitId = params.unitId
  const vehicle = useMemo(
    () => (unitId ? publicRecords.find((u) => u.id === unitId) : undefined),
    [publicRecords, unitId]
  )

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: 'email' as ContactMethod,
  })

  const set = (field: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))

  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.email.trim()

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const result = await submitInquiry({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        unitId: unitId,
        message: form.message || undefined,
        preferredContact: form.preferredContact,
      })

      if (result.ok) {
        addItem({
          type: 'inquiry',
          status: 'inquiry_received',
          title: vehicle
            ? `Inquiry: ${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : 'General Inquiry',
          description: `Inquiry submitted by ${form.firstName} ${form.lastName}. Preferred contact: ${form.preferredContact}.`,
          nextAction: 'A team member will reach out to you shortly.',
          linkedUnitId: unitId,
        })
        setDone(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-200">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500/15">
          <CheckCircle size={48} weight="fill" className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-white">Inquiry Sent!</h1>
        <p className="mt-3 text-slate-300">
          Thanks, <strong>{form.firstName}</strong>! A member of our team will reach out to you
          at <strong>{form.email}</strong> shortly.
        </p>
        {vehicle && (
          <p className="mt-2 text-sm text-slate-400">
            Vehicle: {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate('/my-next-steps')} className="vault-btn vault-tap gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
            View My Next Steps
            <ArrowRight size={16} />
          </Button>
          <Button variant="outline" onClick={() => navigate('/shop')} className="vault-btn-muted vault-tap rounded-full px-6 text-xs uppercase tracking-[0.14em]">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-2 py-4 sm:px-3">
      <div className="vault-panel-soft mb-8 rounded-4xl border border-white/15 p-6 sm:p-7">
        <Button
          variant="ghost"
          size="sm"
          className="vault-btn-muted mb-4 rounded-full border border-white/15 px-4 text-xs uppercase tracking-[0.14em] text-slate-300"
          onClick={() => vehicle ? navigate(`/shop/${vehicle.id}`) : navigate('/shop')}
        >
          <ArrowLeft size={18} className="mr-1.5" />
          {vehicle ? 'Back to Vehicle' : 'Back to Inventory'}
        </Button>
        <div className="mb-2 flex items-center gap-3">
          <ChatCircle size={28} className="text-primary" />
          <h1 className="text-2xl font-bold text-white">Connect with a Specialist</h1>
        </div>
        <p className="text-sm text-slate-300">
          Get personalized guidance, special pricing, and availability updates within 4 business hours.
        </p>
      </div>

      <div className="space-y-5">
        {vehicle && (
          <div className="vault-panel-soft flex items-center gap-3 rounded-2xl border border-white/15 bg-black/25 p-4">
            <Car size={24} className="shrink-0 text-slate-300" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </div>
              <div className="text-xs text-slate-400">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(vehicle.price)}
                {' · '}
                {new Intl.NumberFormat('en-US').format(vehicle.mileage)} mi
              </div>
            </div>
            <Badge className="vault-chip shrink-0">{vehicle.bodyStyle}</Badge>
          </div>
        )}

        <Card className="vault-panel rounded-3xl border-white/15 bg-black/30">
          <CardHeader>
            <CardTitle className="text-base text-white">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="Jane" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Smith" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Contact Method</Label>
              <div className="flex flex-wrap gap-2">
                {CONTACT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => set('preferredContact', method.value)}
                    className={`vault-tap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                      form.preferredContact === method.value
                        ? 'border-blue-200/45 bg-blue-300/18 text-blue-100'
                        : 'border-white/15 bg-white/3 text-slate-300 hover:bg-white/8'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea id="message" placeholder="Any questions about this vehicle? Let us know…" rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-slate-400">
          <Lock size={14} className="mt-0.5 shrink-0" />
          <span>
            Your information is never shared with third parties. We use it solely to respond
            to your inquiry.
          </span>
        </div>

        <div className="flex justify-end">
          <Button disabled={!canSubmit || submitting} onClick={handleSubmit} size="lg" className="vault-btn vault-tap gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.14em]">
            {submitting ? 'Sending…' : 'Send Inquiry'}
            {!submitting && <ArrowRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
