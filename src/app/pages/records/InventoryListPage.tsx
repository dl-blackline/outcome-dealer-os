import { useEffect, useMemo, useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { ManufacturerMark } from '@/components/inventory/ManufacturerMark'
import { Calendar, CurrencyDollar, SpinnerGap, SquaresFour, ListBullets } from '@phosphor-icons/react'

type InventoryViewMode = 'cards' | 'list'

const INVENTORY_VIEW_KEY = 'outcome.inventory.list.view'

function readStoredViewMode(): InventoryViewMode {
  if (typeof window === 'undefined') return 'cards'

  const raw = window.localStorage.getItem(INVENTORY_VIEW_KEY)
  return raw === 'list' ? 'list' : 'cards'
}

export function InventoryListPage() {
  const { navigate } = useRouter()
  const inventory = useInventoryCatalog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'frontline' | 'recon' | 'inventory' | 'sold' | 'delivered' | 'wholesale' | 'all'>('active')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'draft'>('all')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all')
  const [viewMode, setViewMode] = useState<InventoryViewMode>(() => readStoredViewMode())

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INVENTORY_VIEW_KEY, viewMode)
    }
  }, [viewMode])

  const SOLD_STATUSES = new Set(['sold', 'delivered'])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return inventory.records.filter((u) => {
      const desc = `${u.year} ${u.make} ${u.model} ${u.trim} ${u.vin || ''} ${u.stockNumber || ''}`.toLowerCase()
      const statusOk =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? !SOLD_STATUSES.has(u.status)
            : u.status === statusFilter
      const visibilityOk = visibilityFilter === 'all' || (visibilityFilter === 'public' ? u.isPublished : !u.isPublished)
      const featuredOk = featuredFilter === 'all' || (featuredFilter === 'featured' ? u.isFeatured : !u.isFeatured)
      return (!normalizedSearch || desc.includes(normalizedSearch)) && statusOk && visibilityOk && featuredOk
    })
  }, [inventory.records, search, statusFilter, visibilityFilter, featuredFilter])

  if (inventory.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  const hasInventory = inventory.records.length > 0
  const hasSearch = search.trim().length > 0
  const isFilteredEmpty = hasInventory && filtered.length === 0

  return (
    <div className="ods-page ods-flow-md">
      <SectionHeader title="Inventory" description="Active vehicle inventory" />

      <div className="ods-toolbar ods-sticky-toolbar justify-between px-3 py-3 sm:px-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground sm:w-72"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="h-9 rounded-md border border-input bg-background px-3 text-xs uppercase tracking-[0.08em]">
            <option value="active">Active Inventory</option>
            <option value="frontline">Frontline</option>
            <option value="inventory">Inventory</option>
            <option value="recon">Recon</option>
            <option value="wholesale">Wholesale</option>
            <option value="sold">Sold</option>
            <option value="delivered">Delivered</option>
            <option value="all">All (incl. Sold)</option>
          </select>
          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)} className="h-9 rounded-md border border-input bg-background px-3 text-xs uppercase tracking-[0.08em]">
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="draft">Draft</option>
          </select>
          <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value as typeof featuredFilter)} className="h-9 rounded-md border border-input bg-background px-3 text-xs uppercase tracking-[0.08em]">
            <option value="all">All Feature Flags</option>
            <option value="featured">Featured</option>
            <option value="not-featured">Not Featured</option>
          </select>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/70 p-1">
          <Button
            size="sm"
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            className="h-8 gap-1.5"
            onClick={() => setViewMode('cards')}
          >
            <SquaresFour size={15} />
            Cards
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            className="h-8 gap-1.5"
            onClick={() => setViewMode('list')}
          >
            <ListBullets size={15} />
            List
          </Button>
        </div>
      </div>

      {!hasInventory && (
        <Card>
          <CardHeader>
            <CardTitle>No Inventory Available</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No inventory units are available yet. Import or create units to populate this page.
          </CardContent>
        </Card>
      )}

      {isFilteredEmpty && (
        <Card>
          <CardHeader>
            <CardTitle>{hasSearch ? 'No Search Matches' : 'No Results'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No inventory units matched your current query. Try a different VIN, stock number, or model term.
          </CardContent>
        </Card>
      )}

      {hasInventory && filtered.length > 0 && viewMode === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((unit) => {
            const agingVariant = unit.status === 'aging' ? 'danger' as const : unit.daysInStock > 45 ? 'warning' as const : 'success' as const
            const statusVariant = unit.status === 'frontline' ? 'success' as const : unit.status === 'recon' ? 'warning' as const : unit.status === 'aging' ? 'danger' as const : 'neutral' as const

            return (
              <Card
                key={unit.id}
                className="cursor-pointer border-border/80 transition-all hover:ring-1 hover:ring-primary/30"
                onClick={() => navigate(`/app/records/inventory/${unit.id}`)}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <ManufacturerMark make={unit.make} size="sm" showLabel className="mb-1" />
                      <p className="font-semibold">{unit.year} {unit.make} {unit.model}</p>
                      <p className="text-sm text-muted-foreground">{unit.trim}</p>
                    </div>
                    <StatusPill variant={statusVariant}>{unit.status}</StatusPill>
                  </div>

                  <p className="font-mono text-xs text-muted-foreground">{unit.vin || unit.stockNumber || 'No VIN / stock assigned'}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{unit.daysInStock}d</span>
                      <Badge variant="outline" className="ml-1 text-xs">
                        <StatusPill variant={agingVariant} dot={false} className="text-[10px]">
                          {unit.daysInStock > 60 ? 'aged' : unit.daysInStock > 45 ? 'aging' : 'fresh'}
                        </StatusPill>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <CurrencyDollar className="h-3.5 w-3.5" />
                      ${unit.price.toLocaleString()}
                    </div>
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
      )}

      {hasInventory && filtered.length > 0 && viewMode === 'list' && (
        <StickyTableShell scrollOffset="18rem">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Trim</TableHead>
                <TableHead>VIN / Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Featured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((unit) => {
                const statusVariant = unit.status === 'frontline' ? 'success' as const : unit.status === 'recon' ? 'warning' as const : unit.status === 'aging' ? 'danger' as const : 'neutral' as const
                return (
                  <TableRow
                    key={unit.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/records/inventory/${unit.id}`)}
                  >
                    <TableCell>{unit.year}</TableCell>
                    <TableCell><ManufacturerMark make={unit.make} size="sm" showLabel /></TableCell>
                    <TableCell>{unit.model}</TableCell>
                    <TableCell className="text-muted-foreground">{unit.trim || '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{unit.vin || unit.stockNumber || 'No VIN / stock'}</TableCell>
                    <TableCell><StatusPill variant={statusVariant}>{unit.status}</StatusPill></TableCell>
                    <TableCell>{unit.daysInStock}</TableCell>
                    <TableCell className="text-right font-semibold">${unit.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={unit.isPublished ? 'secondary' : 'outline'}>
                        {unit.isPublished ? 'Public' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell>{unit.isFeatured ? <Badge variant="secondary">Featured</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </StickyTableShell>
      )}
    </div>
  )
}
