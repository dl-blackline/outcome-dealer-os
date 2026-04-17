import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/app/router'
import { useInventoryUnit } from '@/domains/inventory/inventory.hooks'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/buyerHub.mock'
import {
  ArrowLeft,
  Barcode,
  Calendar,
  CurrencyDollar,
  Wrench,
  SpinnerGap,
  CheckCircle,
  Clock,
  Image,
  TrendUp,
  Warning,
} from '@phosphor-icons/react'

// Recon steps derived from vehicle status (simulated until recon domain is wired)
function getReconSteps(status: string) {
  const steps = [
    { label: 'Safety Inspection', done: true },
    { label: 'Mechanical Service', done: status !== 'recon' },
    { label: 'Detail & Clean', done: status === 'frontline' || status === 'aging' },
    { label: 'Photography', done: status === 'frontline' || status === 'aging' },
    { label: 'Frontline Ready', done: status === 'frontline' || status === 'aging' },
  ]
  return steps
}

export function InventoryUnitPage() {
  const { params, navigate } = useRouter()
  const unitQuery = useInventoryUnit(params.id ?? '')

  if (unitQuery.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const unit = unitQuery.data
  if (!unit) return <div className="py-24 text-center text-muted-foreground">Unit not found.</div>

  const agingVariant = unit.status === 'aging' ? 'danger' as const : unit.daysInStock > 45 ? 'warning' as const : 'success' as const
  const statusVariant = unit.status === 'frontline' ? 'success' as const : unit.status === 'recon' ? 'warning' as const : unit.status === 'aging' ? 'danger' as const : 'neutral' as const
  const reconSteps = getReconSteps(unit.status)

  // Try to find a buyer-hub entry for this unit (to show an image)
  const bhUnit = BUYER_HUB_INVENTORY.find(
    u => u.make === unit.make && u.model === unit.model && u.year === unit.year
  )

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/inventory')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Inventory</Button>
      <SectionHeader title={`${unit.year} ${unit.make} ${unit.model} ${unit.trim}`} description="Inventory unit record" />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">VIN</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Barcode className="h-4 w-4" /><span className="font-mono text-sm">{unit.vin}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
          <CardContent><StatusPill variant={statusVariant}>{unit.status}</StatusPill></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Days in Stock</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span className="text-2xl font-bold">{unit.daysInStock}</span><StatusPill variant={agingVariant} dot={false}>{unit.daysInStock > 60 ? 'aged' : unit.daysInStock > 45 ? 'aging' : 'fresh'}</StatusPill></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Asking Price</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><CurrencyDollar className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">${unit.askingPrice.toLocaleString()}</span></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reconditioning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Reconditioning
              <Badge
                variant={unit.status === 'recon' ? 'destructive' : 'secondary'}
                className="ml-auto text-xs font-normal"
              >
                {unit.status === 'recon' ? 'In Progress' : unit.status === 'frontline' ? 'Complete' : 'Pending'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reconSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-3 text-sm">
                {step.done ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={step.done ? '' : 'text-muted-foreground'}>{step.label}</span>
                {step.done && <Badge variant="outline" className="ml-auto text-xs">Done</Badge>}
              </div>
            ))}
            {unit.status === 'recon' && (
              <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 mt-2">
                <Warning className="h-3.5 w-3.5 shrink-0" />
                Vehicle is currently in the reconditioning queue.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" /> Photo Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bhUnit ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-md border">
                  <img
                    src={bhUnit.imageSourceUrl}
                    alt={`${unit.year} ${unit.make} ${unit.model}`}
                    className="h-48 w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Representative photo. Full photo set available when unit is frontline-ready.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-10 text-center">
                <Image className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Photos will be uploaded when the vehicle completes reconditioning.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp className="h-5 w-5" /> Price History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Initial List Price</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">${unit.askingPrice.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Day 0</span>
              </div>
            </div>
            {unit.daysInStock > 30 && (
              <div className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="text-xs text-muted-foreground">Aging Price Reduction</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-amber-600">${Math.round(unit.askingPrice * 0.97).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Day 30</span>
                </div>
              </div>
            )}
            {unit.daysInStock > 60 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-muted-foreground">Second Reduction</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-red-600">${Math.round(unit.askingPrice * 0.94).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Day 60</span>
                </div>
              </div>
            )}
          </div>
          {unit.daysInStock <= 30 && (
            <p className="text-xs text-muted-foreground mt-3">No price adjustments yet. Automated reductions trigger at 30 and 60 days.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
