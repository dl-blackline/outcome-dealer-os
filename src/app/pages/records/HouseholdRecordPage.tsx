import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { MOCK_LEADS, MOCK_DEALS } from '@/lib/mockData'
import { ArrowLeft, CurrencyDollar, Star, UsersThree } from '@phosphor-icons/react'

const MOCK_HOUSEHOLDS = [
  { id: 'hh-001', name: 'Mitchell Family', lifetimeValue: 38900, loyaltyScore: 72, preferredContact: 'email', members: 2, createdAt: '2024-11-01' },
  { id: 'hh-002', name: 'Johnson Family', lifetimeValue: 105200, loyaltyScore: 91, preferredContact: 'phone', members: 3, createdAt: '2024-06-15' },
  { id: 'hh-003', name: 'Rodriguez Family', lifetimeValue: 0, loyaltyScore: 15, preferredContact: 'sms', members: 1, createdAt: '2025-01-16' },
]

export function HouseholdRecordPage() {
  const { params, navigate } = useRouter()
  const hh = MOCK_HOUSEHOLDS.find(h => h.id === params.id) ?? MOCK_HOUSEHOLDS[0]
  const linkedLeads = MOCK_LEADS.filter(l => l.householdId === hh.id)
  const linkedDeals = MOCK_DEALS.filter(d => linkedLeads.some(l => l.id === d.leadId))

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/households')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Households</Button>
      <SectionHeader title={hh.name} description={`Household record • Created ${hh.createdAt}`} />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Lifetime Value</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><CurrencyDollar className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">${hh.lifetimeValue.toLocaleString()}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Loyalty Score</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /><span className="text-2xl font-bold">{hh.loyaltyScore}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Preferred Contact</CardTitle></CardHeader>
          <CardContent><span className="text-lg capitalize">{hh.preferredContact}</span></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Members</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><UsersThree className="h-5 w-5" /><span className="text-2xl font-bold">{hh.members}</span></div></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Linked Leads</CardTitle></CardHeader><CardContent>{linkedLeads.length === 0 ? <p className="text-sm text-muted-foreground">No leads.</p> : (
          <div className="space-y-3">{linkedLeads.map(l => (
            <div key={l.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 cursor-pointer hover:bg-accent/30 rounded px-2 -mx-2" onClick={() => navigate(`/app/records/leads/${l.id}`)}>
              <div><p className="font-medium">{l.customerName}</p><p className="text-xs text-muted-foreground">{l.source} • Score: {l.score}</p></div>
              <StatusPill variant={l.status === 'converted' ? 'success' : l.status === 'qualified' ? 'info' : 'neutral'}>{l.status}</StatusPill>
            </div>))}</div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Linked Deals</CardTitle></CardHeader><CardContent>{linkedDeals.length === 0 ? <p className="text-sm text-muted-foreground">No deals.</p> : (
          <div className="space-y-3">{linkedDeals.map(d => (
            <div key={d.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 cursor-pointer hover:bg-accent/30 rounded px-2 -mx-2" onClick={() => navigate(`/app/records/deals/${d.id}`)}>
              <div><p className="font-medium">{d.customerName}</p><p className="text-xs text-muted-foreground">{d.vehicleDescription}</p></div>
              <div className="text-right"><p className="font-semibold">${d.amount.toLocaleString()}</p><StatusPill variant={d.status === 'funded' ? 'success' : 'info'}>{d.status}</StatusPill></div>
            </div>))}</div>)}</CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Audit history will appear here when connected to the event stream.</p></CardContent></Card>
    </div>
  )
}
