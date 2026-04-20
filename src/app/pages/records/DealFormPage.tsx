import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/app/router'
import { useRouteParam, hasRouteParam } from '@/app/router/routeParams'
import { PageLoadingState } from '@/components/core/PageStates'
import { useDeal, useDealMutations } from '@/domains/deals/deal.hooks'
import { ArrowLeft, FloppyDisk, SpinnerGap } from '@phosphor-icons/react'

const STATUSES: Array<{ value: string; label: string }> = [
  { value: 'structured', label: 'Structured' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'signed', label: 'Signed' },
  { value: 'funded', label: 'Funded' },
]

interface DealFormValues {
  customerName: string
  coBuyer: string
  vehicleDescription: string
  stockNumber: string
  vin: string
  status: string
  amount: string
  saleDate: string
  salesperson: string
  fiManager: string
  downPayment: string
  tradeAmount: string
  payoff: string
  lender: string
  amountFinanced: string
  notes: string
}

const EMPTY: DealFormValues = {
  customerName: '', coBuyer: '', vehicleDescription: '',
  stockNumber: '', vin: '', status: 'structured',
  amount: '', saleDate: '', salesperson: '', fiManager: '',
  downPayment: '', tradeAmount: '', payoff: '',
  lender: '', amountFinanced: '', notes: '',
}

function toNum(v: string): number | undefined {
  const n = parseFloat(v.replace(/,/g, ''))
  return isNaN(n) ? undefined : n
}

