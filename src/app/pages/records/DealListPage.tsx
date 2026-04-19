import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { StatusPill } from '@/components/core/StatusPill'
import { useRouter } from '@/app/router'
import { useDeals } from '@/domains/deals/deal.hooks'
import { SpinnerGap } from '@phosphor-icons/react'

const STATUSES = ['all', 'structured', 'quoted', 'signed', 'funded'] as const

export function DealListPage() {
  const { navigate } = useRouter()
  const deals = useDeals()
  const [tab, setTab] = useState<string>('all')
  const filtered = deals.data.filter(d => tab === 'all' || d.status === tab)

  if (deals.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Deals" description="Active and completed deal pipeline" />
      <div className="flex rounded-lg border border-border overflow-hidden w-fit">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setTab(s)} className={`px-3 py-1.5 text-sm capitalize ${tab === s ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground'}`}>{s}</button>
        ))}
      </div>
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">Customer</th>
            <th className="px-4 py-3 text-left font-medium">Vehicle</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Created</th>
          </tr></thead>
          <tbody>{filtered.map(deal => (
            <tr key={deal.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
              <td className="px-4 py-3 font-medium">{deal.customerName}</td>
              <td className="px-4 py-3 text-muted-foreground">{deal.vehicleDescription}</td>
              <td className="px-4 py-3 text-right font-semibold">${deal.amount.toLocaleString()}</td>
              <td className="px-4 py-3"><StatusPill variant={deal.status === 'funded' ? 'success' : deal.status === 'signed' ? 'info' : deal.status === 'quoted' ? 'warning' : 'neutral'}>{deal.status}</StatusPill></td>
              <td className="px-4 py-3 text-right text-muted-foreground">{new Date(deal.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
