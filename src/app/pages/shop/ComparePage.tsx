import { useMemo } from 'react'
import { useRouter } from '@/app/router'
import {
  BUYER_HUB_INVENTORY,
  type PublicInventoryUnit,
} from '@/domains/buyer-hub/buyerHub.mock'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
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

export function ComparePage() {
  const { navigate } = useRouter()
  const { compareUnitIds, toggleCompare, compareCount, clearCompare } =
    useShoppingState()

  const compareUnits = useMemo(() => {
    return compareUnitIds
      .map((id) => BUYER_HUB_INVENTORY.find((u) => u.id === id))
      .filter((u): u is PublicInventoryUnit => u !== undefined)
  }, [compareUnitIds])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scales size={28} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Compare Vehicles
              {compareCount > 0 && (
                <Badge variant="secondary" className="ml-3 text-sm">
                  {compareCount}
                </Badge>
              )}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Side-by-side comparison of your selected vehicles
            </p>
          </div>
        </div>
        {compareCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompare} className="gap-1.5">
            <Trash size={14} />
            Clear All
          </Button>
        )}
      </div>

      {/* Empty state */}
      {compareUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Scales size={48} className="mb-4 text-muted-foreground/50" weight="thin" />
          <h2 className="text-lg font-semibold">No vehicles to compare</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Save some vehicles first, then add them to compare. You can compare up to 4 vehicles side by side.
          </p>
          <Button className="mt-6 gap-1.5" onClick={() => navigate('/shop')}>
            Browse Inventory
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 font-semibold">Spec</TableHead>
                {compareUnits.map((unit) => (
                  <TableHead key={unit.id} className="min-w-[200px] text-center">
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="h-16 w-24 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={unit.imageUrl || IMAGE_FALLBACK}
                          alt={`${unit.year} ${unit.make} ${unit.model}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = IMAGE_FALLBACK
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {unit.year} {unit.make} {unit.model}
                      </span>
                      <span className="text-xs text-muted-foreground">{unit.trim}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Price */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <CurrencyDollar size={16} className="text-primary" />
                    Price
                  </div>
                </TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center text-base font-bold">
                    {formatPrice(unit.askingPrice)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Mileage */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <Speedometer size={16} className="text-muted-foreground" />
                    Mileage
                  </div>
                </TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    {formatMileage(unit.mileage)} mi
                  </TableCell>
                ))}
              </TableRow>

              {/* Body Style */}
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <Car size={16} className="text-muted-foreground" />
                    Body Style
                  </div>
                </TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    <Badge variant="secondary">{unit.bodyStyle}</Badge>
                  </TableCell>
                ))}
              </TableRow>

              {/* Year */}
              <TableRow>
                <TableCell className="font-medium">Year</TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    {unit.year}
                  </TableCell>
                ))}
              </TableRow>

              {/* Highlights */}
              <TableRow>
                <TableCell className="font-medium align-top">Highlights</TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {unit.highlights.map((h) => (
                        <Badge key={h} variant="outline" className="text-xs font-normal">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell />
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    <Separator className="my-2" />
                  </TableCell>
                ))}
              </TableRow>

              {/* Actions */}
              <TableRow>
                <TableCell className="font-medium">Actions</TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => navigate(`/shop/${unit.id}`)}
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full gap-1.5 text-muted-foreground hover:text-destructive"
                        onClick={() => toggleCompare(unit.id)}
                      >
                        <Trash size={14} />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
