import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useDeal, useApprovals, useEntityEvents } from '@/hooks/useDomainQueries'
import { ArrowLeft, CurrencyDollar, Car, Shield, SpinnerGap } from '@phosphor-icons/react'

const STAGES = ['structured', 'quoted', 'signed', 'funded', 'delivered'] as const

export function DealRecordPage() {
  const { params, navigate } = useRouter()
  const dealQuery = useDeal(params.id ?? '')
  const approvalsQuery = useApprovals()
  const eventsQuery = useEntityEvents(params.id ?? '')

  if (dealQuery.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const deal = dealQuery.data
  if (!deal) return <div className="py-24 text-center text-muted-foreground">Deal not found.</div>

  const approvals = approvalsQuery.data.filter(a => a.description.toLowerCase().includes(deal.customerName.split(' ')[0].toLowerCase()))
  const events = eventsQuery.data
  const currentIdx = STAGES.indexOf(deal.status as typeof STAGES[number])

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/deals')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Deals</Button>
      <SectionHeader title={`${deal.customerName} — ${deal.vehicleDescription}`} description={`Deal record • Created ${new Date(deal.createdAt).toLocaleDateString()}`} />

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
        <Card><CardHeader><CardTitle>Linked Records</CardTitle></CardHeader><CardContent>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Lead</span><span className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/app/records/leads/${deal.leadId}`)}>{deal.leadId}</span></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader><CardContent>{events.length === 0 ? <p className="text-sm text-muted-foreground">No events.</p> : (
          <div className="space-y-3">{events.map(e => (
            <div key={e.id} className="flex items-center gap-3 text-sm border-b border-border pb-2 last:border-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</span>
              <StatusPill variant="info" dot={false}>{e.eventName.replace(/_/g, ' ')}</StatusPill>
            </div>))}</div>)}</CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>F&I Menu</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">F&I products will appear here.</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Credit</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Credit app and lender decisions will appear here.</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Documents</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Deal documents will appear here.</p></CardContent></Card>
      </div>
    </div>
  )
}
