import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
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
import { useInventory } from '@/domains/inventory/inventory.hooks'
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
} from '@phosphor-icons/react'

const STAGES = ['structured', 'quoted', 'signed', 'funded', 'delivered'] as const

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
  const inventoryQuery = useInventory()
  const mutations = useDealMutations()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
  const matchingInventory = inventoryQuery.data.find(u => deal.vehicleDescription.includes(u.make) && deal.vehicleDescription.includes(u.model))
  const currentIdx = STAGES.indexOf(deal.status as typeof STAGES[number])

  async function handleDelete() {
    setDeleting(true)
    await mutations.deleteDeal(dealId)
    setDeleting(false)
    setShowDeleteDialog(false)
    navigate('/app/records/deals')
  }

  return (
    <div className="ods-page ods-flow-lg">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/deals')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Deals</Button>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader title={`${deal.customerName} — ${deal.vehicleDescription}`} description={`Deal record • Created ${new Date(deal.createdAt).toLocaleDateString()}`} />
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

      <Card><CardContent className="py-4"><div className="flex items-center justify-between">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= currentIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
            <span className={`text-sm capitalize ${i <= currentIdx ? 'font-semibold' : 'text-muted-foreground'}`}>{s}</span>
            {i < STAGES.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < currentIdx ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div></CardContent></Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Amount</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><CurrencyDollar className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">${deal.amount.toLocaleString()}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vehicle</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Car className="h-5 w-5" /><span className="text-sm">{deal.vehicleDescription}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status</CardTitle></CardHeader>
          <CardContent><StatusPill variant={deal.status === 'funded' ? 'success' : deal.status === 'signed' ? 'info' : 'warning'}>{deal.status}</StatusPill></CardContent></Card>
      </div>

      {approvals.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5"><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-yellow-500" /> Approvals</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{approvals.map(a => (
            <div key={a.id} className="flex items-center justify-between text-sm"><span>{a.description}</span><StatusPill variant={a.status === 'pending' ? 'warning' : a.status === 'granted' ? 'success' : 'danger'}>{a.status}</StatusPill></div>
          ))}</div></CardContent></Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
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
          {matchingInventory && (
            <div className="flex items-center justify-between text-sm border-t border-border pt-2">
              <div className="flex items-center gap-2"><EntityBadge variant="inventory">Inventory</EntityBadge><span className="text-muted-foreground">{matchingInventory.vin}</span></div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate(`/app/records/inventory/${matchingInventory.id}`)}>View <CaretRight className="h-3 w-3" /></Button>
            </div>
          )}
        </CardContent></Card>
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
                <span className="block mt-2 text-amber-600 font-medium">⚠ This deal is funded. Ensure deletion is intentional.</span>
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
    </div>
  )
}
