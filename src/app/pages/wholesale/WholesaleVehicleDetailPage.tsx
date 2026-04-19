import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useRouteParam } from '@/app/router/routeParams'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { clearWholesaleAccess } from '@/domains/wholesale/wholesaleAccess'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { ArrowLeft, CurrencyDollar, LockKeyOpen, Eye } from '@phosphor-icons/react'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function WholesaleVehicleDetailPage() {
  const { navigate } = useRouter()
  const unitId = useRouteParam('unitId')
  const { wholesaleRecords, loading } = useInventoryCatalog()
  const [showRetailReference, setShowRetailReference] = useState(false)

  const vehicle = useMemo(
    () => wholesaleRecords.find((unit) => unit.id === unitId || unit.listingId === unitId || unit.stockNumber === unitId || unit.vin === unitId) || null,
    [wholesaleRecords, unitId],
  )

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading wholesale unit…</div>
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Wholesale Unit Not Found</h1>
        <p className="mt-2 text-slate-400">This unit is not currently available in wholesale view.</p>
        <Button variant="outline" className="vault-btn-muted mt-6 rounded-full" onClick={() => navigate('/wholesale')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Wholesale Inventory
        </Button>
      </div>
    )
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.trim()

  return (
    <div className="ods-buyer-page mx-auto max-w-[88rem] space-y-7 px-3 pb-24 pt-6 sm:px-4 sm:pt-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" className="vault-btn-muted rounded-full text-xs uppercase tracking-[0.12em]" onClick={() => navigate('/wholesale')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Wholesale
        </Button>
        <Button
          variant="outline"
          className="vault-btn-muted rounded-full text-xs uppercase tracking-[0.12em]"
          onClick={() => {
            clearWholesaleAccess()
            navigate('/wholesale')
          }}
        >
          <LockKeyOpen size={14} className="mr-2" />
          Lock Wholesale View
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="vault-panel vault-edge overflow-hidden rounded-4xl border-white/15 bg-black/30">
            <div className="vault-image-frame relative h-[22rem] bg-muted/40 sm:h-[32rem]">
              <InventoryPhotoImage
                record={vehicle}
                alt={title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="vault-panel vault-edge rounded-3xl border-blue-200/25 bg-black/35">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Wholesale Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-300">{title}</p>
              <Badge className="rounded-full border border-blue-200/40 bg-blue-300/20 text-blue-100">Dealer / Wholesale Pricing</Badge>

              <div className="rounded-2xl border border-white/15 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.13em] text-slate-400">Wholesale Price</p>
                <div className="mt-1 flex items-center gap-1 text-3xl font-bold text-white">
                  <CurrencyDollar size={24} className="text-blue-200" />
                  {formatPrice(vehicle.wholesalePrice || 0).replace('$', '')}
                </div>
              </div>

              {vehicle.wholesaleStatus ? (
                <p className="text-sm text-slate-300">Status: <span className="font-semibold text-slate-100">{vehicle.wholesaleStatus}</span></p>
              ) : null}
              {vehicle.wholesaleNotes ? (
                <div className="rounded-xl border border-white/12 bg-black/20 p-3 text-sm text-slate-300">{vehicle.wholesaleNotes}</div>
              ) : null}

              <button
                onClick={() => setShowRetailReference((v) => !v)}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-slate-400 hover:text-slate-200"
              >
                <Eye size={14} />
                {showRetailReference ? 'Hide' : 'Show'} Retail Reference Price
              </button>

              {showRetailReference ? (
                <p className="text-sm text-slate-400">Retail price: <span className="font-semibold text-slate-200">{formatPrice(vehicle.price)}</span></p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="vault-panel-soft rounded-3xl border-white/15 bg-white/3">
            <CardContent className="space-y-2 p-5 text-sm text-slate-300">
              <p><span className="text-slate-400">VIN:</span> {vehicle.vin || 'N/A'}</p>
              <p><span className="text-slate-400">Stock:</span> {vehicle.stockNumber || 'N/A'}</p>
              <p><span className="text-slate-400">Mileage:</span> {vehicle.mileage.toLocaleString()} mi</p>
              <p><span className="text-slate-400">Body:</span> {vehicle.bodyStyle}</p>
              <p><span className="text-slate-400">Condition:</span> {vehicle.condition || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
