import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { ReferenceHero } from '@/components/core/ReferenceHero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { EntityBadge } from '@/components/core/EntityBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRouter } from '@/app/router'
import { useRouteParam, hasRouteParam } from '@/app/router/routeParams'
import { PageLoadingState, PageNotFoundState } from '@/components/core/PageStates'
import { useDeal, useDealMutations } from '@/domains/deals/deal.hooks'
import { useApprovals } from '@/domains/approvals/approval.hooks'
import { useEntityEvents } from '@/domains/events/event.hooks'
import { useLeads } from '@/domains/leads/lead.hooks'
import { LinkedInventoryUnitCard } from '@/components/inventory/LinkedInventoryUnitCard'
import { InventoryUnitSelector } from '@/components/inventory/InventoryUnitSelector'
import { pickBestInventoryPhoto, type InventoryRecord } from '@/domains/inventory/inventory.runtime'
import type { DealInventorySnapshot } from '@/lib/mockData'
import { useSoldRecordByDeal, useSoldMutations } from '@/domains/sold/sold.hooks'
import {
  ArrowLeft,
  CurrencyDollar,
  Car,
  Shield,
  CaretRight,
  CheckCircle,
  Clock,
  FileText,
  Warning,
  Printer,
  PencilSimple,
  Trash,
  SpinnerGap,
  Tag,
  Truck,
} from '@phosphor-icons/react'
import { MOCKUP_REFERENCES } from '@/app/mockupReferences'

const STAGES = ['structured', 'quoted', 'signed', 'funded', 'sold_pending_delivery', 'delivered'] as const
const STAGE_LABELS: Record<string, string> = {
  structured: 'Structured',
  quoted: 'Quoted',
  signed: 'Signed',
  funded: 'Funded',
  sold_pending_delivery: 'Sold',
  delivered: 'Delivered',
}

// Representative F&I products for a deal that hasn't yet had a menu built
const FI_PRODUCTS = [
  { name: 'Vehicle Service Contract', code: 'VSC', status: 'not_offered', price: null },
  { name: 'GAP Protection', code: 'GAP', status: 'not_offered', price: null },
  { name: 'Tire & Wheel Protection', code: 'TWP', status: 'not_offered', price: null },
  { name: 'Paintless Dent Repair', code: 'PDR', status: 'not_offered', price: null },
]

// Standard document checklist for a retail deal
const STANDARD_DOCS = [
  'Retail Installment Contract',
  'Buyer\'s Order',
  'Credit Application',
  'Privacy Notice',
  'Odometer Disclosure',
  'Federal Truth-in-Lending',
  'We-Owe / As-Is Disclosure',
]

