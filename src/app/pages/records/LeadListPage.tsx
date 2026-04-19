import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { StatusPill } from '@/components/core/StatusPill'
import { useRouter } from '@/app/router'
import { useLeads } from '@/domains/leads/lead.hooks'
import { SpinnerGap } from '@phosphor-icons/react'

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'converted'] as const

export function LeadListPage() {
  const { navigate } = useRouter()
  const leads = useLeads()
  const [tab, setTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const filtered = leads.data.filter(l => (tab === 'all' || l.status === tab) && (!search || l.customerName.toLowerCase().includes(search.toLowerCase())))

  if (leads.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Leads" description="Track and manage sales leads" />
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setTab(s)} className={`px-3 py-1.5 text-sm capitalize ${tab === s ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground'}`}>{s}</button>
          ))}
        </div>
        <input type="text" placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)}
          className="h-8 w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground" />
      </div>
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Customer</th>
            <th className="px-4 py-3 text-left font-medium">Source</th>
            <th className="px-4 py-3 text-left font-medium">Score</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Created</th>
          </tr></thead>
          <tbody>{filtered.map(lead => (
            <tr key={lead.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
              <td className="px-4 py-3 font-medium">{lead.customerName}</td>
              <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
              <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-16 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${lead.score}%` }} /></div><span className="text-xs">{lead.score}</span></div></td>
              <td className="px-4 py-3"><StatusPill variant={lead.status === 'converted' ? 'success' : lead.status === 'qualified' ? 'info' : lead.status === 'contacted' ? 'warning' : 'neutral'}>{lead.status}</StatusPill></td>
              <td className="px-4 py-3 text-right text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
