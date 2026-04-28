import { useState } from 'react'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import { StatusPill } from '@/components/core/StatusPill'
import { useRouter } from '@/app/router'
import { useHouseholds } from '@/domains/households/household.hooks'
import { UsersThree, CurrencyDollar, Star, SpinnerGap, Plus } from '@phosphor-icons/react'

export function HouseholdListPage() {
  const { navigate } = useRouter()
  const households = useHouseholds()
  const [search, setSearch] = useState('')
  const filtered = households.data.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.primaryContact.toLowerCase().includes(search.toLowerCase()))

  if (households.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      {/* Header — bold mockup-style */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
        background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
        border: '1px solid rgba(168,85,247,0.18)',
        boxShadow: '0 0 60px rgba(168,85,247,0.04)',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #a855f7 0%, #1E3A8A 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #a855f7 0%, rgba(168,85,247,0.3) 40%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(168,85,247,0.06) 0%, transparent 60%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="pl-3">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#c084fc' }}>National Car Mart · Dealer OS</div>
            <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em' }}>CUSTOMER HQ</h1>
            <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>Manage customer households and relationships · {households.data.length} households</p>
          </div>
          <button
            onClick={() => navigate('/app/records/households/new')}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold text-white transition-all hover:brightness-115 hover:scale-[1.02] shrink-0"
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 2px 16px rgba(168,85,247,0.45)' }}
          >
            <Plus className="h-4 w-4" /> New Household
          </button>
        </div>
      </div>
      <div className="ods-toolbar ods-sticky-toolbar">
        <input type="text" placeholder="Search households…" value={search} onChange={e => setSearch(e.target.value)}
          className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <StickyTableShell scrollOffset="17rem">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium"><div className="flex items-center gap-2"><UsersThree className="h-4 w-4" /> Name</div></th>
            <th className="px-4 py-3 text-left font-medium">Primary Contact</th>
            <th className="px-4 py-3 text-right font-medium"><div className="flex items-center justify-end gap-1"><CurrencyDollar className="h-4 w-4" /> Lifetime Value</div></th>
            <th className="px-4 py-3 text-right font-medium"><div className="flex items-center justify-end gap-1"><Star className="h-4 w-4" /> Loyalty</div></th>
            <th className="px-4 py-3 text-right font-medium">Members</th>
            <th className="px-4 py-3 text-right font-medium">Created</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No households yet. Customer households will appear here once they are created.</td></tr>
            ) : filtered.map(hh => (
              <tr key={hh.id} className="border-b border-border last:border-0 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => navigate(`/app/records/households/${hh.id}`)}>
                <td className="px-4 py-3 font-medium">{hh.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{hh.primaryContact}</td>
                <td className="px-4 py-3 text-right font-semibold">${hh.lifetimeValue.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><StatusPill variant={hh.loyaltyScore >= 80 ? 'success' : hh.loyaltyScore >= 40 ? 'info' : 'neutral'} dot={false}>{hh.loyaltyScore}</StatusPill></td>
                <td className="px-4 py-3 text-right">{hh.members}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{new Date(hh.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StickyTableShell>
    </div>
  )
}
