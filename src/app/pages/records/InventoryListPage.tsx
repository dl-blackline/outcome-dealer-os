import { useEffect, useMemo, useState } from 'react'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { MagnifyingGlass, SpinnerGap, Warning, Export, ArrowUpRight } from '@phosphor-icons/react'

const PANEL_STYLE = {
  background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  frontline:  { bg: 'rgba(44,105,255,0.15)',  text: '#60a5fa', label: 'Frontline' },
  available:  { bg: 'rgba(44,105,255,0.15)',  text: '#60a5fa', label: 'Available' },
  recon:      { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Recon' },
  inventory:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Inventory' },
  aging:      { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', label: 'Aging' },
  wholesale:  { bg: 'rgba(107,114,128,0.2)',  text: '#9ca3af', label: 'Wholesale' },
  sold:       { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Sold' },
  delivered:  { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Delivered' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.5)', label: status }
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  )
}

function AgingCell({ days }: { days: number }) {
  if (days >= 60) {
    return (
      <span className="flex items-center gap-1 text-red-400 font-bold tabular-nums">
        <Warning className="h-3 w-3 shrink-0" />
        {days}d
      </span>
    )
  }
  if (days >= 30) {
    return <span className="text-amber-400 font-semibold tabular-nums">{days}d</span>
  }
  return <span className="text-emerald-400 tabular-nums">{days}d</span>
}

const STATUS_FILTERS = ['active', 'frontline', 'recon', 'inventory', 'wholesale', 'sold', 'all'] as const
type StatusFilter = typeof STATUS_FILTERS[number]
const SOLD_STATUSES = new Set(['sold', 'delivered'])

export function InventoryListPage() {
  const { navigate } = useRouter()
  const inventory = useInventoryCatalog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return inventory.records.filter(u => {
      const desc = `${u.year} ${u.make} ${u.model} ${u.trim} ${u.vin ?? ''} ${u.stockNumber ?? ''}`.toLowerCase()
      const statusOk =
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? !SOLD_STATUSES.has(u.status) :
        u.status === statusFilter
      return (!q || desc.includes(q)) && statusOk
    })
  }, [inventory.records, search, statusFilter])

  if (inventory.loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <SpinnerGap className="h-8 w-8 animate-spin text-red-500/60" />
      </div>
    )
  }

  const total = inventory.records.length
  const aged30 = inventory.records.filter(u => u.daysInStock >= 30 && u.daysInStock < 60).length
  const aged60 = inventory.records.filter(u => u.daysInStock >= 60).length
  const newArrivals = inventory.records.filter(u => u.daysInStock <= 7).length
  const avgDays = total > 0 ? Math.round(inventory.records.reduce((s, u) => s + u.daysInStock, 0) / total) : 0

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Inventory Command
          </h1>
          <p className="text-[0.78rem] text-white/40 mt-0.5">{total} units · active lot management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/records/inventory/new')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.8rem] font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #c01818, #e83232)',
              boxShadow: '0 2px 12px rgba(223,36,36,0.3)',
            }}
          >
            + Add Unit
          </button>
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] font-medium text-white/60 transition-colors hover:text-white/80"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Export className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total Units', value: total, accent: '#2c69ff' },
          { label: 'New Arrivals', value: newArrivals, accent: '#10b981' },
          { label: 'Aged 30+', value: aged30, accent: '#f59e0b' },
          { label: 'Aged 60+', value: aged60, accent: '#df2424' },
          { label: 'Avg Days', value: `${avgDays}d`, accent: '#7c3aed' },
          { label: 'VDP Views', value: '—', accent: '#ec4899' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ ...PANEL_STYLE, borderTop: `2px solid ${k.accent}` }}>
            <div className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/35 mb-2">{k.label}</div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search by year, make, model, VIN, stock…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg py-2 pl-9 pr-4 text-[0.82rem] text-white/80 placeholder-white/25 outline-none transition-all"
            style={{
              background: 'oklch(0.13 0.014 248)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(223,36,36,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 text-[0.73rem] capitalize font-medium transition-all"
              style={statusFilter === s ? {
                background: 'rgba(223,36,36,0.2)',
                color: '#f87171',
              } : {
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {s === 'active' ? 'Active' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30 text-sm">
            {total === 0
              ? 'No inventory units yet. Add or import units to populate this page.'
              : 'No units matched your search. Try a different term or filter.'}
          </div>
        ) : (
          <StickyTableShell scrollOffset="22rem">
            <table className="w-full text-[0.8rem]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Stock #', 'Vehicle', 'Miles', 'Days', 'Status', 'Price', 'Market Gap', 'Open'].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 font-semibold text-[0.65rem] uppercase tracking-wider text-white/30 ${i >= 5 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((unit, i) => (
                  <tr
                    key={unit.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    onClick={() => navigate(`/app/records/inventory/${unit.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-[0.72rem] text-white/45">
                      {unit.stockNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white/85">{unit.year} {unit.make} {unit.model}</div>
                      {unit.trim && <div className="text-[0.7rem] text-white/35 mt-0.5">{unit.trim}</div>}
                    </td>
                    <td className="px-4 py-3 text-white/50 tabular-nums">
                      {unit.mileage != null ? unit.mileage.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <AgingCell days={unit.daysInStock} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={unit.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white/80 tabular-nums">
                      ${unit.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-white/30 text-[0.72rem]">—</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="h-7 w-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 transition-colors ml-auto"
                        onClick={e => { e.stopPropagation(); navigate(`/app/records/inventory/${unit.id}`) }}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </StickyTableShell>
        )}
      </div>
    </div>
  )
}