export function DealFormPage() {
  const { navigate } = useRouter()
  const dealId = useRouteParam('id')
  const isEdit = hasRouteParam(dealId) && dealId !== 'new'

  const dealQuery = useDeal(isEdit ? dealId : '')
  const mutations = useDealMutations()

  const [form, setForm] = useState<DealFormValues>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formReady, setFormReady] = useState(!isEdit)

  useEffect(() => {
    if (isEdit && !dealQuery.loading && dealQuery.data) {
      const d = dealQuery.data
      setForm({
        customerName: d.customerName,
        coBuyer: d.coBuyer || '',
        vehicleDescription: d.vehicleDescription,
        stockNumber: d.stockNumber || '',
        vin: d.vin || '',
        status: d.status,
        amount: d.amount > 0 ? String(d.amount) : '',
        saleDate: d.saleDate || '',
        salesperson: d.salesperson || '',
        fiManager: d.fiManager || '',
        downPayment: d.downPayment != null ? String(d.downPayment) : '',
        tradeAmount: d.tradeAmount != null ? String(d.tradeAmount) : '',
        payoff: d.payoff != null ? String(d.payoff) : '',
        lender: d.lender || '',
        amountFinanced: d.amountFinanced != null ? String(d.amountFinanced) : '',
        notes: d.notes || '',
      })
      setFormReady(true)
    } else if (isEdit && !dealQuery.loading && !dealQuery.data) {
      setFormReady(true)
    }
  }, [isEdit, dealQuery.loading, dealQuery.data])

  const set = (field: keyof DealFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName.trim()) {
      setError('Customer name is required.')
      return
    }
    if (!form.vehicleDescription.trim()) {
      setError('Vehicle description is required.')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      customerName: form.customerName.trim(),
      coBuyer: form.coBuyer.trim() || undefined,
      vehicleDescription: form.vehicleDescription.trim(),
      stockNumber: form.stockNumber.trim() || undefined,
      vin: form.vin.trim() || undefined,
      status: form.status as 'structured' | 'quoted' | 'signed' | 'funded',
      amount: toNum(form.amount) ?? 0,
      saleDate: form.saleDate || undefined,
      salesperson: form.salesperson.trim() || undefined,
      fiManager: form.fiManager.trim() || undefined,
      downPayment: toNum(form.downPayment),
      tradeAmount: toNum(form.tradeAmount),
      payoff: toNum(form.payoff),
      lender: form.lender.trim() || undefined,
      amountFinanced: toNum(form.amountFinanced),
      notes: form.notes.trim() || undefined,
      leadId: dealQuery.data?.leadId || undefined,
    }

    try {
      if (isEdit) {
        const updated = await mutations.updateDeal(dealId, payload)
        if (updated) {
          navigate(`/app/records/deals/${dealId}`)
        } else {
          setError('Failed to update deal. Please try again.')
        }
      } else {
        const created = await mutations.createDeal(payload)
        if (created) {
          navigate(`/app/records/deals/${created.id}`)
        } else {
          setError('Failed to create deal. Please try again.')
        }
      }
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && dealQuery.loading) {
    return <PageLoadingState title="Loading Deal" message="Retrieving deal details…" />
  }

  if (isEdit && !dealQuery.loading && !dealQuery.data && formReady) {
    return (
      <div className="ods-page ods-flow-lg">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/deals')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Deals
        </Button>
        <p className="text-muted-foreground">Deal not found.</p>
      </div>
    )
  }

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate(isEdit ? `/app/records/deals/${dealId}` : '/app/records/deals')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> {isEdit ? 'Back to Deal' : 'Deals'}
      </Button>

      <SectionHeader
        title={isEdit ? 'Edit Deal' : 'New Deal'}
        description={isEdit ? 'Editing deal record' : 'Manually create a new deal'}
      />

      {!formReady ? (
        <PageLoadingState title="Loading" message="Preparing form…" />
      ) : (
        <form onSubmit={handleSubmit} className="ods-flow-lg">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Buyer</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="customerName">Buyer Name <span className="text-destructive">*</span></Label>
                    <Input id="customerName" value={form.customerName} onChange={set('customerName')} placeholder="Full name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="coBuyer">Co-Buyer Name</Label>
                    <Input id="coBuyer" value={form.coBuyer} onChange={set('coBuyer')} placeholder="Optional co-buyer" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vehicle</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="vehicleDescription">Vehicle Description <span className="text-destructive">*</span></Label>
                    <Input id="vehicleDescription" value={form.vehicleDescription} onChange={set('vehicleDescription')} placeholder="e.g. 2024 Ford F-150 XLT" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stockNumber">Stock #</Label>
                    <Input id="stockNumber" value={form.stockNumber} onChange={set('stockNumber')} placeholder="Stock number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vin">VIN</Label>
                    <Input id="vin" value={form.vin} onChange={set('vin')} placeholder="17-character VIN" maxLength={17} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Deal Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="saleDate">Sale Date</Label>
                    <Input id="saleDate" type="date" value={form.saleDate} onChange={set('saleDate')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="salesperson">Salesperson</Label>
                    <Input id="salesperson" value={form.salesperson} onChange={set('salesperson')} placeholder="Rep name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fiManager">F&I Manager</Label>
                    <Input id="fiManager" value={form.fiManager} onChange={set('fiManager')} placeholder="F&I manager name" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financials</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Sale Price ($)</Label>
                    <Input id="amount" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="downPayment">Down Payment ($)</Label>
                    <Input id="downPayment" type="number" min="0" step="0.01" value={form.downPayment} onChange={set('downPayment')} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tradeAmount">Trade-In Value ($)</Label>
                    <Input id="tradeAmount" type="number" min="0" step="0.01" value={form.tradeAmount} onChange={set('tradeAmount')} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payoff">Payoff ($)</Label>
                    <Input id="payoff" type="number" min="0" step="0.01" value={form.payoff} onChange={set('payoff')} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amountFinanced">Amount Financed ($)</Label>
                    <Input id="amountFinanced" type="number" min="0" step="0.01" value={form.amountFinanced} onChange={set('amountFinanced')} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lender">Lender</Label>
                    <Input id="lender" value={form.lender} onChange={set('lender')} placeholder="Lender name" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
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
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit ? `/app/records/deals/${dealId}` : '/app/records/deals')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <FloppyDisk className="h-4 w-4" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Deal'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
