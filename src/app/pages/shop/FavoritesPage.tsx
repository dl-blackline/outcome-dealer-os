import { useMemo } from 'react'
import { useRouter } from '@/app/router'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { type InventoryRecord, useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
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

const IMAGE_FALLBACK = 'https://picsum.photos/seed/placeholder/800/450'

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
  unit: InventoryRecord
  onView: () => void
  onRemove: () => void
  onToggleCompare: () => void
  isComparing: boolean
}) {
  return (
    <Card className="vault-panel vault-edge vault-tap group relative flex flex-col overflow-hidden rounded-3xl border-white/20 bg-black/30 transition-all hover:-translate-y-1 hover:border-blue-200/40">
      <div className="vault-image-frame relative h-52 bg-muted">
        <img
          src={unit.photos[0]?.url || IMAGE_FALLBACK}
          alt={`${unit.year} ${unit.make} ${unit.model} ${unit.trim}`}
          className="vault-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onError={(e) => {
            e.currentTarget.src = IMAGE_FALLBACK
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(3,7,14,0.92))]" />
        <button
          type="button"
          aria-label="Remove from favorites"
          onClick={onRemove}
          className="absolute right-3 top-3 rounded-full border border-white/30 bg-black/35 p-1.5 backdrop-blur transition-colors hover:bg-black/55"
        >
          <HeartBreak className="text-red-400" weight="fill" size={20} />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-base font-semibold text-white">{unit.year} {unit.make} {unit.model}</p>
          <p className="text-xs text-slate-300">{unit.trim}</p>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span className="flex items-center gap-1.5"><Speedometer size={16} />{formatMileage(unit.mileage)} mi</span>
          <Badge className="vault-chip text-[10px] uppercase tracking-[0.14em]">{unit.bodyStyle}</Badge>
        </div>

        {unit.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unit.features.slice(0, 4).map((h) => (
              <Badge key={h} variant="outline" className="border-white/18 bg-white/3 text-xs font-normal text-slate-300">
                {h}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-xl font-bold tracking-tight text-white">
          <CurrencyDollar size={20} weight="bold" className="text-blue-200" />
          {formatPrice(unit.price).replace('$', '')}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button size="sm" onClick={onView} className="vault-btn vault-tap flex-1 gap-1.5 rounded-full text-xs uppercase tracking-[0.13em]">
            View Details
            <ArrowRight size={14} />
          </Button>
          <Button
            size="sm"
            variant={isComparing ? 'secondary' : 'outline'}
            onClick={onToggleCompare}
            className="vault-btn-muted vault-tap gap-1.5 rounded-full text-xs uppercase tracking-[0.13em]"
          >
            <Scales size={14} />
            {isComparing ? 'Comparing' : 'Compare'}
          </Button>
          <Button size="icon" variant="ghost" onClick={onRemove} className="text-slate-400 hover:text-red-400" aria-label="Remove from favorites">
            <Trash size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function FavoritesPage() {
  const { navigate } = useRouter()
  const { publicRecords } = useInventoryCatalog()
  const {
    savedUnitIds,
    compareCount,
    toggleSaved,
    toggleCompare,
    isComparing,
    savedCount,
  } = useShoppingState()

  const savedUnits = useMemo(() => {
    return savedUnitIds
      .map((id) => publicRecords.find((u) => u.id === id))
      .filter((u): u is InventoryRecord => u !== undefined)
  }, [publicRecords, savedUnitIds])

  return (
    <div className="mx-auto max-w-[88rem] space-y-6 px-2 py-4 sm:px-3 lg:px-4">
      <div className="vault-panel-soft rounded-4xl border border-white/15 p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <Heart size={28} weight="fill" className="text-red-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Saved Vehicles
              {savedCount > 0 && (
                <Badge className="vault-chip ml-3 text-sm">{savedCount}</Badge>
              )}
            </h1>
            <p className="mt-1 text-slate-300">Vehicles you've saved for later</p>
          </div>
        </div>
      </div>

      {savedUnits.length === 0 ? (
        <div className="vault-panel-soft flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/30 py-16 text-center">
          <Heart size={48} className="mb-4 text-slate-500" weight="thin" />
          <h2 className="text-lg font-semibold text-white">No saved vehicles yet</h2>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Browse our inventory to save vehicles you love. Tap the heart icon on any vehicle to add it here.
          </p>
          <Button className="vault-btn vault-tap mt-6 gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.13em]" onClick={() => navigate('/shop')}>
            Browse Inventory
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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

          {compareCount > 0 && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
              <Button size="lg" className="vault-btn vault-tap gap-2 rounded-full px-6 text-xs uppercase tracking-[0.13em]" onClick={() => navigate('/compare')}>
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
