import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/app/router'
import { useRouteParam, hasRouteParam } from '@/app/router/routeParams'
import { PageLoadingState } from '@/components/core/PageStates'
import { useLead, useLeadMutations } from '@/domains/leads/lead.hooks'
import { ArrowLeft, FloppyDisk, SpinnerGap } from '@phosphor-icons/react'

const SOURCES = ['manual', 'website', 'referral', 'walk-in', 'phone', 'email', 'social', 'event', 'partner', 'other']
const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
]
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

interface LeadFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  source: string
  status: string
  assignedTo: string
  notes: string
  interestedVehicle: string
  score: string
}

const EMPTY: LeadFormValues = {
  firstName: '', lastName: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '',
  source: 'manual', status: 'new', assignedTo: '',
  notes: '', interestedVehicle: '', score: '50',
}

export function LeadFormPage() {
  const { navigate } = useRouter()
  const leadId = useRouteParam('id')
  const isEdit = hasRouteParam(leadId) && leadId !== 'new'

  const leadQuery = useLead(isEdit ? leadId : '')
  const mutations = useLeadMutations()

  const [form, setForm] = useState<LeadFormValues>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formReady, setFormReady] = useState(!isEdit)

  // Pre-populate form when editing
  useEffect(() => {
    if (isEdit && !leadQuery.loading && leadQuery.data) {
      const l = leadQuery.data
      setForm({
        firstName: l.firstName || '',
        lastName: l.lastName || '',
        email: l.email,
        phone: l.phone,
        address: l.address || '',
        city: l.city || '',
        state: l.state || '',
        zip: l.zip || '',
        source: l.source,
        status: l.status,
        assignedTo: l.assignedTo || '',
        notes: l.notes || '',
        interestedVehicle: l.interestedVehicle || '',
        score: String(l.score),
      })
      setFormReady(true)
    } else if (isEdit && !leadQuery.loading && !leadQuery.data) {
      setFormReady(true)
    }
  }, [isEdit, leadQuery.loading, leadQuery.data])

  const set = (field: keyof LeadFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email.trim() && !form.firstName.trim() && !form.lastName.trim()) {
      setError('Please provide at least a name or email address.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state || undefined,
      zip: form.zip.trim() || undefined,
      source: form.source,
      status: form.status as 'new' | 'contacted' | 'qualified' | 'converted',
      assignedTo: form.assignedTo.trim() || undefined,
      notes: form.notes.trim() || undefined,
      interestedVehicle: form.interestedVehicle.trim() || undefined,
      score: Number(form.score) || 50,
    }

    try {
      if (isEdit) {
        const updated = await mutations.updateLead(leadId, payload)
        if (updated) {
          navigate(`/app/records/leads/${leadId}`)
        } else {
          setError('Failed to update lead. Please try again.')
        }
      } else {
        const created = await mutations.createLead(payload)
        if (created) {
          navigate(`/app/records/leads/${created.id}`)
        } else {
          setError('Failed to create lead. Please try again.')
        }
      }
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && leadQuery.loading) {
    return <PageLoadingState title="Loading Lead" message="Retrieving lead details…" />
  }

  if (isEdit && !leadQuery.loading && !leadQuery.data && formReady) {
    return (
      <div className="ods-page ods-flow-lg">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/leads')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Leads
        </Button>
        <p className="text-muted-foreground">Lead not found.</p>
      </div>
    )
  }

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate(isEdit ? `/app/records/leads/${leadId}` : '/app/records/leads')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> {isEdit ? 'Back to Lead' : 'Leads'}
      </Button>

      <SectionHeader
        title={isEdit ? 'Edit Lead' : 'New Lead'}
        description={isEdit ? `Editing lead record` : 'Manually create a new sales lead'}
      />

      {!formReady ? (
        <PageLoadingState title="Loading" message="Preparing form…" />
      ) : (
        <form onSubmit={handleSubmit} className="ods-flow-lg">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Information</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={form.firstName} onChange={set('firstName')} placeholder="First name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={form.lastName} onChange={set('lastName')} placeholder="Last name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email <span className="text-muted-foreground text-xs">(required if no name)</span></Label>
                    <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Address</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" value={form.address} onChange={set('address')} placeholder="123 Main St" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={set('city')} placeholder="City" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State</Label>
                      <select
                        id="state"
                        value={form.state}
                        onChange={set('state')}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                      >
                        <option value="">—</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={form.zip} onChange={set('zip')} placeholder="ZIP" maxLength={10} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Lead Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="source">Lead Source</Label>
                    <select
                      id="source"
                      value={form.source}
                      onChange={set('source')}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    >
                      {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={set('status')}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                    >
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="assignedTo">Assigned Rep</Label>
                    <Input id="assignedTo" value={form.assignedTo} onChange={set('assignedTo')} placeholder="Rep name or ID" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="score">Lead Score (0–100)</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={form.score}
                      onChange={set('score')}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="interestedVehicle">Vehicle of Interest</Label>
                    <Input id="interestedVehicle" value={form.interestedVehicle} onChange={set('interestedVehicle')} placeholder="e.g. 2024 Ford F-150" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={set('notes')}
                      rows={3}
                      placeholder="Any additional notes…"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit ? `/app/records/leads/${leadId}` : '/app/records/leads')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <FloppyDisk className="h-4 w-4" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
