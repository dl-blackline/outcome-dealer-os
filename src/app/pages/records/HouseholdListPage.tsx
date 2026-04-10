import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { useRouter } from '@/app/router'
import { UsersThree, CurrencyDollar, Star } from '@phosphor-icons/react'

const MOCK_HOUSEHOLDS = [
  { id: 'hh-001', name: 'Mitchell Family', primaryContact: 'Sarah Mitchell', lifetimeValue: 38900, loyaltyScore: 72, members: 2, createdAt: '2024-11-01T10:00:00Z' },
  { id: 'hh-002', name: 'Johnson Family', primaryContact: 'Marcus Johnson', lifetimeValue: 105200, loyaltyScore: 91, members: 3, createdAt: '2024-06-15T14:00:00Z' },
  { id: 'hh-003', name: 'Rodriguez Family', primaryContact: 'Elena Rodriguez', lifetimeValue: 0, loyaltyScore: 15, members: 1, createdAt: '2025-01-16T09:15:00Z' },
  { id: 'hh-004', name: 'Thompson Family', primaryContact: 'David Thompson', lifetimeValue: 67800, loyaltyScore: 85, members: 2, createdAt: '2023-03-20T08:30:00Z' },
]

export function HouseholdListPage() {
  const { navigate } = useRouter()
  const [search, setSearch] = useState('')
  const filtered = MOCK_HOUSEHOLDS.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.primaryContact.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <SectionHeader title="Households" description="Manage customer households and relationships" />
      <input type="text" placeholder="Search households…" value={search} onChange={e => setSearch(e.target.value)}
        className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium"><div className="flex items-center gap-2"><UsersThree className="h-4 w-4" /> Name</div></th>
            <th className="px-4 py-3 text-left font-medium">Primary Contact</th>
            <th className="px-4 py-3 text-right font-medium"><div className="flex items-center justify-end gap-1"><CurrencyDollar className="h-4 w-4" /> Lifetime Value</div></th>
            <th className="px-4 py-3 text-right font-medium"><div className="flex items-center justify-end gap-1"><Star className="h-4 w-4" /> Loyalty</div></th>
            <th className="px-4 py-3 text-right font-medium">Members</th>
            <th className="px-4 py-3 text-right font-medium">Created</th>
          </tr></thead>
          <tbody>{filtered.map(hh => (
            <tr key={hh.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/app/records/households/${hh.id}`)}>
              <td className="px-4 py-3 font-medium">{hh.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{hh.primaryContact}</td>
              <td className="px-4 py-3 text-right font-semibold">${hh.lifetimeValue.toLocaleString()}</td>
              <td className="px-4 py-3 text-right"><StatusPill variant={hh.loyaltyScore >= 80 ? 'success' : hh.loyaltyScore >= 40 ? 'info' : 'neutral'} dot={false}>{hh.loyaltyScore}</StatusPill></td>
              <td className="px-4 py-3 text-right">{hh.members}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{new Date(hh.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
