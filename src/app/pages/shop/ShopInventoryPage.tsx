import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { type InventoryRecord, useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { setSelectedUnit } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import {
  MagnifyingGlass,
  SlidersHorizontal,
  Heart,
  SortAscending,
  Speedometer,
  CurrencyDollar,
  Sparkle,
} from '@phosphor-icons/react'

type BodyFilter = 'All' | string
type PriceRange = 'All' | 'Under $30k' | '$30k–$50k' | 'Over $50k'
type SortOption = 'Newest' | 'Price Low-High' | 'Price High-Low' | 'Mileage'

const PRICE_OPTIONS: PriceRange[] = ['All', 'Under $30k', '$30k–$50k', 'Over $50k']
const SORT_OPTIONS: SortOption[] = ['Newest', 'Price Low-High', 'Price High-Low', 'Mileage']

function matchesSearch(unit: InventoryRecord, query: string): boolean {
  if (!query) return true
  const haystack =
    `${unit.year} ${unit.make} ${unit.model} ${unit.trim} ${unit.stockNumber || ''} ${unit.vin || ''}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token))
}

function matchesBody(unit: InventoryRecord, filter: BodyFilter): boolean {
  return filter === 'All' || unit.bodyStyle === filter
}

function matchesPrice(unit: InventoryRecord, range: PriceRange): boolean {
  switch (range) {
    case 'Under $30k':
      return unit.price < 30_000
    case '$30k–$50k':
      return unit.price >= 30_000 && unit.price <= 50_000
    case 'Over $50k':
      return unit.price > 50_000
    default:
      return true
  }
}

function sortUnits(units: InventoryRecord[], sort: SortOption): InventoryRecord[] {
  const sorted = [...units]
  switch (sort) {
    case 'Newest':
      return sorted.sort((a, b) => b.year - a.year || a.daysInStock - b.daysInStock)
    case 'Price Low-High':
      return sorted.sort((a, b) => a.price - b.price)
    case 'Price High-Low':
      return sorted.sort((a, b) => b.price - a.price)
    case 'Mileage':
      return sorted.sort((a, b) => a.mileage - b.mileage)
    default:
      return sorted
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage)
}

function InventoryCard({
  unit,
  onView,
  isSaved,
  onToggleSaved,
}: {
  unit: InventoryRecord
  onView: () => void
  isSaved: boolean
  onToggleSaved: () => void
}) {
  return (
    <Card className="vault-panel vault-edge group relative flex flex-col overflow-hidden rounded-3xl border-white/20 bg-black/30 transition-all hover:-translate-y-1 hover:border-blue-200/40">
      <div className="vault-image-frame relative h-56 bg-muted">
        <InventoryPhotoImage
          record={unit}
          alt={`${unit.year} ${unit.make} ${unit.model} ${unit.trim}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(3,7,14,0.9))]" />
        <button
          type="button"
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          onClick={onToggleSaved}
          className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/35 p-1.5 backdrop-blur transition-colors hover:bg-black/55"
        >
          <Heart
            className={isSaved ? 'text-red-400' : 'text-slate-300'}
            weight={isSaved ? 'fill' : 'regular'}
            size={20}
          />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-white">
            {unit.year} {unit.make} {unit.model}
          </p>
          <Badge className="vault-chip rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em]">
            {unit.bodyStyle}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        {/* Title + body badge */}
        <div>
          <h3 className="text-lg font-semibold leading-tight text-white">
            {unit.trim}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
            Stock {unit.stockNumber || 'Pending'}
          </p>
        </div>

        {/* Mileage */}
        <div className="flex items-center gap-1.5 text-sm text-slate-300">
          <Speedometer size={16} />
          <span>{formatMileage(unit.mileage)} mi</span>
        </div>

        {/* Highlights */}
        {unit.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unit.features.slice(0, 4).map((h) => (
              <Badge key={h} variant="outline" className="border-white/18 bg-white/3 text-xs font-normal text-slate-300">
                {h}
              </Badge>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-1 text-2xl font-bold tracking-tight text-white">
            <CurrencyDollar size={20} weight="bold" className="text-blue-200" />
            {formatPrice(unit.price).replace('$', '')}
          </div>
          <Button size="sm" onClick={onView} className="vault-btn rounded-full px-4 text-[11px] uppercase tracking-[0.13em]">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ShopInventoryPage() {
  const { navigate } = useRouter()
  const { isSaved, toggleSaved } = useShoppingState()
  const { publicRecords, loading } = useInventoryCatalog()

  const [search, setSearch] = useState('')
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('All')
  const [priceRange, setPriceRange] = useState<PriceRange>('All')
  const [sort, setSort] = useState<SortOption>('Newest')
  const [showFilters, setShowFilters] = useState(false)
  const bodyOptions = useMemo<BodyFilter[]>(
    () => [
      'All',
      ...Array.from(
        new Set(
          publicRecords.filter((unit) => unit.available)
            .map((unit) => unit.bodyStyle)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [publicRecords],
  )

  const results = useMemo(() => {
    const filtered = publicRecords.filter(
      (u) =>
        u.available &&
        matchesSearch(u, search) &&
        matchesBody(u, bodyFilter) &&
        matchesPrice(u, priceRange),
    )
    return sortUnits(filtered, sort)
  }, [publicRecords, search, bodyFilter, priceRange, sort])

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading inventory…</div>
  }

  return (
    <div className="mx-auto max-w-[88rem] space-y-7 px-2 py-4 sm:px-3 lg:px-4">
      {/* Header */}
      <div className="vault-panel-soft rounded-[1.8rem] border border-white/15 p-7 sm:p-8">
        <p className="vault-title text-[0.62rem] text-slate-400">Vehicle Vault Collection</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Browse Secured Premium Inventory</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Search by make, trim, or stock number and explore each unit through a curated, high-definition vault display.
        </p>
      </div>

      {/* Search bar */}
      <div className="vault-panel-soft relative rounded-2xl border border-white/15 p-2">
        <MagnifyingGlass
          className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search by year, make, model, or trim…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 border-none bg-transparent pl-12 text-base text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {/* Filter toggle (mobile) + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-black/25 p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((p) => !p)}
          className="vault-btn-muted gap-1.5 rounded-full px-4 text-xs uppercase tracking-[0.12em]"
        >
          <SlidersHorizontal size={16} />
          Filters
        </Button>

        <div className="flex items-center gap-2 text-slate-300">
          <SortAscending size={16} className="text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-10 rounded-full border border-white/18 bg-white/3 px-4 text-xs uppercase tracking-[0.14em] text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200/40"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter controls */}
      {showFilters && (
        <div className="vault-panel-soft space-y-5 rounded-2xl p-5">
          {/* Body style chips */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">Body Style</p>
            <div className="flex flex-wrap gap-2">
              {bodyOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBodyFilter(opt)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                    bodyFilter === opt
                      ? 'border-blue-200/45 bg-blue-300/20 text-blue-100'
                      : 'border-white/15 bg-white/3 text-slate-300 hover:border-white/35 hover:bg-white/8'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Price range chips */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-200">Price Range</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPriceRange(opt)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] transition-colors ${
                    priceRange === opt
                      ? 'border-blue-200/45 bg-blue-300/20 text-blue-100'
                      : 'border-white/15 bg-white/3 text-slate-300 hover:border-white/35 hover:bg-white/8'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="flex items-center gap-2 text-sm text-slate-300">
        <Sparkle size={15} className="text-blue-200" />
        Showing <span className="font-semibold text-white">{results.length}</span>{' '}
        vehicle{results.length !== 1 ? 's' : ''}
      </p>

      {/* Grid or empty state */}
      {results.length === 0 ? (
        <div className="vault-panel-soft flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 py-16 text-center">
          <MagnifyingGlass size={48} className="mb-4 text-slate-500" />
          <h2 className="text-lg font-semibold text-white">No vehicles match your search</h2>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your filters or search terms
          </p>
          <Button
            variant="outline"
            size="sm"
            className="vault-btn-muted mt-4 rounded-full px-5 text-xs uppercase tracking-[0.13em]"
            onClick={() => {
              setSearch('')
              setBodyFilter('All')
              setPriceRange('All')
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((unit) => (
            <InventoryCard
              key={unit.id}
              unit={unit}
              onView={() => {
                setSelectedUnit(unit.id, 'shop')
                navigate(`/shop/${unit.id}`)
              }}
              isSaved={isSaved(unit.id)}
              onToggleSaved={() => toggleSaved(unit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
