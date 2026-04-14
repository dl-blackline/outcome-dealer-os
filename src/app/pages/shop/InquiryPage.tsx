import { useState, useMemo } from 'react'
import { useRouter } from '@/app/router'
import { submitInquiry } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/buyerHub.mock'
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

  const unitId = params.unitId
  const vehicle = useMemo(
    () => (unitId ? BUYER_HUB_INVENTORY.find((u) => u.id === unitId) : undefined),
    [unitId]
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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle size={48} weight="fill" className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold">Inquiry Sent!</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks, <strong>{form.firstName}</strong>! A member of our team will reach out to you
          at <strong>{form.email}</strong> shortly.
        </p>
        {vehicle && (
          <p className="mt-2 text-sm text-muted-foreground">
            Vehicle: {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </p>
        )}
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
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => vehicle ? navigate(`/shop/${vehicle.id}`) : navigate('/shop')}
        >
          <ArrowLeft size={18} className="mr-1.5" />
          {vehicle ? 'Back to Vehicle' : 'Back to Inventory'}
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <ChatCircle size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">Inquire About This Vehicle</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Fill in your details and we'll connect you with an advisor right away.
        </p>
      </div>

      <div className="space-y-5">
        {/* Vehicle context card */}
        {vehicle && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <Car size={24} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(vehicle.askingPrice)}
                {' · '}
                {new Intl.NumberFormat('en-US').format(vehicle.mileage)} mi
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">{vehicle.bodyStyle}</Badge>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Information</CardTitle>
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
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Contact Method</Label>
              <div className="flex flex-wrap gap-2">
                {CONTACT_METHODS.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => set('preferredContact', method.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      form.preferredContact === method.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background hover:bg-accent'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Any questions about this vehicle? Let us know…"
                rows={3}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <Lock size={14} className="mt-0.5 shrink-0" />
          <span>
            Your information is never shared with third parties. We use it solely to respond
            to your inquiry.
          </span>
        </div>

        <div className="flex justify-end">
          <Button
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            size="lg"
            className="gap-1.5"
          >
            {submitting ? 'Sending…' : 'Send Inquiry'}
            {!submitting && <ArrowRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
