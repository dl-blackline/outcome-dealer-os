/**
 * SoldRecordPage
 *
 * Displays the persistent sold record for a deal.
 * Accessible at /app/records/deals/:id/sold
 */
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/app/router'
import { useRouteParam, hasRouteParam } from '@/app/router/routeParams'
import { PageLoadingState, PageNotFoundState } from '@/components/core/PageStates'
import { useSoldRecordByDeal, useSoldMutations } from '@/domains/sold/sold.hooks'
import { SOLD_STATUS_LABELS } from '@/domains/sold/sold.types'
import { useDeal } from '@/domains/deals/deal.hooks'
import {
  ArrowLeft,
  Car,
  CurrencyDollar,
  User,
  CalendarBlank,
  CheckCircle,
  Truck,
  SpinnerGap,
} from '@phosphor-icons/react'
import { useState } from 'react'

export function SoldRecordPage() {
  const { navigate } = useRouter()
  const dealId = useRouteParam('id')
  const soldQuery = useSoldRecordByDeal(dealId)
  const dealQuery = useDeal(dealId)
  const { finalizeDelivery } = useSoldMutations()
  const [finalizing, setFinalizing] = useState(false)

  if (!hasRouteParam(dealId)) {
    return <PageNotFoundState title="Deal Missing" message="No deal id was provided." />
  }

  if (soldQuery.loading) {
    return <PageLoadingState title="Loading Sold Record" message="Retrieving sold record details." />
  }

  const sold = soldQuery.data
  if (!sold) {
    return (
      <div className="ods-page ods-flow-lg">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/app/records/deals/${dealId}`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Deal
        </Button>
        <PageNotFoundState
          title="No Sold Record"
          message="This deal does not have a sold record yet. Mark the deal as sold to create one."
        />
      </div>
    )
  }

  const deal = dealQuery.data
  const vehicleTitle = [sold.snapshotYear, sold.snapshotMake, sold.snapshotModel, sold.snapshotTrim].filter(Boolean).join(' ')

  async function handleFinalizeDelivery() {
    setFinalizing(true)
    await finalizeDelivery(dealId)
    soldQuery.refresh()
    dealQuery.refresh()
    setFinalizing(false)
  }

  const statusVariant = sold.soldStatus === 'delivered' ? 'success' : 'warning'

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/app/records/deals/${dealId}`)} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Deal
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader
          title="Sold Record"
          description={`${deal?.customerName ?? 'Customer'} — ${vehicleTitle || deal?.vehicleDescription || 'Vehicle'}`}
        />
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill variant={statusVariant}>
            {SOLD_STATUS_LABELS[sold.soldStatus] ?? sold.soldStatus}
          </StatusPill>
          {sold.soldStatus === 'sold_pending_delivery' && (
            <Button size="sm" className="gap-2" disabled={finalizing} onClick={handleFinalizeDelivery}>
              {finalizing ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              Finalize Delivery
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sale Price</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CurrencyDollar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {sold.agreedSalePrice != null ? `$${sold.agreedSalePrice.toLocaleString()}` : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sold Date</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarBlank className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">{new Date(sold.soldDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Delivery Date</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">
                {sold.deliveryDate ? new Date(sold.deliveryDate).toLocaleDateString() : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Linked</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {sold.isInventoryLinked
                ? <CheckCircle className="h-5 w-5 text-green-500" />
                : <Car className="h-5 w-5 text-muted-foreground" />}
              <span className="text-sm">{sold.isInventoryLinked ? 'Inventory-linked' : 'Manual / Legacy'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vehicle Snapshot */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> Vehicle Snapshot</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sold.snapshotPrimaryImageUrl && (
              <img src={sold.snapshotPrimaryImageUrl} alt="Vehicle" className="w-full h-40 object-cover rounded-md mb-2" />
            )}
            <Row label="Vehicle" value={vehicleTitle || '—'} />
            <Row label="Stock #" value={sold.snapshotStockNumber} />
            <Row label="VIN" value={sold.snapshotVin} />
            <Row label="VIN Last 6" value={sold.snapshotVinLast6 ? `…${sold.snapshotVinLast6}` : undefined} />
            <Row label="Mileage" value={sold.snapshotMileage != null ? `${sold.snapshotMileage.toLocaleString()} mi` : undefined} />
            <Row label="Exterior Color" value={sold.snapshotExteriorColor} />
            <Row label="Interior Color" value={sold.snapshotInteriorColor} />
            <Row label="Asking Price" value={sold.snapshotAskingPrice != null ? `$${sold.snapshotAskingPrice.toLocaleString()}` : undefined} />
            <Row label="Status at Sale" value={sold.snapshotInventoryStatusAtSale} />
            {sold.inventoryUnitId && (
              <Button variant="outline" size="sm" className="mt-2 gap-1.5 text-xs" onClick={() => navigate(`/app/records/inventory/${sold.inventoryUnitId}`)}>
                <Car className="h-3.5 w-3.5" /> View Inventory Record
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Deal / Finance Details */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CurrencyDollar className="h-5 w-5" /> Deal Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Agreed Sale Price" value={sold.agreedSalePrice != null ? `$${sold.agreedSalePrice.toLocaleString()}` : undefined} />
            <Row label="Front Gross" value={sold.frontGross != null ? `$${sold.frontGross.toLocaleString()}` : undefined} />
            <Row label="Back Gross" value={sold.backGross != null ? `$${sold.backGross.toLocaleString()}` : undefined} />
            <div className="border-t border-border my-2" />
            <Row label="Down Payment" value={sold.downPayment != null ? `$${sold.downPayment.toLocaleString()}` : undefined} />
            <Row label="Amount Financed" value={sold.amountFinanced != null ? `$${sold.amountFinanced.toLocaleString()}` : undefined} />
            <Row label="Lender" value={sold.lender} />
            <Row label="Trade Amount" value={sold.tradeAmount != null ? `$${sold.tradeAmount.toLocaleString()}` : undefined} />
            <Row label="Payoff" value={sold.payoff != null ? `$${sold.payoff.toLocaleString()}` : undefined} />
          </CardContent>
        </Card>

        {/* Personnel */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personnel</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Salesperson" value={sold.salesperson} />
            <Row label="F&I Manager" value={sold.fiManager} />
            <Row label="Marked Sold By" value={sold.markedSoldBy} />
          </CardContent>
        </Card>

        {/* Audit */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarBlank className="h-5 w-5" /> Audit</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Sold Date" value={new Date(sold.soldDate).toLocaleString()} />
            <Row label="Delivery Date" value={sold.deliveryDate ? new Date(sold.deliveryDate).toLocaleString() : undefined} />
            <Row label="Record Created" value={new Date(sold.createdAt).toLocaleString()} />
            <Row label="Prev. Inventory Status" value={sold.previousInventoryStatus} />
            <Row label="Inventory Linked" value={sold.isInventoryLinked ? 'Yes' : 'No (Manual/Legacy)'} />
            {sold.notes && <Row label="Notes" value={sold.notes} />}
          </CardContent>
        </Card>
      </div>

      {/* Quick nav to deal */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/records/deals/${dealId}`)}>
          View Full Deal Record
        </Button>
        {sold.inventoryUnitId && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/app/records/inventory/${sold.inventoryUnitId}`)}>
            View Inventory Record
          </Button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value ?? '—'}</span>
    </div>
  )
}
