import { useMemo } from 'react'
import { useRouter } from '@/app/router'
import {
  BUYER_HUB_INVENTORY,
  type PublicInventoryUnit,
} from '@/domains/buyer-hub/buyerHub.mock'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Heart,
  HeartBreak,
  Scales,
  Trash,
  ArrowRight,
  CurrencyDollar,
  Speedometer,
} from '@phosphor-icons/react'

const IMAGE_FALLBACK = '/inventory/national-car-mart/placeholder.jpg'

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

function FavoriteCard({
  unit,
  onView,
  onRemove,
  onToggleCompare,
  isComparing,
}: {
  unit: PublicInventoryUnit
  onView: () => void
  onRemove: () => void
  onToggleCompare: () => void
  isComparing: boolean
}) {
  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-48 bg-muted">
        <img
          src={unit.imageUrl || IMAGE_FALLBACK}
          alt={`${unit.year} ${unit.make} ${unit.model} ${unit.trim}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = IMAGE_FALLBACK
          }}
        />
        <button
          type="button"
          aria-label="Remove from favorites"
          onClick={onRemove}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 backdrop-blur transition-colors hover:bg-red-50"
        >
          <HeartBreak className="text-red-500" weight="fill" size={20} />
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

        {/* Price */}
        <div className="flex items-center gap-1 text-xl font-bold tracking-tight">
          <CurrencyDollar size={20} weight="bold" className="text-primary" />
          {formatPrice(unit.askingPrice).replace('$', '')}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button size="sm" onClick={onView} className="flex-1 gap-1.5">
            View Details
            <ArrowRight size={14} />
          </Button>
          <Button
            size="sm"
            variant={isComparing ? 'secondary' : 'outline'}
            onClick={onToggleCompare}
            className="gap-1.5"
          >
            <Scales size={14} />
            {isComparing ? 'Comparing' : 'Compare'}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove from favorites"
          >
            <Trash size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function FavoritesPage() {
  const { navigate } = useRouter()
  const {
    savedUnitIds,
    compareUnitIds,
    toggleSaved,
    toggleCompare,
    isComparing,
    savedCount,
    compareCount,
  } = useShoppingState()

  const savedUnits = useMemo(() => {
    return savedUnitIds
      .map((id) => BUYER_HUB_INVENTORY.find((u) => u.id === id))
      .filter((u): u is PublicInventoryUnit => u !== undefined)
  }, [savedUnitIds])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart size={28} weight="fill" className="text-red-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Saved Vehicles
              {savedCount > 0 && (
                <Badge variant="secondary" className="ml-3 text-sm">
                  {savedCount}
                </Badge>
              )}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Vehicles you&apos;ve saved for later
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {savedUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Heart size={48} className="mb-4 text-muted-foreground/50" weight="thin" />
          <h2 className="text-lg font-semibold">No saved vehicles yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Browse our inventory to save vehicles you love. Tap the heart icon on any vehicle to add it here.
          </p>
          <Button className="mt-6 gap-1.5" onClick={() => navigate('/shop')}>
            Browse Inventory
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <>
          {/* Vehicle grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedUnits.map((unit) => (
              <FavoriteCard
                key={unit.id}
                unit={unit}
                onView={() => navigate(`/shop/${unit.id}`)}
                onRemove={() => toggleSaved(unit.id)}
                onToggleCompare={() => toggleCompare(unit.id)}
                isComparing={isComparing(unit.id)}
              />
            ))}
          </div>

          {/* Floating compare button */}
          {compareCount > 0 && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
              <Button
                size="lg"
                className="gap-2 shadow-lg"
                onClick={() => navigate('/compare')}
              >
                <Scales size={18} />
                Compare Selected ({compareCount})
                <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
