import { useState } from 'react'
import { useRouter } from '@/app/router'
import { submitAppointmentRequest } from '@/domains/buyer-hub/buyerHub.eventBridge'
import { useCustomerProgress } from '@/domains/buyer-hub/useCustomerProgress'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/buyerHub.mock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CalendarPlus,
  Car,
  Clock,
  Info,
} from '@phosphor-icons/react'

type AppointmentType = 'test_drive' | 'consultation' | 'delivery'
type TimePreference = 'morning' | 'afternoon' | 'evening'

const APPOINTMENT_TYPES: { value: AppointmentType; label: string; description: string }[] = [
  { value: 'test_drive', label: 'Test Drive', description: 'Take a vehicle out on the road' },
  { value: 'consultation', label: 'Consultation', description: 'Talk to a sales advisor — no pressure' },
  { value: 'delivery', label: 'Vehicle Delivery', description: 'Pick up your purchased vehicle' },
]

const TIME_PREFERENCES: { value: TimePreference; label: string; hours: string }[] = [
  { value: 'morning', label: 'Morning', hours: '8am – 12pm' },
  { value: 'afternoon', label: 'Afternoon', hours: '12pm – 5pm' },
  { value: 'evening', label: 'Evening', hours: '5pm – 7pm' },
]

export function SchedulePage() {
  const { navigate } = useRouter()
  const { addItem } = useCustomerProgress()

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    type: 'test_drive' as AppointmentType,
    preferredDate: '',
    preferredTime: 'morning' as TimePreference,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    unitId: '',
    notes: '',
  })

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) =>
    setForm((p) => ({ ...p, [field]: value }))

  const canSubmit =
    form.preferredDate.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim()

  const selectedUnit = BUYER_HUB_INVENTORY.find((u) => u.id === form.unitId)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const result = await submitAppointmentRequest({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        type: form.type,
        unitId: form.unitId || undefined,
        notes: form.notes || undefined,
      })

      if (result.ok) {
        const typeLabel = APPOINTMENT_TYPES.find((t) => t.value === form.type)?.label ?? 'Appointment'
        addItem({
          type: 'appointment',
          status: 'appointment_scheduled',
          title: `${typeLabel} Request`,
          description: `Appointment requested for ${form.preferredDate} (${form.preferredTime}).${selectedUnit ? ` Vehicle: ${selectedUnit.year} ${selectedUnit.make} ${selectedUnit.model}.` : ''}`,
          nextAction: 'We will confirm your appointment within one business day.',
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
        <h1 className="text-2xl font-bold">Request Received!</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks, <strong>{form.firstName}</strong>! We'll confirm your{' '}
          {APPOINTMENT_TYPES.find((t) => t.value === form.type)?.label.toLowerCase()} appointment
          at <strong>{form.email}</strong> within one business day.
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
          <CalendarPlus size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">Schedule an Appointment</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Pick a date and time that works for you. We'll confirm within one business day.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appointment Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What brings you in?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {APPOINTMENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('type', t.value)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  form.type === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{t.label}</span>
                  {form.type === t.value && (
                    <CheckCircle size={18} weight="fill" className="text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={18} />
              Date &amp; Time Preference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Preferred Date *</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.preferredDate}
                onChange={(e) => set('preferredDate', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred Time</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_PREFERENCES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('preferredTime', t.value)}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      form.preferredTime === t.value
                        ? 'border-primary bg-primary/5'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.hours}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle (optional) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car size={18} />
              Interested Vehicle (optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={form.unitId}
              onChange={(e) => set('unitId', e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">No specific vehicle / I'll decide when I visit</option>
              {BUYER_HUB_INVENTORY.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.year} {u.make} {u.model} {u.trim}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
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
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Anything we should know before your visit…"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span>
            Appointment requests are not confirmed until you receive a confirmation from our team.
            We'll reach out within one business day.
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
            {submitting ? 'Submitting…' : 'Request Appointment'}
            {!submitting && <ArrowRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
