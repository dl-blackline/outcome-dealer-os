import { useMemo } from 'react'
import { useRouter } from '@/app/router'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { type InventoryRecord, useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { setSelectedUnit } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
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
  Car,
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
  const { publicRecords } = useInventoryCatalog()
  const { compareUnitIds, toggleCompare, compareCount, clearCompare } =
    useShoppingState()

  const compareUnits = useMemo(() => {
    return compareUnitIds
      .map((id) => publicRecords.find((u) => u.id === id))
      .filter((u): u is InventoryRecord => u !== undefined)
  }, [compareUnitIds, publicRecords])

  return (
    <div className="mx-auto max-w-[88rem] space-y-6 px-2 py-4 sm:px-3 lg:px-4">
      <div className="vault-panel-soft rounded-4xl border border-white/15 p-7 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Scales size={28} className="text-blue-200" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Compare Vehicles
                {compareCount > 0 && (
                  <Badge className="vault-chip ml-3 text-sm">{compareCount}</Badge>
                )}
              </h1>
              <p className="mt-1 text-slate-300">Side-by-side comparison of your selected vehicles</p>
            </div>
          </div>
          {compareCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompare} className="vault-btn-muted vault-tap gap-1.5 rounded-full text-xs uppercase tracking-[0.13em]">
              <Trash size={14} />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {compareUnits.length === 0 ? (
        <div className="vault-panel-soft flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/30 py-16 text-center">
          <Scales size={48} className="mb-4 text-slate-500" weight="thin" />
          <h2 className="text-lg font-semibold text-white">No vehicles to compare</h2>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            Save some vehicles first, then add them to compare. You can compare up to 4 vehicles side by side.
          </p>
          <Button className="vault-btn vault-tap mt-6 gap-1.5 rounded-full px-6 text-xs uppercase tracking-[0.13em]" onClick={() => navigate('/shop')}>
            Browse Inventory
            <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="vault-panel overflow-x-auto rounded-3xl border border-white/15 bg-black/35">
          <Table>
            <TableHeader>
              <TableRow className="border-white/15">
                <TableHead className="w-40 font-semibold text-slate-300">Spec</TableHead>
                {compareUnits.map((unit) => (
                  <TableHead key={unit.id} className="min-w-[220px] text-center">
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="vault-image-frame h-20 w-28 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={unit.photos[0]?.url || IMAGE_FALLBACK}
                          alt={`${unit.year} ${unit.make} ${unit.model}`}
                          className="vault-image h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 768px) 50vw, 240px"
                          onError={(e) => {
                            e.currentTarget.src = IMAGE_FALLBACK
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-white">{unit.year} {unit.make} {unit.model}</span>
                      <span className="text-xs text-slate-400">{unit.trim}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-white/10">
                <TableCell className="font-medium text-slate-200"><div className="flex items-center gap-1.5"><CurrencyDollar size={16} className="text-blue-200" />Price</div></TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center text-base font-bold text-white">{formatPrice(unit.price)}</TableCell>
                ))}
              </TableRow>

              <TableRow className="border-white/10">
                <TableCell className="font-medium text-slate-200"><div className="flex items-center gap-1.5"><Speedometer size={16} className="text-slate-300" />Mileage</div></TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center text-slate-200">{formatMileage(unit.mileage)} mi</TableCell>
                ))}
              </TableRow>

              <TableRow className="border-white/10">
                <TableCell className="font-medium text-slate-200"><div className="flex items-center gap-1.5"><Car size={16} className="text-slate-300" />Body Style</div></TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center"><Badge className="vault-chip">{unit.bodyStyle}</Badge></TableCell>
                ))}
              </TableRow>

              <TableRow className="border-white/10">
                <TableCell className="font-medium text-slate-200">Year</TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center text-slate-200">{unit.year}</TableCell>
                ))}
              </TableRow>

              <TableRow className="border-white/10">
                <TableCell className="align-top font-medium text-slate-200">Highlights</TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {unit.features.map((h) => (
                        <Badge key={h} variant="outline" className="border-white/18 bg-white/3 text-xs font-normal text-slate-300">{h}</Badge>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-white/10"><TableCell />{compareUnits.map((unit) => (<TableCell key={unit.id} className="text-center"><Separator className="my-2 bg-white/15" /></TableCell>))}</TableRow>

              <TableRow className="border-white/10">
                <TableCell className="font-medium text-slate-200">Actions</TableCell>
                {compareUnits.map((unit) => (
                  <TableCell key={unit.id} className="text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Button size="sm" className="vault-btn vault-tap w-full gap-1.5 rounded-full text-xs uppercase tracking-[0.13em]" onClick={() => navigate(`/shop/${unit.id}`)}>
                        View Details
                        <ArrowRight size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full gap-1.5 text-slate-400 hover:text-red-400" onClick={() => toggleCompare(unit.id)}>
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
