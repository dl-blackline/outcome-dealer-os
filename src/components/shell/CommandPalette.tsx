import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, House, Kanban, UsersThree, ClipboardText, CurrencyDollar, Gauge, ChartLine, Gear, Shield, Lightning, Scroll } from '@phosphor-icons/react'
import { useLeads, useDeals, useInventory, useHouseholds } from '@/hooks/useDomainQueries'
import { useRouter } from '@/app/router'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  category: 'navigation' | 'record' | 'action'
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const { navigate } = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const leads = useLeads()
  const deals = useDeals()
  const inventory = useInventory()
  const households = useHouseholds()

  const go = useCallback((path: string) => {
    navigate(path)
    onOpenChange(false)
    setSearch('')
  }, [navigate, onOpenChange])

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      { id: 'nav-dashboard', label: 'Dashboard', icon: House, action: () => go('/app/dashboard'), category: 'navigation' },
      { id: 'nav-workstation', label: 'Workstation', icon: Kanban, action: () => go('/app/workstation'), category: 'navigation' },
      { id: 'nav-households', label: 'Households', icon: UsersThree, action: () => go('/app/records/households'), category: 'navigation' },
      { id: 'nav-leads', label: 'Leads', icon: ClipboardText, action: () => go('/app/records/leads'), category: 'navigation' },
      { id: 'nav-deals', label: 'Deals', icon: CurrencyDollar, action: () => go('/app/records/deals'), category: 'navigation' },
      { id: 'nav-inventory', label: 'Inventory', icon: Gauge, action: () => go('/app/records/inventory'), category: 'navigation' },
      { id: 'nav-events', label: 'Event Stream', icon: Lightning, action: () => go('/app/ops/events'), category: 'navigation' },
      { id: 'nav-approvals', label: 'Approval Queue', icon: Shield, action: () => go('/app/ops/approvals'), category: 'navigation' },
      { id: 'nav-audit', label: 'Audit Log', icon: Scroll, action: () => go('/app/ops/audit'), category: 'navigation' },
      { id: 'nav-roles', label: 'Roles & Permissions', icon: Gear, action: () => go('/app/settings/roles'), category: 'navigation' },
      { id: 'nav-integrations', label: 'Integrations', icon: Gear, action: () => go('/app/settings/integrations'), category: 'navigation' },
    ]

    const actionItems: CommandItem[] = [
      { id: 'action-pending-approvals', label: 'Review Pending Approvals', description: 'Jump to approval queue', icon: Shield, action: () => go('/app/ops/approvals'), category: 'action' },
      { id: 'action-new-card', label: 'Open Workstation', description: 'Go to your execution board', icon: Kanban, action: () => go('/app/workstation'), category: 'action' },
    ]

    const recordItems: CommandItem[] = [
      ...leads.data.map(l => ({
        id: `lead-${l.id}`,
        label: l.customerName,
        description: `Lead • ${l.source} • Score: ${l.score}`,
        icon: ClipboardText,
        action: () => go(`/app/records/leads/${l.id}`),
        category: 'record' as const,
      })),
      ...deals.data.map(d => ({
        id: `deal-${d.id}`,
        label: d.customerName,
        description: `Deal • ${d.vehicleDescription} • $${d.amount.toLocaleString()}`,
        icon: CurrencyDollar,
        action: () => go(`/app/records/deals/${d.id}`),
        category: 'record' as const,
      })),
      ...inventory.data.map(u => ({
        id: `inv-${u.id}`,
        label: `${u.year} ${u.make} ${u.model} ${u.trim}`,
        description: `Inventory • ${u.vin} • $${u.askingPrice.toLocaleString()}`,
        icon: Gauge,
        action: () => go(`/app/records/inventory/${u.id}`),
        category: 'record' as const,
      })),
      ...households.data.map(h => ({
        id: `hh-${h.id}`,
        label: h.name,
        description: `Household • ${h.primaryContact} • $${h.lifetimeValue.toLocaleString()} LTV`,
        icon: UsersThree,
        action: () => go(`/app/records/households/${h.id}`),
        category: 'record' as const,
      })),
    ]

    return [...navItems, ...actionItems, ...recordItems]
  }, [go, leads.data, deals.data, inventory.data, households.data])

  const filtered = useMemo(() => {
    if (!search.trim()) return items.slice(0, 12)
    const q = search.toLowerCase()
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q))
    ).slice(0, 12)
  }, [items, search])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault()
      filtered[selectedIndex].action()
    }
  }, [filtered, selectedIndex])

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'navigation': return 'Pages'
      case 'record': return 'Records'
      case 'action': return 'Actions'
      default: return cat
    }
  }

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [filtered])

  // Pre-compute flat index for each item to avoid mutation during render
  const flatIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    let idx = 0
    for (const [, groupItems] of Object.entries(grouped)) {
      for (const item of groupItems) {
        map.set(item.id, idx++)
      }
    }
    return map
  }, [grouped])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0" onKeyDown={handleKeyDown}>
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="border-b border-border p-3">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages, records, and actions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No results found</div>
          ) : (
            Object.entries(grouped).map(([category, groupItems]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryLabel(category)}
                </div>
                {groupItems.map(item => {
                  const idx = flatIndexMap.get(item.id) ?? 0
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        idx === selectedIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <span className="font-medium">{item.label}</span>
                        {item.description && (
                          <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
          <span><kbd className="rounded border bg-muted px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border bg-muted px-1">↵</kbd> Select</span>
          <span><kbd className="rounded border bg-muted px-1">esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
