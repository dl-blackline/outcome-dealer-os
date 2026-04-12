import { useState, useMemo } from 'react'
import { useRouter } from '@/app/router'
import {
  BUYER_HUB_INVENTORY,
  type PublicInventoryUnit,
} from '@/domains/buyer-hub/buyerHub.mock'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MagnifyingGlass,
  Funnel,
  Heart,
  SortAscending,
  Speedometer,
  CurrencyDollar,
  Car,
} from '@phosphor-icons/react'

type BodyFilter = 'All' | 'Sedan' | 'Truck' | 'SUV'
type PriceRange = 'All' | 'Under $30k' | '$30k–$50k' | 'Over $50k'
type SortOption = 'Newest' | 'Price Low-High' | 'Price High-Low' | 'Mileage'

const BODY_OPTIONS: BodyFilter[] = ['All', 'Sedan', 'Truck', 'SUV']
const PRICE_OPTIONS: PriceRange[] = ['All', 'Under $30k', '$30k–$50k', 'Over $50k']
const SORT_OPTIONS: SortOption[] = ['Newest', 'Price Low-High', 'Price High-Low', 'Mileage']

function matchesSearch(unit: PublicInventoryUnit, query: string): boolean {
  if (!query) return true
  const haystack =
    `${unit.year} ${unit.make} ${unit.model} ${unit.trim}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token))
}

function matchesBody(unit: PublicInventoryUnit, filter: BodyFilter): boolean {
  return filter === 'All' || unit.bodyStyle === filter
}

function matchesPrice(unit: PublicInventoryUnit, range: PriceRange): boolean {
  switch (range) {
    case 'Under $30k':
      return unit.askingPrice < 30_000
    case '$30k–$50k':
      return unit.askingPrice >= 30_000 && unit.askingPrice <= 50_000
    case 'Over $50k':
      return unit.askingPrice > 50_000
    default:
      return true
  }
}

function sortUnits(units: PublicInventoryUnit[], sort: SortOption): PublicInventoryUnit[] {
  const sorted = [...units]
  switch (sort) {
    case 'Newest':
      return sorted.sort((a, b) => b.year - a.year || a.daysInStock - b.daysInStock)
    case 'Price Low-High':
      return sorted.sort((a, b) => a.askingPrice - b.askingPrice)
    case 'Price High-Low':
      return sorted.sort((a, b) => b.askingPrice - a.askingPrice)
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
}: {
  unit: PublicInventoryUnit
  onView: () => void
}) {
  const [saved, setSaved] = useState(false)

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image placeholder */}
      <div className="relative flex h-48 items-center justify-center bg-muted">
        <Car className="h-16 w-16 text-muted-foreground/40" weight="thin" />
        <button
          type="button"
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
          onClick={() => setSaved((p) => !p)}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 backdrop-blur transition-colors hover:bg-white"
        >
          <Heart
            className={saved ? 'text-red-500' : 'text-neutral-400'}
            weight={saved ? 'fill' : 'regular'}
            size={20}
          />
        </button>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        {/* Title + body badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight">
            {unit.year} {unit.make} {unit.model}{' '}
            <span className="font-normal text-muted-foreground">{unit.trim}</span>
          </h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {unit.bodyStyle}
          </Badge>
        </div>

        {/* Mileage */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Speedometer size={16} />
          <span>{formatMileage(unit.mileage)} mi</span>
        </div>

        {/* Highlights */}
        {unit.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unit.highlights.map((h) => (
              <Badge key={h} variant="outline" className="text-xs font-normal">
                {h}
              </Badge>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-center gap-1 text-xl font-bold tracking-tight">
            <CurrencyDollar size={20} weight="bold" className="text-primary" />
            {formatPrice(unit.askingPrice).replace('$', '')}
          </div>
          <Button size="sm" onClick={onView}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ShopInventoryPage() {
  const { navigate } = useRouter()

  const [search, setSearch] = useState('')
  const [bodyFilter, setBodyFilter] = useState<BodyFilter>('All')
  const [priceRange, setPriceRange] = useState<PriceRange>('All')
  const [sort, setSort] = useState<SortOption>('Newest')
  const [showFilters, setShowFilters] = useState(false)

  const results = useMemo(() => {
    const filtered = BUYER_HUB_INVENTORY.filter(
      (u) =>
        u.available &&
        matchesSearch(u, search) &&
        matchesBody(u, bodyFilter) &&
        matchesPrice(u, priceRange),
    )
    return sortUnits(filtered, sort)
  }, [search, bodyFilter, priceRange, sort])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Inventory</h1>
        <p className="mt-1 text-muted-foreground">
          Find your next vehicle from our curated selection
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search by year, make, model, or trim…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-10 text-base"
        />
      </div>

      {/* Filter toggle (mobile) + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((p) => !p)}
          className="gap-1.5"
        >
          <Funnel size={16} />
          Filters
        </Button>

        <div className="flex items-center gap-2">
          <SortAscending size={16} className="text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
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
        <div className="space-y-4 rounded-lg border bg-card p-4">
          {/* Body style chips */}
          <div>
            <p className="mb-2 text-sm font-medium">Body Style</p>
            <div className="flex flex-wrap gap-2">
              {BODY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBodyFilter(opt)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    bodyFilter === opt
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-accent'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Price range chips */}
          <div>
            <p className="mb-2 text-sm font-medium">Price Range</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPriceRange(opt)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    priceRange === opt
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-accent'
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
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-semibold text-foreground">{results.length}</span>{' '}
        vehicle{results.length !== 1 ? 's' : ''}
      </p>

      {/* Grid or empty state */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <MagnifyingGlass size={48} className="mb-4 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">No vehicles match your search</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((unit) => (
            <InventoryCard
              key={unit.id}
              unit={unit}
              onView={() => navigate(`/shop/${unit.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
