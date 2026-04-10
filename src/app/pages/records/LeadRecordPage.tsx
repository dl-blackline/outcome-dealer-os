import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/app/router'
import { useLead, useEntityEvents } from '@/hooks/useDomainQueries'
import { ArrowLeft, EnvelopeSimple, Phone, Target, Globe, SpinnerGap } from '@phosphor-icons/react'

export function LeadRecordPage() {
  const { params, navigate } = useRouter()
  const leadQuery = useLead(params.id ?? '')
  const eventsQuery = useEntityEvents(params.id ?? '')

  if (leadQuery.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const lead = leadQuery.data
  if (!lead) return <div className="py-24 text-center text-muted-foreground">Lead not found.</div>

  const events = eventsQuery.data
  const sv = lead.status === 'converted' ? 'success' as const : lead.status === 'qualified' ? 'info' as const : lead.status === 'contacted' ? 'warning' as const : 'neutral' as const

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/records/leads')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Leads</Button>
      <div className="flex items-center gap-4"><SectionHeader title={lead.customerName} description={`Lead • ${lead.source}`} /><StatusPill variant={sv} className="text-base px-4 py-1">{lead.status}</StatusPill></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Score</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">{lead.score}</span></div>
            <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${lead.score}%` }} /></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Email</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><EnvelopeSimple className="h-4 w-4" /><span className="text-sm">{lead.email}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Phone</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span className="text-sm">{lead.phone}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Source</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Globe className="h-4 w-4" /><span className="text-sm">{lead.source}</span></div></CardContent></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Linked Records</CardTitle></CardHeader><CardContent>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Household</span><span className="cursor-pointer text-primary hover:underline" onClick={() => navigate(`/app/records/households/${lead.householdId}`)}>{lead.householdId}</span></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader><CardContent>{events.length === 0 ? <p className="text-sm text-muted-foreground">No events.</p> : (
          <div className="space-y-3">{events.map(e => (
            <div key={e.id} className="flex items-center gap-3 text-sm border-b border-border pb-2 last:border-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</span>
              <StatusPill variant="info" dot={false}>{e.eventName.replace(/_/g, ' ')}</StatusPill>
              <span className="text-xs text-muted-foreground">{e.actorType}</span>
            </div>))}</div>)}</CardContent></Card>
      </div>
    </div>
  )
}