export function DealRecordPage() {
  const { navigate } = useRouter()
  const dealId = useRouteParam('id')
  const dealQuery = useDeal(dealId)
  const approvalsQuery = useApprovals()
  const eventsQuery = useEntityEvents(dealId)
  const leadsQuery = useLeads()
  const mutations = useDealMutations()
  const soldQuery = useSoldRecordByDeal(dealId)
  const soldMutations = useSoldMutations()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [showMarkSoldDialog, setShowMarkSoldDialog] = useState(false)
  const [markingSold, setMarkingSold] = useState(false)
  const [soldError, setSoldError] = useState<string | null>(null)

  if (!hasRouteParam(dealId)) {
    return <PageNotFoundState title="Deal Missing" message="No deal id was provided in this route." />
  }

  if (dealQuery.loading) {
    return <PageLoadingState title="Loading Deal Record" message="Retrieving deal details, timeline, and linked records." />
  }

  const deal = dealQuery.data
  if (!deal) {
    return <PageNotFoundState title="Deal Not Found" message="This deal could not be found or may have been removed." />
  }

  const approvals = approvalsQuery.data.filter(a => a.description.toLowerCase().includes(deal.customerName.split(' ')[0].toLowerCase()))
  const events = eventsQuery.data
  const linkedLead = leadsQuery.data.find(l => l.id === deal.leadId)
  const currentIdx = STAGES.indexOf(deal.status as typeof STAGES[number])

  async function handleAttachUnit(record: InventoryRecord) {
    const vinLast6 = record.vin ? record.vin.slice(-6) : undefined
    const photo = pickBestInventoryPhoto(record)
    const snapshot: DealInventorySnapshot = {
      year: record.year,
      make: record.make,
      model: record.model,
      trim: record.trim,
      bodyStyle: record.bodyStyle,
      stockNumber: record.stockNumber,
      vin: record.vin,
      vinLast6,
      exteriorColor: record.exteriorColor,
      interiorColor: record.interiorColor,
      mileage: record.mileage,
      askingPrice: record.price,
      primaryImageUrl: photo?.url,
      unitStatus: record.status,
    }
    await mutations.updateDeal(dealId, {
      inventoryUnitId: record.id,
      inventorySnapshot: snapshot,
      vehicleDescription: [record.year, record.make, record.model, record.trim].filter(Boolean).join(' '),
      stockNumber: record.stockNumber,
      vin: record.vin,
    })
    dealQuery.refresh()
  }

  async function handleRemoveUnit() {
    await mutations.updateDeal(dealId, {
      inventoryUnitId: undefined,
      inventorySnapshot: undefined,
    })
    dealQuery.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    await mutations.deleteDeal(dealId)
    setDeleting(false)
    setShowDeleteDialog(false)
    navigate('/app/records/deals')
  }

  async function handleMarkSold() {
    setSoldError(null)
    if (!deal) return
    if (!deal.inventoryUnitId) {
      setSoldError('Please attach an inventory unit before marking this deal as sold.')
      return
    }
    setMarkingSold(true)
    const result = await soldMutations.markSold({
      dealId,
      inventoryUnitId: deal.inventoryUnitId,
      agreedSalePrice: deal.amount,
      salesperson: deal.salesperson,
      fiManager: deal.fiManager,
      lender: deal.lender,
      amountFinanced: deal.amountFinanced,
      downPayment: deal.downPayment,
      tradeAmount: deal.tradeAmount,
      payoff: deal.payoff,
      markedSoldBy: 'user',
    })
    setMarkingSold(false)
    if (!result) {
      setSoldError('Failed to mark deal as sold. Please try again.')
      return
    }
    setShowMarkSoldDialog(false)
    dealQuery.refresh()
    soldQuery.refresh()
  }

  const isSold = deal.status === 'sold_pending_delivery' || deal.status === 'delivered'

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/deals')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Deals</Button>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader title={`${deal.customerName} — ${deal.vehicleDescription}`} description={`Deal record • Created ${new Date(deal.createdAt).toLocaleDateString()}`} />
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isSold ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/app/records/deals/${dealId}/sold`)}>
              <Tag className="h-4 w-4" /> View Sold Record
            </Button>
          ) : (
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => { setSoldError(null); setShowMarkSoldDialog(true) }}>
              <Tag className="h-4 w-4" /> Mark Sold
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/app/records/deals/${dealId}/edit`)}>
            <PencilSimple className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive border-destructive/30" onClick={() => setShowDeleteDialog(true)}>
            <Trash className="h-4 w-4" /> Delete
          </Button>
          <Button onClick={() => navigate(`/app/records/deals/${dealId}/forms`)} className="gap-2">
            <Printer className="h-4 w-4" /> Print Deal Forms
          </Button>
        </div>
      </div>

      <ReferenceHero reference={MOCKUP_REFERENCES.dealDesk} />

      <section className="rounded-2xl border border-white/15 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-4 shadow-[0_22px_70px_rgba(2,6,23,0.42)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-blue-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Deal Amount</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">${deal.amount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-cyan-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Front Gross</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">${deal.frontGross.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Back Gross</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">${deal.backGross.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Current Stage</p>
            <p className="mt-1 text-lg font-bold uppercase tracking-[0.09em] text-slate-50">{STAGE_LABELS[deal.status] ?? deal.status}</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/75 p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Desk Action Rail</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {isSold ? (
                <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-100 hover:bg-slate-800" onClick={() => navigate(`/app/records/deals/${dealId}/sold`)}>
                  <Tag className="h-4 w-4" /> View Sold Record
                </Button>
              ) : (
                <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-500 text-white" onClick={() => { setSoldError(null); setShowMarkSoldDialog(true) }}>
                  <Tag className="h-4 w-4" /> Mark Sold
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-100 hover:bg-slate-800" onClick={() => navigate(`/app/records/deals/${dealId}/edit`)}>
                <PencilSimple className="h-4 w-4" /> Edit Deal
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-slate-100 hover:bg-slate-800" onClick={() => navigate(`/app/records/deals/${dealId}/forms`)}>
                <Printer className="h-4 w-4" /> Print Forms
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/70 bg-slate-950/75 p-3 text-xs text-slate-300">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Desk Flags</p>
            <div className="mt-2 space-y-2">
              <div className="rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-amber-100">
                {approvals.length} approval checks linked to this desk file.
              </div>
              <div className="rounded-md border border-blue-400/30 bg-blue-500/10 px-2 py-1.5 text-blue-100">
                {events.length} timeline events on this transaction.
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card><CardContent className="py-4"><div className="flex items-center justify-between">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= currentIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
            <span className={`text-sm capitalize ${i <= currentIdx ? 'font-semibold' : 'text-muted-foreground'}`}>{STAGE_LABELS[s] ?? s}</span>
            {i < STAGES.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < currentIdx ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div></CardContent></Card>

      {isSold && soldQuery.data && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {deal.status === 'delivered' ? 'Delivered' : 'Sold – Pending Delivery'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sold {new Date(soldQuery.data.soldDate).toLocaleDateString()}
                  {soldQuery.data.snapshotStockNumber && ` · Stock #${soldQuery.data.snapshotStockNumber}`}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-green-500/30" onClick={() => navigate(`/app/records/deals/${dealId}/sold`)}>
              <Tag className="h-3.5 w-3.5" /> View Sold Record
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Amount</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><CurrencyDollar className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">${deal.amount.toLocaleString()}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vehicle</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Car className="h-5 w-5" /><span className="text-sm">{deal.vehicleDescription}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
          <CardContent><StatusPill variant={deal.status === 'delivered' ? 'success' : deal.status === 'sold_pending_delivery' ? 'success' : deal.status === 'funded' ? 'success' : deal.status === 'signed' ? 'info' : 'warning'}>{STAGE_LABELS[deal.status] ?? deal.status}</StatusPill></CardContent></Card>
      </div>

      {approvals.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5"><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-yellow-500" /> Approvals</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{approvals.map(a => (
            <div key={a.id} className="flex items-center justify-between text-sm"><span>{a.description}</span><StatusPill variant={a.status === 'pending' ? 'warning' : a.status === 'granted' ? 'success' : 'danger'}>{a.status}</StatusPill></div>
          ))}</div></CardContent></Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Linked Records</CardTitle></CardHeader><CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><EntityBadge variant="lead">Lead</EntityBadge>{linkedLead && <span className="text-muted-foreground">{linkedLead.customerName}</span>}</div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate(`/app/records/leads/${deal.leadId}`)}>{deal.leadId} <CaretRight className="h-3 w-3" /></Button>
            </div>
            {linkedLead && (
              <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                <div className="flex items-center gap-2"><EntityBadge variant="household">Household</EntityBadge></div>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate(`/app/records/households/${linkedLead.householdId}`)}>{linkedLead.householdId} <CaretRight className="h-3 w-3" /></Button>
              </div>
            )}
          </CardContent></Card>

          {/* Linked inventory unit — real record or attach prompt */}
          {deal.inventoryUnitId ? (
            <LinkedInventoryUnitCard
              inventoryUnitId={deal.inventoryUnitId}
              snapshot={deal.inventorySnapshot}
              onChangeUnit={() => setSelectorOpen(true)}
              onRemoveUnit={handleRemoveUnit}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-6 flex flex-col items-center gap-3 text-center">
                <Car className="h-8 w-8 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">No inventory unit linked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {deal.vehicleDescription
                      ? `Vehicle: ${deal.vehicleDescription}`
                      : 'Attach a vehicle from inventory to enable rich deal tracking.'}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setSelectorOpen(true)}>
                  <Car className="h-3.5 w-3.5" />
                  Attach Inventory Unit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        <Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><CardContent>{events.length === 0 ? <p className="text-sm text-muted-foreground">No events.</p> : (
          <div className="space-y-3">{events.map(e => (
            <div key={e.id} className="flex items-center gap-3 text-sm border-b border-border pb-2 last:border-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</span>
              <StatusPill variant="info" dot={false}>{e.eventName.replace(/_/g, ' ')}</StatusPill>
            </div>))}</div>)}</CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* F&I Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              F&I Menu
              <Badge variant="outline" className="text-xs font-normal">Not presented</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {FI_PRODUCTS.map(p => (
              <div key={p.code} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">Pending</Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">F&I menu will be built when deal reaches the F&I stage.</p>
          </CardContent>
        </Card>

        {/* Credit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Credit
              <Badge variant="outline" className="text-xs font-normal">No app yet</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
              <Warning className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-muted-foreground">Credit application not started</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Application status</span><span className="font-medium">—</span></div>
              <div className="flex justify-between"><span>Lender decision</span><span className="font-medium">—</span></div>
              <div className="flex justify-between"><span>Approved rate</span><span className="font-medium">—</span></div>
              <div className="flex justify-between"><span>Approved term</span><span className="font-medium">—</span></div>
              <div className="flex justify-between"><span>Stip status</span><span className="font-medium">—</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Documents
              <Badge variant="outline" className="text-xs font-normal">Incomplete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {STANDARD_DOCS.map(doc => (
              <div key={doc} className="flex items-center gap-2 text-sm">
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{doc}</span>
                <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto" />
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">Documents will be generated when deal is signed.</p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={open => { if (!open) setShowDeleteDialog(false) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete the deal for <strong>{deal.customerName} — {deal.vehicleDescription}</strong>?
              {deal.status === 'funded' && (
                <span className="block mt-2 font-medium text-amber-600">
                  <Warning className="inline h-4 w-4 mr-1" aria-hidden="true" />This deal is funded. Ensure deletion is intentional.
                </span>
              )}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : 'Delete Deal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Sold confirmation modal */}
      <AlertDialog open={showMarkSoldDialog} onOpenChange={open => { if (!open) { setShowMarkSoldDialog(false); setSoldError(null) } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" /> Mark Deal as Sold
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>You are about to mark this deal as <strong>Sold – Pending Delivery</strong>.</p>

                <div className="rounded-md border border-border bg-muted/40 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{deal.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{deal.vehicleDescription || '—'}</span></div>
                  {deal.stockNumber && <div className="flex justify-between"><span className="text-muted-foreground">Stock #</span><span className="font-medium">{deal.stockNumber}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">Sale Amount</span><span className="font-medium">${deal.amount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Sale Date</span><span className="font-medium">{new Date().toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery Status</span><span className="font-medium">Pending Delivery</span></div>
                </div>

                <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-2.5 text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-0.5">What happens next:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>A sold record will be created and linked to this deal</li>
                    <li>The inventory unit will be removed from active retail inventory</li>
                    <li>The deal status will advance to <strong>Sold – Pending Delivery</strong></li>
                  </ul>
                </div>

                {!deal.inventoryUnitId && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-2.5 text-xs text-amber-800 dark:text-amber-200">
                    <Warning className="inline h-3.5 w-3.5 mr-1" />
                    No inventory unit is linked. Please attach one before marking as sold, or the sold record will be created as a manual/legacy deal.
                  </div>
                )}

                {soldError && (
                  <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 p-2.5 text-xs text-red-700 dark:text-red-300">
                    <Warning className="inline h-3.5 w-3.5 mr-1" />{soldError}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={markingSold} onClick={() => { setShowMarkSoldDialog(false); setSoldError(null) }}>Cancel</AlertDialogCancel>
            {!deal.inventoryUnitId ? (
              <Button
                className="gap-2"
                variant="outline"
                disabled={markingSold}
                onClick={() => { setShowMarkSoldDialog(false); setSelectorOpen(true) }}
              >
                <Car className="h-4 w-4" /> Attach Inventory Unit
              </Button>
            ) : (
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={markingSold}
                onClick={handleMarkSold}
              >
                {markingSold ? <SpinnerGap className="h-4 w-4 animate-spin" /> : <><Tag className="h-4 w-4 mr-1" /> Confirm – Mark Sold</>}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InventoryUnitSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={handleAttachUnit}
        selectedId={deal.inventoryUnitId}
      />
    </div>
  )
}
