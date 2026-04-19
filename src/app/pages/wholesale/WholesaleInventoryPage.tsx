import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { useInventoryCatalog, type InventoryRecord } from '@/domains/inventory/inventory.runtime'
import { clearWholesaleAccess } from '@/domains/wholesale/wholesaleAccess'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { ManufacturerMark } from '@/components/inventory/ManufacturerMark'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, LockKeyOpen, CurrencyDollar, Speedometer, ArrowRight } from '@phosphor-icons/react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage)
}

function matchesSearch(unit: InventoryRecord, query: string): boolean {
  if (!query) return true
  const haystack = `${unit.year} ${unit.make} ${unit.model} ${unit.trim} ${unit.vin || ''} ${unit.stockNumber || ''}`.toLowerCase()
  return query.toLowerCase().split(/\s+/).every((token) => haystack.includes(token))
}

export function WholesaleInventoryPage() {
  const { navigate } = useRouter()
  const { wholesaleRecords, loading } = useInventoryCatalog()
  const [search, setSearch] = useState('')

  const results = useMemo(() => {
    return wholesaleRecords
      .filter((unit) => matchesSearch(unit, search))
      .sort((a, b) => (b.wholesalePrice || 0) - (a.wholesalePrice || 0))
  }, [wholesaleRecords, search])

  if (loading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading wholesale inventory…</div>
  }

  return (
    <div className="ods-buyer-page mx-auto max-w-[88rem] space-y-7 px-3 pb-24 pt-6 sm:px-4 sm:pt-8 lg:px-6">
      <div className="vault-panel-soft rounded-[1.8rem] border border-blue-200/30 bg-blue-500/10 p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="vault-title text-[0.62rem] text-slate-300">Dealer / Wholesale Pricing</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Wholesale Access Inventory</h1>
            <p className="mt-2 text-sm text-slate-300">Protected pricing view for approved wholesale buyers and internal teams.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full border border-blue-200/40 bg-blue-300/20 text-xs text-blue-100">Access Granted</Badge>
            <Button
              variant="outline"
              onClick={() => {
                clearWholesaleAccess()
                navigate('/wholesale')
              }}
              className="vault-btn-muted rounded-full text-xs uppercase tracking-[0.12em]"
            >
              <LockKeyOpen size={14} className="mr-1" />
              Lock Wholesale View
            </Button>
          </div>
        </div>
      </div>

      <div className="vault-panel-soft relative rounded-2xl border border-white/15 p-2">
        <MagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          type="text"
          placeholder="Search by year, make, model, VIN, or stock..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 border-none bg-transparent pl-12 text-base text-slate-100 placeholder:text-slate-500"
        />
      </div>

      {results.length === 0 ? (
        <div className="vault-panel-soft flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 py-16 text-center">
          <h2 className="text-lg font-semibold text-white">No wholesale units found</h2>
          <p className="mt-1 text-sm text-slate-400">No inventory units are currently marked visible for wholesale pricing.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((unit) => (
            <Card key={unit.id} className="vault-panel vault-edge group relative flex flex-col overflow-hidden rounded-3xl border-white/20 bg-black/30">
              <div className="vault-image-frame relative h-52 bg-muted">
                <InventoryPhotoImage
                  record={unit}
                  alt={`${unit.year} ${unit.make} ${unit.model} ${unit.trim}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(3,7,14,0.92))]" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-base font-semibold text-white">{unit.year} {unit.make} {unit.model}</p>
                  <p className="text-xs text-slate-300">{unit.trim}</p>
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <ManufacturerMark make={unit.make} size="sm" showLabel />

                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span className="flex items-center gap-1.5"><Speedometer size={16} />{formatMileage(unit.mileage)} mi</span>
                  <Badge className="vault-chip text-[10px] uppercase tracking-[0.14em]">{unit.bodyStyle}</Badge>
                </div>

                <div className="mt-auto border-t border-white/10 pt-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Wholesale Price</p>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-2xl font-bold tracking-tight text-white">
                      <CurrencyDollar size={20} weight="bold" className="text-blue-200" />
                      {formatPrice(unit.wholesalePrice || 0).replace('$', '')}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/wholesale/${unit.id}`)}
                      className="vault-btn rounded-full px-4 text-[11px] uppercase tracking-[0.13em]"
                    >
                      Open
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </div>
                  {unit.wholesaleStatus ? (
                    <p className="mt-1 text-xs text-slate-400">Status: {unit.wholesaleStatus}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
