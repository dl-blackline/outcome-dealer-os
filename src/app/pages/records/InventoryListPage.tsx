import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Badge } from '@/components/ui/badge'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { Calendar, CurrencyDollar, SpinnerGap } from '@phosphor-icons/react'

export function InventoryListPage() {
  const { navigate } = useRouter()
  const inventory = useInventoryCatalog()
  const [search, setSearch] = useState('')
  const filtered = inventory.records.filter(u => {
    const desc = `${u.year} ${u.make} ${u.model} ${u.trim} ${u.vin || ''} ${u.stockNumber || ''}`.toLowerCase()
    return !search || desc.includes(search.toLowerCase())
  })

  if (inventory.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader title="Inventory" description="Active vehicle inventory" />
      <input type="text" placeholder="Search inventory…" value={search} onChange={e => setSearch(e.target.value)}
        className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(unit => {
          const agingVariant = unit.status === 'aging' ? 'danger' as const : unit.daysInStock > 45 ? 'warning' as const : 'success' as const
          const statusVariant = unit.status === 'frontline' ? 'success' as const : unit.status === 'recon' ? 'warning' as const : unit.status === 'aging' ? 'danger' as const : 'neutral' as const
          return (
            <Card key={unit.id} className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => navigate(`/app/records/inventory/${unit.id}`)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold">{unit.year} {unit.make} {unit.model}</p><p className="text-sm text-muted-foreground">{unit.trim}</p></div>
                  <StatusPill variant={statusVariant}>{unit.status}</StatusPill>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{unit.vin || unit.stockNumber || 'No VIN / stock assigned'}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /><span>{unit.daysInStock}d</span><Badge variant="outline" className="ml-1 text-xs"><StatusPill variant={agingVariant} dot={false} className="text-[10px]">{unit.daysInStock > 60 ? 'aged' : unit.daysInStock > 45 ? 'aging' : 'fresh'}</StatusPill></Badge></div>
                  <div className="flex items-center gap-1 font-semibold"><CurrencyDollar className="h-3.5 w-3.5" />${unit.price.toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <Badge variant={unit.isPublished ? 'secondary' : 'outline'}>{unit.isPublished ? 'Public' : 'Hidden'}</Badge>
                  {unit.isFeatured && <Badge variant="secondary">Featured</Badge>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
