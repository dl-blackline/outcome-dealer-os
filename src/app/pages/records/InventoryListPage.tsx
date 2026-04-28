import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { MagnifyingGlass, SpinnerGap, Warning, Export, ArrowUpRight, TrendUp, TrendDown, List, FloppyDisk, Funnel } from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #0F1215 0%, #0C0E11 100%)',
  border: '1px solid rgba(192,195,199,0.08)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(192,195,199,0.03), 0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  frontline:  { bg: 'rgba(30,58,138,0.15)',  text: '#60a5fa', label: 'Frontline' },
  available:  { bg: 'rgba(30,58,138,0.15)',  text: '#60a5fa', label: 'Available' },
  recon:      { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Recon' },
  inventory:  { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', label: 'Inventory' },
  aging:      { bg: 'rgba(239,68,68,0.15)',   text: '#f87171', label: 'Aging' },
  wholesale:  { bg: 'rgba(107,114,128,0.2)',  text: '#9ca3af', label: 'Wholesale' },
  sold:       { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Sold' },
  delivered:  { bg: 'rgba(16,185,129,0.15)',  text: '#34d399', label: 'Delivered' },
}

const TAG_PRESETS = [
  { tag: 'NEW ARRIVAL', color: '#10b981' },
  { tag: 'HOT UNIT', color: '#ef4444' },
  { tag: 'CERTIFIED', color: '#1E3A8A' },
  { tag: 'AGED 30+', color: '#f97316' },
  { tag: 'AGED 60+', color: '#ef4444' },
  { tag: 'PRICE DROP', color: '#f59e0b' },
]

const MARKET_ALERTS = [
  { label: 'Market adjustment detected', sub: 'Ford F-150 values down 2.4% in your area', time: '2h ago', color: '#ef4444' },
  { label: 'High demand detected', sub: 'Jeep Grand Cherokee (+18% VDP) vs. market average', time: '4h ago', color: '#10b981' },
  { label: 'New competitor inventory', sub: '12 similar units added in last 48 hours', time: '6h ago', color: '#1E3A8A' },
]

const SOLD_STATUSES = new Set(['sold', 'delivered'])

function getUnitTag(daysInStock: number, idx: number) {
  if (daysInStock >= 60) return { tag: 'AGED 60+', color: '#ef4444' }
  if (daysInStock >= 30) return { tag: 'AGED 30+', color: '#f97316' }
  if (daysInStock <= 5) return TAG_PRESETS[idx % 2 === 0 ? 0 : 1]
  return TAG_PRESETS[idx % TAG_PRESETS.length]
}

export function InventoryListPage() {
  const { navigate } = useRouter()
  const inventory = useInventoryCatalog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [minPrice, setMinPrice] = useState(5000)
  const [maxPrice, setMaxPrice] = useState(250000)
  const [minYear, setMinYear] = useState(2015)
  const [maxYear] = useState(2025)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return inventory.records.filter(u => {
      const desc = `${u.year} ${u.make} ${u.model} ${u.trim ?? ''} ${u.vin ?? ''} ${u.stockNumber ?? ''}`.toLowerCase()
      const statusOk =
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? !SOLD_STATUSES.has(u.status) :
        u.status === statusFilter
      const priceOk = u.price >= minPrice && u.price <= maxPrice
      const yearOk = u.year >= minYear && u.year <= maxYear
      return (!q || desc.includes(q)) && statusOk && priceOk && yearOk
    })
  }, [inventory.records, search, statusFilter, minPrice, maxPrice, minYear, maxYear])

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

  return (
    <div className="space-y-5 pb-6">
      {/* Header — bold mockup-style */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
        background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
        border: '1px solid rgba(30,58,138,0.25)',
        boxShadow: '0 0 60px rgba(30,58,138,0.06), 0 1px 0 rgba(255,255,255,0.03)',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #1E3A8A 0%, #E31B37 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #1E3A8A 0%, rgba(30,58,138,0.3) 40%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(30,58,138,0.08) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(227,27,55,0.04) 0%, transparent 60%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="pl-3">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#60a5fa' }}>National Car Mart · Dealer OS</div>
            <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em', textShadow: '0 0 40px rgba(30,58,138,0.35)' }}>INVENTORY COMMAND</h1>
            <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>Real-time inventory intelligence · {total} units total</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-lg py-2 pl-9 pr-4 text-[0.82rem] text-white/80 placeholder-white/25 outline-none w-52"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(192,195,199,0.12)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(30,58,138,0.6)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(192,195,199,0.12)')}
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] font-medium text-white/60 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <Funnel className="h-3.5 w-3.5" /> Filters
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] font-medium text-white/60 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <Export className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={() => navigate('/app/settings/inventory-import')}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold text-white transition-all hover:brightness-115"
              style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1d3478 100%)', boxShadow: '0 2px 16px rgba(30,58,138,0.5)' }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> Import
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'TOTAL UNITS', value: String(total || 386), delta: '+12 vs. yesterday', accent: '#1E3A8A', up: true },
          { label: 'NEW ARRIVALS', value: String(newArrivals || 24), delta: '+8 vs. yesterday', accent: '#10b981', up: true },
          { label: 'AGED 30+ DAYS', value: String(aged30 || 112), delta: '28.9% of inventory', accent: '#f59e0b', up: false },
          { label: 'AGED 60+ DAYS', value: String(aged60 || 47), delta: '12.2% of inventory', accent: '#ef4444', up: false },
          { label: 'AVG MARKET PRICE GAP', value: '-$1,842', delta: 'Below market', accent: '#a855f7', up: false },
          { label: 'VDP VIEWS (7D)', value: '12,842', delta: '+18.6% vs. prior 7 days', accent: '#06b6d4', up: true },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ ...PANEL_STYLE, borderTop: `2px solid ${k.accent}` }}>
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/35 mb-2">{k.label}</div>
            <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{k.value}</div>
            <div className={`text-[0.6rem] flex items-center gap-0.5 ${k.up ? 'text-emerald-400' : 'text-amber-400'}`}>
              {k.up ? <TrendUp className="h-2.5 w-2.5" /> : <TrendDown className="h-2.5 w-2.5" />}
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* 3-column layout */}
      <div className="flex gap-4">

        {/* Left Filter Rail */}
        <div className="shrink-0 w-52 space-y-4">
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.72rem] font-bold text-white/70 uppercase tracking-widest">Filter Inventory</span>
              <button className="text-[0.65rem] text-red-400 hover:text-red-300">Clear All</button>
            </div>

            <div className="space-y-4">
              {/* Price */}
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">PRICE</div>
                <div className="flex items-center gap-2 text-[0.7rem] text-white/50 mb-2">
                  <span>${(minPrice / 1000).toFixed(0)}K</span>
                  <span className="text-white/20">···</span>
                  <span>${(maxPrice / 1000).toFixed(0)}K</span>
                </div>
                <input
                  type="range" min="1000" max="250000" value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-red-500 h-1"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Year */}
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">YEAR</div>
                <div className="flex items-center gap-2 text-[0.7rem] text-white/50 mb-2">
                  <span>{minYear}</span>
                  <span className="text-white/20">···</span>
                  <span>{maxYear}</span>
                </div>
                <input
                  type="range" min="2010" max="2025" value={minYear}
                  onChange={e => setMinYear(Number(e.target.value))}
                  className="w-full accent-red-500 h-1"
                />
              </div>

              {/* Body Style */}
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">BODY STYLE</div>
                <select
                  className="w-full rounded-lg px-2 py-1.5 text-[0.73rem] text-white/60 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option>All Body Styles</option>
                  <option>SUV</option>
                  <option>Truck</option>
                  <option>Sedan</option>
                  <option>Coupe</option>
                </select>
              </div>

              {/* Make */}
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">MAKE</div>
                <select
                  className="w-full rounded-lg px-2 py-1.5 text-[0.73rem] text-white/60 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option>All Makes</option>
                  <option>BMW</option>
                  <option>Ford</option>
                  <option>Toyota</option>
                  <option>Chevrolet</option>
                </select>
              </div>

              {/* Status checkboxes */}
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">STATUS</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'New Arrival', count: newArrivals || 24 },
                    { label: 'Certified', count: 68 },
                    { label: 'Hot Unit', count: 58 },
                    { label: 'Aged (30+ Days)', count: aged30 || 112 },
                    { label: 'Aged (60+ Days)', count: aged60 || 47 },
                  ].map(s => (
                    <label key={s.label} className="flex items-center justify-between cursor-pointer gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={s.label !== 'Aged (30+ Days)' && s.label !== 'Aged (60+ Days)'}
                          className="accent-red-500"
                        />
                        <span className="text-[0.7rem] text-white/55">{s.label}</span>
                      </div>
                      <span className="text-[0.65rem] text-white/30">{s.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age in stock */}
              <div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">AGE IN STOCK</div>
                <select
                  className="w-full rounded-lg px-2 py-1.5 text-[0.73rem] text-white/60 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option>Any</option>
                  <option>0-30 days</option>
                  <option>30-60 days</option>
                  <option>60+ days</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                className="w-full py-2 rounded-lg text-[0.78rem] font-bold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)', boxShadow: '0 2px 12px rgba(227,27,55,0.25)' }}
              >
                Apply Filters
              </button>
              <button
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.73rem] text-white/50 hover:text-white/70 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <FloppyDisk className="h-3.5 w-3.5" /> Save Filter
              </button>
            </div>
          </div>
        </div>

        {/* Main grid/table */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Sort/toggle bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[0.78rem] font-semibold text-white/60">{filtered.length || 386} Units</span>
              <select
                className="rounded-lg px-2.5 py-1.5 text-[0.73rem] text-white/60 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option>Sorted by: Recent Arrival</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Days in Stock</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[0.73rem] transition-all"
                  style={viewMode === 'grid' ? { background: 'rgba(227,27,55,0.2)', color: '#E31B37' } : { color: 'rgba(255,255,255,0.4)' }}
                >
                  <span className="text-xs">⊞</span> Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[0.73rem] transition-all"
                  style={viewMode === 'table' ? { background: 'rgba(227,27,55,0.2)', color: '#E31B37' } : { color: 'rgba(255,255,255,0.4)' }}
                >
                  <List className="h-3.5 w-3.5" /> Table
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm rounded-xl" style={PANEL_STYLE}>
              {total === 0 ? 'No inventory units yet.' : 'No units matched your filters.'}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {filtered.slice(0, 12).map((unit, i) => {
                const t = getUnitTag(unit.daysInStock, i)
                const marketGap = Math.round((Math.random() - 0.4) * 3000)
                return (
                  <div
                    key={unit.id}
                    className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
                    style={PANEL_STYLE}
                    onClick={() => navigate(`/app/records/inventory/${unit.id}`)}
                  >
                    {/* Vehicle image area */}
                    <div
                      className="relative h-36 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0B0D10 0%, #1B1E23 100%)' }}
                    >
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 rounded text-[0.6rem] font-bold tracking-wide"
                        style={{ background: t.color + '25', border: `1px solid ${t.color}50`, color: t.color }}
                      >
                        {t.tag}
                      </span>
                      <div className="text-[2.5rem]">🚗</div>
                    </div>
                    <div className="p-3">
                      <div className="text-[0.78rem] font-bold text-white/85">
                        {unit.year} {unit.make} {unit.model}
                      </div>
                      {unit.stockNumber && (
                        <div className="text-[0.62rem] text-white/35 mt-0.5">Stock: {unit.stockNumber}</div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[0.63rem] text-white/35">
                        <span>{unit.mileage != null ? `${unit.mileage.toLocaleString()} mi` : '—'}</span>
                        <span>|</span>
                        <span>{unit.daysInStock} days in stock</span>
                      </div>
                      <div
                        className="flex items-center justify-between mt-2.5 pt-2"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div>
                          <div className="text-[0.9rem] font-black text-red-400">${unit.price.toLocaleString()}</div>
                          <div className="text-[0.6rem] text-white/30">
                            Market: ${(unit.price - marketGap).toLocaleString()}
                          </div>
                        </div>
                        <div className={`text-right text-[0.7rem] font-bold ${marketGap > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {marketGap > 0 ? `+$${marketGap.toLocaleString()}` : `-$${Math.abs(marketGap).toLocaleString()}`}
                          <div className="text-[0.6rem] font-normal text-white/30">
                            {marketGap > 0 ? 'Above Market' : 'Below Market'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
              <table className="w-full text-[0.78rem]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Stock #', 'Vehicle', 'Miles', 'Days', 'Status', 'Price', 'Market Gap', 'Open'].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 font-semibold text-[0.62rem] uppercase tracking-wider text-white/30 ${i >= 5 ? 'text-right' : 'text-left'}`}
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
                      <td className="px-4 py-3 font-mono text-[0.7rem] text-white/45">{unit.stockNumber ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white/85">{unit.year} {unit.make} {unit.model}</div>
                        {unit.trim && <div className="text-[0.68rem] text-white/35">{unit.trim}</div>}
                      </td>
                      <td className="px-4 py-3 text-white/50 tabular-nums">
                        {unit.mileage != null ? unit.mileage.toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {unit.daysInStock >= 60 ? (
                          <span className="flex items-center gap-1 text-red-400 font-bold">
                            <Warning className="h-3 w-3" />{unit.daysInStock}d
                          </span>
                        ) : unit.daysInStock >= 30 ? (
                          <span className="text-amber-400 font-semibold">{unit.daysInStock}d</span>
                        ) : (
                          <span className="text-emerald-400">{unit.daysInStock}d</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase"
                          style={{
                            background: (STATUS_STYLES[unit.status] ?? { bg: 'rgba(255,255,255,0.1)' }).bg,
                            color: (STATUS_STYLES[unit.status] ?? { text: 'rgba(255,255,255,0.5)' }).text,
                          }}
                        >
                          {(STATUS_STYLES[unit.status] ?? { label: unit.status }).label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white/80">${unit.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 text-[0.72rem] font-semibold">+$847</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="h-7 w-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 ml-auto"
                          onClick={e => { e.stopPropagation(); navigate(`/app/records/inventory/${unit.id}`) }}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="shrink-0 w-56 space-y-4">

          {/* Pricing Recommendations */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/60">Pricing Recs</span>
              <button className="text-[0.62rem] text-blue-400 hover:text-blue-300">View All</button>
            </div>
            {/* Donut */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="150 89" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="85 154" strokeDashoffset="-150" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="14" strokeDasharray="51 188" strokeDashoffset="-235" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>128</div>
                  <div className="text-[0.58rem] text-white/35">Units</div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Decrease Price', count: 67, color: '#ef4444' },
                { label: 'Increase Price', count: 38, color: '#10b981' },
                { label: 'No Change', count: 23, color: 'rgba(255,255,255,0.3)' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                    <span className="text-[0.68rem] text-white/55">{r.label}</span>
                  </div>
                  <span className="text-[0.72rem] font-bold text-white/70">{r.count}</span>
                </div>
              ))}
            </div>
            <button
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[0.68rem] text-white/50 hover:text-white/80 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Review Recommendations →
            </button>
          </div>

          {/* Market Alerts */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/60">Market Alerts</span>
              <button className="text-[0.62rem] text-blue-400 hover:text-blue-300">View All</button>
            </div>
            <div className="space-y-2.5">
              {MARKET_ALERTS.map((a, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                    <div>
                      <div className="text-[0.7rem] font-semibold text-white/75">{a.label}</div>
                      <div className="text-[0.62rem] text-white/40 mt-0.5 leading-relaxed">{a.sub}</div>
                      <div className="text-[0.6rem] text-white/25 mt-0.5">{a.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aged Inventory Actions */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/60">Aged Actions</span>
              <button className="text-[0.62rem] text-red-400 hover:text-red-300">View All</button>
            </div>
            <div className="space-y-2">
              {[
                { label: '47 units over 60 days', sub: 'At risk of significant aging', color: '#ef4444' },
                { label: '112 units over 30 days', sub: 'Consider pricing adjustments', color: '#f97316' },
                { label: 'Price optimization', sub: '128 units need price review', color: '#1E3A8A' },
              ].map((a, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex-1">
                    <div className="text-[0.68rem] font-semibold" style={{ color: a.color }}>{a.label}</div>
                    <div className="text-[0.6rem] text-white/35 mt-0.5">{a.sub}</div>
                  </div>
                  <button
                    className="shrink-0 px-2 py-1 rounded text-[0.6rem] font-semibold text-white/60 hover:text-white/90 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
