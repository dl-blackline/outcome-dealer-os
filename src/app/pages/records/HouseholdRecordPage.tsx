import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { ReferenceHero } from '@/components/core/ReferenceHero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/app/router'
import { useHousehold } from '@/domains/households/household.hooks'
import { useLeads } from '@/domains/leads/lead.hooks'
import { useDeals } from '@/domains/deals/deal.hooks'
import { useSoldRecords } from '@/domains/sold/sold.hooks'
import type { SoldRecord } from '@/domains/sold/sold.types'
import {
  ArrowLeft,
  CurrencyDollar,
  Star,
  UsersThree,
  SpinnerGap,
  Printer,
  Car,
  CheckCircle,
  Truck,
} from '@phosphor-icons/react'
import { MOCKUP_REFERENCES } from '@/app/mockupReferences'

export function HouseholdRecordPage() {
  const { params, navigate } = useRouter()
  const hhQuery = useHousehold(params.id ?? '')
  const leadsQuery = useLeads()
  const dealsQuery = useDeals()
  const soldQuery = useSoldRecords()

  if (hhQuery.loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hh = hhQuery.data
  if (!hh) return <div className="py-24 text-center text-muted-foreground">Household not found.</div>

  const linkedLeads = leadsQuery.data.filter(l => l.householdId === hh.id)
  const linkedDeals = dealsQuery.data.filter(d => linkedLeads.some(l => l.id === d.leadId))
  const linkedDealIds = new Set(linkedDeals.map(d => d.id))
  const purchasedVehicles = soldQuery.data.filter(s => s.dealId != null && linkedDealIds.has(s.dealId))

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/households')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Households
      </Button>
      <SectionHeader
        title={hh.name}
        description={`Household record • Created ${new Date(hh.createdAt).toLocaleDateString()}`}
      />
      <ReferenceHero reference={MOCKUP_REFERENCES.customer360} />

      <section className="rounded-2xl border border-white/15 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-4 shadow-[0_22px_70px_rgba(2,6,23,0.42)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-blue-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Household Value</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">${hh.lifetimeValue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Loyalty Score</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{hh.loyaltyScore}</p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Linked Leads</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{linkedLeads.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Purchased Vehicles</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{purchasedVehicles.length}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-slate-700/70 bg-slate-950/75 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">360 Action Rail</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-500" onClick={() => navigate('/app/records/leads/new')}>
              New Lead
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-100 hover:bg-slate-800" onClick={() => navigate('/app/records/deals/new')}>
              Start Deal
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-100 hover:bg-slate-800" onClick={() => navigate('/app/records/households')}>
              Return to Households
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Lifetime Value</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CurrencyDollar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">${hh.lifetimeValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Loyalty Score</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{hh.loyaltyScore}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Preferred Contact</CardTitle></CardHeader>
          <CardContent>
            <span className="text-lg capitalize">{hh.preferredContact ?? 'email'}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Members</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UsersThree className="h-5 w-5" />
              <span className="text-2xl font-bold">{hh.members}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Linked Leads</CardTitle></CardHeader>
          <CardContent>
            {linkedLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads.</p>
            ) : (
              <div className="space-y-3">
                {linkedLeads.map(l => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0 cursor-pointer hover:bg-accent/30 rounded px-2 -mx-2"
                    onClick={() => navigate(`/app/records/leads/${l.id}`)}
                  >
                    <div>
                      <p className="font-medium">{l.customerName}</p>
                      <p className="text-xs text-muted-foreground">{l.source} • Score: {l.score}</p>
                    </div>
                    <StatusPill variant={l.status === 'converted' ? 'success' : l.status === 'qualified' ? 'info' : 'neutral'}>
                      {l.status}
                    </StatusPill>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Linked Deals</CardTitle></CardHeader>
          <CardContent>
            {linkedDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals.</p>
            ) : (
              <div className="space-y-3">
                {linkedDeals.map(d => (
                  <div key={d.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div
                      className="flex-1 cursor-pointer hover:bg-accent/30 rounded px-2 -mx-2 py-1"
                      onClick={() => navigate(`/app/records/deals/${d.id}`)}
                    >
                      <p className="font-medium">{d.customerName}</p>
                      <p className="text-xs text-muted-foreground">{d.vehicleDescription}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold text-sm">${d.amount.toLocaleString()}</p>
                        <StatusPill variant={d.status === 'funded' ? 'success' : 'info'}>{d.status}</StatusPill>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs shrink-0"
                        title="Print Deal Forms"
                        onClick={() => navigate(`/app/records/deals/${d.id}/forms`)}
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Purchase History — sold records linked via deal chain: household → leads → deals → sold_records */}
      <PurchaseHistoryCard
        soldRecords={purchasedVehicles}
        loading={leadsQuery.loading || dealsQuery.loading || soldQuery.loading}
        onNavigate={navigate}
      />

      <Card>
        <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Audit history will appear here when connected to the event stream.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Purchase History ──────────────────────────────────────────────────────────

function PurchaseHistoryCard({
  soldRecords,
  loading,
  onNavigate,
}: {
  soldRecords: SoldRecord[]
  loading: boolean
  onNavigate: (path: string) => void
}) {
  const sorted = soldRecords
    .slice()
    .sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Purchase History
          {soldRecords.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">{soldRecords.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <SpinnerGap className="h-4 w-4 animate-spin" /> Loading purchase history…
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No purchased vehicles on record for this household.
          </p>
        ) : (
          <div className="space-y-4">
            {sorted.map((sold) => (
              <SoldVehicleRow key={sold.id} sold={sold} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SoldVehicleRow({ sold, onNavigate }: { sold: SoldRecord; onNavigate: (p: string) => void }) {
  const vehicleTitle =
    [sold.snapshotYear, sold.snapshotMake, sold.snapshotModel, sold.snapshotTrim]
      .filter(Boolean)
      .join(' ') || 'Vehicle'
  const isDelivered = sold.soldStatus === 'delivered'

  return (
    <div className="flex items-start gap-4 rounded-md border border-border bg-card p-3">
      <VehicleThumbnail url={sold.snapshotPrimaryImageUrl} title={vehicleTitle} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm">{vehicleTitle}</p>
          {isDelivered ? (
            <Badge className="gap-1 text-xs bg-green-600/90 hover:bg-green-600/90">
              <CheckCircle className="h-3 w-3" /> Delivered
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Truck className="h-3 w-3" /> Pending Delivery
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {[
            sold.snapshotStockNumber ? `Stock #${sold.snapshotStockNumber}` : null,
            sold.snapshotVinLast6 ? `VIN …${sold.snapshotVinLast6}` : null,
            sold.snapshotMileage != null ? `${sold.snapshotMileage.toLocaleString()} mi` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
          <span>Sold {new Date(sold.soldDate).toLocaleDateString()}</span>
          {sold.agreedSalePrice != null && (
            <span className="font-medium text-foreground">${sold.agreedSalePrice.toLocaleString()}</span>
          )}
          {sold.salesperson && <span>By {sold.salesperson}</span>}
        </div>
      </div>

      {sold.dealId && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => onNavigate(`/app/records/deals/${sold.dealId}/sold`)}
        >
          View Record
        </Button>
      )}
    </div>
  )
}

/** Thumbnail with image error fallback */
function VehicleThumbnail({ url, title }: { url?: string; title: string }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <div className="h-16 w-20 shrink-0 rounded bg-muted/50 overflow-hidden flex items-center justify-center">
      {url && !imgFailed ? (
        <img
          src={url}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <Car className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  )
}
