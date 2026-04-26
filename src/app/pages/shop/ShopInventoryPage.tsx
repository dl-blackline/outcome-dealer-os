import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { type InventoryRecord, useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { setSelectedUnit } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { isPlaceholderUrl } from '@/domains/inventory-photo/inventoryPhoto.placeholder'
import { DEALER } from '@/lib/dealer.constants'
import {
  MagnifyingGlass,
  SlidersHorizontal,
  Heart,
  Car,
  CaretDown,
  CaretRight,
} from '@phosphor-icons/react'

type BodyFilter = 'All' | string
type MakeFilter = 'All' | string
type PriceRange = 'All' | 'Under $20k' | '$20k–$30k' | '$30k–$50k' | 'Over $50k'
type SortOption = 'Newest' | 'Price Low-High' | 'Price High-Low' | 'Mileage'

const PRICE_OPTIONS: PriceRange[] = ['All', 'Under $20k', '$20k–$30k', '$30k–$50k', 'Over $50k']
const SORT_OPTIONS: SortOption[] = ['Newest', 'Price Low-High', 'Price High-Low', 'Mileage']

type BadgeType = 'new' | 'value' | 'family' | null
const BADGE_LABELS: Record<'new' | 'value' | 'family', string> = {
  new: 'New Arrival',
  value: 'Great Value',
  family: 'Family Favorite',
}
const BADGE_CLASSES: Record<'new' | 'value' | 'family', string> = {
  new: 'ncm-badge-new',
  value: 'ncm-badge-value',
  family: 'ncm-badge-family',
}

function getBadge(idx: number, daysInStock: number): BadgeType {
  if (daysInStock <= 7) return 'new'
  if (idx % 3 === 1) return 'value'
  if (idx % 3 === 2) return 'family'
  return 'new'
}

function matchesSearch(unit: InventoryRecord, q: string) {
  if (!q) return true
  const hay = `${unit.year} ${unit.make} ${unit.model} ${unit.trim} ${unit.stockNumber || ''} ${unit.vin || ''}`.toLowerCase()
  return q.toLowerCase().split(/\s+/).every((t) => hay.includes(t))
}
function matchesBody(unit: InventoryRecord, f: BodyFilter) { return f === 'All' || unit.bodyStyle === f }
function matchesMake(unit: InventoryRecord, f: MakeFilter) { return f === 'All' || unit.make === f }
function matchesPrice(unit: InventoryRecord, r: PriceRange) {
  switch (r) {
    case 'Under $20k': return unit.price < 20_000
    case '$20k–$30k': return unit.price >= 20_000 && unit.price <= 30_000
    case '$30k–$50k': return unit.price >= 30_000 && unit.price <= 50_000
    case 'Over $50k': return unit.price > 50_000
    default: return true
  }
}
function sortUnits(units: InventoryRecord[], s: SortOption) {
  const arr = [...units]
  switch (s) {
    case 'Newest': return arr.sort((a, b) => b.year - a.year || a.daysInStock - b.daysInStock)
    case 'Price Low-High': return arr.sort((a, b) => a.price - b.price)
    case 'Price High-Low': return arr.sort((a, b) => b.price - a.price)
    case 'Mileage': return arr.sort((a, b) => a.mileage - b.mileage)
    default: return arr
  }
}
function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function fmtMi(n: number) { return new Intl.NumberFormat('en-US').format(n) }
function monthly(price: number) {
  return Math.round(computePaymentEstimate({ vehiclePrice: price, downPayment: 0, tradeValue: 0, termMonths: 72, interestRate: 6.9 }).monthlyPayment)
}

function NcmInventoryCard({
  unit, idx, onView, onApprove, isSaved, onToggleSaved,
}: {
  unit: InventoryRecord; idx: number
  onView: () => void; onApprove: () => void
  isSaved: boolean; onToggleSaved: () => void
}) {
  const badge = getBadge(idx, unit.daysInStock ?? 99)
  const photoUrl = unit.photos[0]?.url
  const hasRealPhoto = !!photoUrl && !isPlaceholderUrl(photoUrl)
  const mo = monthly(unit.price)

  return (
    <div className="ncm-inventory-card">
      {/* Photo area */}
      <div style={{ position: 'relative', height: '180px', background: '#111118', overflow: 'hidden' }}>
        {hasRealPhoto ? (
          <InventoryPhotoImage
            record={unit}
            alt={`${unit.year} ${unit.make} ${unit.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #111118, #1a1a28)' }}>
            <Car size={40} style={{ color: '#2a2a40' }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.85) 100%)' }} />

        {badge && (
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <span className={BADGE_CLASSES[badge]}>{BADGE_LABELS[badge]}</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSaved() }}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
          aria-label={isSaved ? 'Remove from saved' : 'Save vehicle'}
        >
          <Heart size={14} style={{ color: isSaved ? '#f03030' : '#c8d4f0' }} weight={isSaved ? 'fill' : 'regular'} />
        </button>
      </div>

      {/* Details */}
      <div style={{ padding: '0.85rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.6rem', fontWeight: 600, color: '#8898b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {unit.year} {unit.make}
          </div>
          <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontSize: '1.05rem', fontWeight: 800, color: '#f0f2f8', textTransform: 'uppercase', lineHeight: 1.1, marginTop: '0.1rem' }}>
            {unit.model} {unit.trim}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8898b8', fontSize: '0.7rem', fontFamily: 'Barlow, Manrope, sans-serif' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m12 6 0 6 4 2"/></svg>
          {fmtMi(unit.mileage)} MILES
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
          <div>
            <div className="ncm-price" style={{ fontSize: '1.5rem' }}>{fmt(unit.price)}</div>
            <div className="ncm-monthly" style={{ fontSize: '0.72rem' }}>${mo} <span style={{ color: '#6678a0', fontWeight: 400 }}>/mo*</span></div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            onClick={onView}
            className="ncm-btn-outline"
            style={{ flex: 1, borderRadius: '4px', padding: '0.5rem 0.5rem', fontSize: '0.68rem', justifyContent: 'center' }}
          >
            View Details
          </button>
          <button
            onClick={onApprove}
            className="ncm-btn-red"
            style={{ flex: 1, borderRadius: '4px', padding: '0.5rem 0.5rem', fontSize: '0.68rem', justifyContent: 'center' }}
          >
            Get Approved
          </button>
        </div>
      </div>
    </div>
  )
}

export function ShopInventoryPage() {
  const { navigate } = useRouter()
  const { isSaved, toggleSaved } = useShoppingState()
  const { publicRecords, loading } = useInventoryCatalog()

  const [search, setSearch] = useState('')
  const [makeFilter, setMakeFilter] = useState<MakeFilter>('All')
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('All')
  const [priceRange, setPriceRange] = useState<PriceRange>('All')
  const [sort, setSort] = useState<SortOption>('Newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [openFilterGroup, setOpenFilterGroup] = useState<string | null>('body')

  const bodyOptions = useMemo<BodyFilter[]>(
    () => ['All', ...Array.from(new Set(publicRecords.filter((u) => u.available).map((u) => u.bodyStyle).filter(Boolean))).sort()],
    [publicRecords],
  )
  const makeOptions = useMemo<MakeFilter[]>(
    () => ['All', ...Array.from(new Set(publicRecords.filter((u) => u.available).map((u) => u.make).filter(Boolean))).sort()],
    [publicRecords],
  )

  const results = useMemo(() => {
    const filtered = publicRecords.filter(
      (u) => u.available && matchesSearch(u, search) && matchesMake(u, makeFilter) && matchesBody(u, bodyFilter) && matchesPrice(u, priceRange),
    )
    return sortUnits(filtered, sort)
  }, [publicRecords, search, makeFilter, bodyFilter, priceRange, sort])

  function clearAll() {
    setSearch('')
    setMakeFilter('All')
    setBodyFilter('All')
    setPriceRange('All')
    setSort('Newest')
  }

  if (loading) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8898b8', fontFamily: 'Barlow, Manrope, sans-serif' }}>Loading inventory…</p>
      </div>
    )
  }

  const FilterRail = (
    <aside className="ncm-filter-rail" style={{ padding: '1.5rem 1rem', width: '240px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f2f8' }}>
          Refine Your Search
        </span>
        <button
          onClick={clearAll}
          style={{ fontSize: '0.72rem', color: '#3b82f6', fontFamily: 'Barlow, Manrope, sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Clear All
        </button>
      </div>

      {/* Body Style */}
      <FilterGroup
        title="Body Style"
        open={openFilterGroup === 'body'}
        onToggle={() => setOpenFilterGroup((p) => p === 'body' ? null : 'body')}
        currentValue={bodyFilter === 'All' ? 'Any Body Style' : bodyFilter}
      >
        {bodyOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setBodyFilter(opt)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0',
              fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', cursor: 'pointer',
              color: bodyFilter === opt ? '#f03030' : '#c8d4f0',
              background: 'none', border: 'none',
              borderLeft: bodyFilter === opt ? '2px solid #d41a1a' : '2px solid transparent',
              paddingLeft: '0.5rem',
            }}
          >
            {opt}
          </button>
        ))}
      </FilterGroup>

      {/* Make */}
      <FilterGroup
        title="Make"
        open={openFilterGroup === 'make'}
        onToggle={() => setOpenFilterGroup((p) => p === 'make' ? null : 'make')}
        currentValue={makeFilter === 'All' ? 'Any Make' : makeFilter}
      >
        {makeOptions.slice(0, 20).map((opt) => (
          <button
            key={opt}
            onClick={() => setMakeFilter(opt)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0',
              fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', cursor: 'pointer',
              color: makeFilter === opt ? '#f03030' : '#c8d4f0',
              background: 'none', border: 'none',
              borderLeft: makeFilter === opt ? '2px solid #d41a1a' : '2px solid transparent',
              paddingLeft: '0.5rem',
            }}
          >
            {opt}
          </button>
        ))}
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup
        title="Price Range"
        open={openFilterGroup === 'price'}
        onToggle={() => setOpenFilterGroup((p) => p === 'price' ? null : 'price')}
        currentValue={priceRange === 'All' ? 'Any Price' : priceRange}
      >
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setPriceRange(opt)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0',
              fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', cursor: 'pointer',
              color: priceRange === opt ? '#f03030' : '#c8d4f0',
              background: 'none', border: 'none',
              borderLeft: priceRange === opt ? '2px solid #d41a1a' : '2px solid transparent',
              paddingLeft: '0.5rem',
            }}
          >
            {opt}
          </button>
        ))}
      </FilterGroup>

      {/* Apply */}
      <button
        className="ncm-btn-blue"
        style={{ width: '100%', marginTop: '1.5rem', borderRadius: '4px', justifyContent: 'center', fontSize: '0.78rem' }}
      >
        Apply Filters ({results.length})
        <SlidersHorizontal size={13} />
      </button>
    </aside>
  )

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Page hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #080810 0%, #0e0e1a 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '2.5rem 0 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,26,26,0.4), transparent)', pointerEvents: 'none' }} />
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: '#8898b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            PREMIUM PRE-OWNED VEHICLES &nbsp;◆&nbsp; FAST APPROVALS &nbsp;◆&nbsp; CLEVELAND CONFIDENCE
          </div>
          <h1
            style={{
              fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#f0f2f8',
              lineHeight: 1,
              marginBottom: '1.25rem',
            }}
          >
            Find Your Next Drive
          </h1>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px',
                background: '#0d0d15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                padding: '0 0.75rem',
              }}
            >
              <MagnifyingGlass size={16} style={{ color: '#8898b8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by Make, Model, or Keyword"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1, height: '42px', background: 'transparent', border: 'none', outline: 'none',
                  color: '#f0f2f8', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.85rem',
                }}
              />
            </div>

            <select
              value={bodyFilter}
              onChange={(e) => setBodyFilter(e.target.value)}
              style={{
                height: '44px', background: '#0d0d15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                color: '#c8d4f0', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.82rem',
                padding: '0 1rem', minWidth: '160px', cursor: 'pointer',
              }}
            >
              {bodyOptions.map((o) => <option key={o} value={o}>{o === 'All' ? 'All Body Styles' : o}</option>)}
            </select>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as PriceRange)}
              style={{
                height: '44px', background: '#0d0d15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                color: '#c8d4f0', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.82rem',
                padding: '0 1rem', minWidth: '140px', cursor: 'pointer',
              }}
            >
              {PRICE_OPTIONS.map((o) => <option key={o} value={o}>{o === 'All' ? 'Max Price' : o}</option>)}
            </select>

            <button
              onClick={() => document.querySelector('.ncm-filter-rail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="ncm-btn-blue"
              style={{ borderRadius: '4px', height: '44px', gap: '0.5rem' }}
            >
              SEARCH INVENTORY <MagnifyingGlass size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Content area — filter rail + grid */}
      <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>

        {/* Filter rail (desktop) */}
        <div className="hidden lg:block" style={{ position: 'sticky', top: '64px', alignSelf: 'flex-start', paddingTop: '1.5rem' }}>
          {FilterRail}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, padding: '1.5rem 0 1.5rem 1.5rem' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Result count */}
              <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.85rem' }}>
                <span style={{ color: '#d41a1a', fontWeight: 800, fontSize: '1rem' }}>{results.length}</span>
                <span style={{ color: '#8898b8', marginLeft: '0.4rem' }}>VEHICLES FOUND</span>
              </div>

              {/* Badge filter chips */}
              {(['new', 'value', 'family'] as const).map((b) => (
                <span key={b} className={BADGE_CLASSES[b]} style={{ cursor: 'pointer', fontSize: '0.65rem', padding: '0.25rem 0.7rem', borderRadius: '3px' }}>
                  {b === 'new' ? '✦' : b === 'value' ? '⭐' : '♥'} {BADGE_LABELS[b]}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Mobile filter button */}
              <button
                onClick={() => setShowMobileFilters((p) => !p)}
                className="lg:hidden ncm-btn-outline"
                style={{ borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.72rem', gap: '0.4rem' }}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>

              {/* Sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#8898b8' }}>SORT BY:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  style={{
                    height: '34px', background: '#111118', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px',
                    color: '#f0f2f8', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem',
                    padding: '0 0.75rem', cursor: 'pointer',
                  }}
                >
                  {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile filter panel */}
          {showMobileFilters && (
            <div className="lg:hidden" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', marginBottom: '1rem', padding: '1rem' }}>
              {/* Body style */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8898b8', marginBottom: '0.5rem' }}>Body Style</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {bodyOptions.map((opt) => (
                    <button key={opt} onClick={() => setBodyFilter(opt)}
                      style={{
                        padding: '0.3rem 0.75rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer',
                        fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                        background: bodyFilter === opt ? 'rgba(212,26,26,0.2)' : 'rgba(255,255,255,0.04)',
                        border: bodyFilter === opt ? '1px solid rgba(212,26,26,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: bodyFilter === opt ? '#f03030' : '#c8d4f0',
                      }}
                    >{opt}</button>
                  ))}
                </div>
              </div>
              {/* Price range */}
              <div>
                <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8898b8', marginBottom: '0.5rem' }}>Price Range</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {PRICE_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => setPriceRange(opt)}
                      style={{
                        padding: '0.3rem 0.75rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer',
                        fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 600,
                        background: priceRange === opt ? 'rgba(212,26,26,0.2)' : 'rgba(255,255,255,0.04)',
                        border: priceRange === opt ? '1px solid rgba(212,26,26,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: priceRange === opt ? '#f03030' : '#c8d4f0',
                      }}
                    >{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8898b8' }}>
              <MagnifyingGlass size={40} style={{ margin: '0 auto 1rem', color: '#2a2a40' }} />
              <p style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', color: '#c8d4f0', marginBottom: '0.5rem' }}>No vehicles match your search</p>
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.85rem' }}>Try adjusting your filters or search terms.</p>
              <button onClick={clearAll} className="ncm-btn-red" style={{ marginTop: '1rem', borderRadius: '4px' }}>Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((unit, idx) => (
                <NcmInventoryCard
                  key={unit.id}
                  unit={unit}
                  idx={idx}
                  onView={() => { setSelectedUnit(unit.id, 'shop'); navigate(`/shop/${unit.id}`) }}
                  onApprove={() => { setSelectedUnit(unit.id, 'finance'); navigate('/finance/apply') }}
                  isSaved={isSaved(unit.id)}
                  onToggleSaved={() => toggleSaved(unit.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Finance strip at bottom */}
      <section style={{ background: '#0d0d15', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {/* Financing for every drive */}
            <div style={{ padding: '1.5rem 1.5rem 1.5rem 0' }}>
              <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f0f2f8', marginBottom: '0.5rem' }}>
                Financing For <span style={{ color: '#d41a1a' }}>Every</span> Drive
              </div>
              <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', color: '#8898b8', marginBottom: '0.75rem' }}>
                Bad Credit? No Credit? We Can Help!
              </div>
              {['Low Down Payments', 'Flexible Terms', 'Fast Decisions'].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c8d4f0', fontSize: '0.75rem', fontFamily: 'Barlow, Manrope, sans-serif', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#3b82f6' }}>✓</span>{i}
                </div>
              ))}
            </div>

            {/* Get pre-approved */}
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,26,26,0.12)', border: '1px solid rgba(212,26,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d41a1a" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f0f2f8' }}>Get Pre-Approved</div>
                <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#8898b8', marginTop: '0.2rem' }}>Takes 60 Seconds · Won't Affect Your Credit</div>
              </div>
              <button onClick={() => navigate('/finance/apply')} className="ncm-btn-red" style={{ borderRadius: '4px', fontSize: '0.72rem', padding: '0.5rem 1rem', gap: '0.3rem' }}>
                GET STARTED <CaretRight size={11} weight="bold" />
              </button>
            </div>

            {/* Call us */}
            <div style={{ padding: '1.5rem 0 1.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,26,26,0.12)', border: '1px solid rgba(212,26,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d41a1a" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.08 1.2 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f0f2f8' }}>Call Us Today</div>
                <a href={DEALER.phoneTel} style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0f2f8', letterSpacing: '0.04em' }}>
                  {DEALER.phone}
                </a>
                <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.7rem', color: '#8898b8', marginTop: '0.15rem' }}>
                  Mon–Sat: 9AM–8PM &nbsp;|&nbsp; Sunday: 11AM–5PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FilterGroup({ title, currentValue, open, onToggle, children }: {
  title: string; currentValue: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0.65rem 0', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f2f8' }}>{title}</div>
          <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#6678a0', marginTop: '0.1rem' }}>{currentValue}</div>
        </div>
        <CaretDown size={13} style={{ color: '#8898b8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
      </button>
      {open && <div style={{ paddingBottom: '0.75rem' }}>{children}</div>}
    </div>
  )
}
