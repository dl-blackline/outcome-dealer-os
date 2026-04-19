import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/app/router'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
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

/** Aging price reduction multipliers applied at 30 and 60 days in stock */
const AGING_REDUCTION_30_DAYS = 0.97
const AGING_REDUCTION_60_DAYS = 0.94

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
  const unitQuery = useInventoryRecord(params.id ?? '')

  if (unitQuery.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const unit = unitQuery.record
  if (!unit) return <div className="py-24 text-center text-muted-foreground">Unit not found.</div>

  const agingVariant = unit.status === 'aging' ? 'danger' as const : unit.daysInStock > 45 ? 'warning' as const : 'success' as const
  const statusVariant = unit.status === 'frontline' ? 'success' as const : unit.status === 'recon' ? 'warning' as const : unit.status === 'aging' ? 'danger' as const : 'neutral' as const
  const reconSteps = getReconSteps(unit.status)

  const coverPhoto = unit.photos[0]

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
          <CardContent><div className="flex items-center gap-2"><CurrencyDollar className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">${unit.price.toLocaleString()}</span></div></CardContent></Card>
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
            {coverPhoto ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-md border">
                  <InventoryPhotoImage
                    record={unit}
                    photo={coverPhoto}
                    alt={`${unit.year} ${unit.make} ${unit.model}`}
                    className="h-48 w-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {unit.photos.map((photo) => (
                    <InventoryPhotoImage
                      key={photo.id}
                      record={unit}
                      photo={photo}
                      alt={photo.alt}
                      className="aspect-4/3 rounded-md border object-cover"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Photo source: {unit.source === 'supabase' ? 'Supabase storage / database' : 'repo archive'}.</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Public Listing Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inventory-price">Public Price</Label>
              <Input id="inventory-price" type="number" defaultValue={unit.price} onBlur={(event) => { void unitQuery.updateRecord(unit.id, { price: Number(event.target.value) || unit.price }) }} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={unit.status} onValueChange={(value) => { void unitQuery.updateRecord(unit.id, { status: value }) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontline">Frontline</SelectItem>
                  <SelectItem value="recon">Recon</SelectItem>
                  <SelectItem value="aging">Aging</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>Published publicly</span>
                <Switch checked={unit.isPublished} onCheckedChange={(checked) => { void unitQuery.updateRecord(unit.id, { isPublished: checked, available: checked ? unit.available : false }) }} />
              </label>
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>Featured vehicle</span>
                <Switch checked={unit.isFeatured} onCheckedChange={(checked) => { void unitQuery.updateRecord(unit.id, { isFeatured: checked }) }} />
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inventory-description">Public Description</Label>
              <Textarea id="inventory-description" defaultValue={unit.description} rows={7} onBlur={(event) => { void unitQuery.updateRecord(unit.id, { description: event.target.value }) }} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inventory-color">Color</Label>
                <Input id="inventory-color" defaultValue={unit.color || ''} onBlur={(event) => { void unitQuery.updateRecord(unit.id, { color: event.target.value || undefined }) }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory-drivetrain">Drivetrain</Label>
                <Input id="inventory-drivetrain" defaultValue={unit.drivetrain || ''} onBlur={(event) => { void unitQuery.updateRecord(unit.id, { drivetrain: event.target.value || undefined }) }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <span className="font-semibold">${unit.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Day 0</span>
              </div>
            </div>
            {unit.daysInStock > 30 && (
              <div className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="text-xs text-muted-foreground">Aging Price Reduction</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-amber-600">${Math.round(unit.price * AGING_REDUCTION_30_DAYS).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Day 30</span>
                </div>
              </div>
            )}
            {unit.daysInStock > 60 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs text-muted-foreground">Second Reduction</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-red-600">${Math.round(unit.price * AGING_REDUCTION_60_DAYS).toLocaleString()}</span>
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
