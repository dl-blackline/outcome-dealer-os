import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useInventoryUnit } from '@/hooks/useDomainQueries'
import { ArrowLeft, Barcode, Calendar, CurrencyDollar, Wrench, SpinnerGap } from '@phosphor-icons/react'

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
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Reconditioning</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Recon job details will appear here when connected to the service domain.</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Photo Gallery</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Vehicle photos will appear here.</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Price History</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Price adjustment history will appear here.</p></CardContent></Card>
    </div>
  )
}
