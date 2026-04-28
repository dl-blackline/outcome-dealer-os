import { useState } from 'react'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRouter } from '@/app/router'
import { useDeals, useDealMutations } from '@/domains/deals/deal.hooks'
import { type MockDeal } from '@/lib/mockData'
import {
  Plus, PencilSimple, Trash, SpinnerGap, Warning,
  CurrencyDollar, ChartBar, Lightning, CheckCircle,
} from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #0F1215 0%, #0C0E11 100%)',
  border: '1px solid rgba(192,195,199,0.08)',
  borderRadius: '0.75rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
}

const DEAL_TABS = ['all', 'quoted', 'signed', 'funded', 'cancelled'] as const
type DealTab = (typeof DEAL_TABS)[number]

const TAB_LABELS: Record<DealTab, string> = {
  all: 'All',
  quoted: 'Quoted',
  signed: 'Signed',
  funded: 'Funded',
  cancelled: 'Cancelled',
}

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  structured: 'Structured',
  quoted: 'Quoted',
  signed: 'Signed',
  funded: 'Funded',
  sold_pending_delivery: 'Sold',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function statusBadge(status: string) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide'
  if (status === 'funded' || status === 'delivered' || status === 'sold_pending_delivery')
    return `${base} bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`
  if (status === 'signed')
    return `${base} bg-blue-500/15 text-blue-400 border border-blue-500/30`
  if (status === 'quoted' || status === 'structured')
    return `${base} bg-amber-500/15 text-amber-400 border border-amber-500/30`
  if (status === 'cancelled')
    return `${base} bg-red-500/10 text-red-400/70 border border-red-500/20`
  return `${base} bg-white/5 text-white/50 border border-white/10`
}

export function DealListPage() {
  const { navigate } = useRouter()
  const deals = useDeals()
  const mutations = useDealMutations()
  const [tab, setTab] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<MockDeal | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = deals.data.filter(d => tab === 'all' || d.status === tab)

  const activeDeals = deals.data.filter(d => !['delivered', 'cancelled'].includes(d.status)).length
  const fundedThisMonth = deals.data.filter(d => d.status === 'funded').length
  const totalPipeline = deals.data.reduce((sum, d) => sum + d.amount, 0)
  const avgFrontGross = deals.data.length > 0 ? totalPipeline / deals.data.length : 0

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await mutations.deleteDeal(deleteTarget.id)
    deals.refresh()
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (deals.loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SpinnerGap className="h-8 w-8 animate-spin" style={{ color: '#E31B37' }} />
      </div>
    )
  }

  return (
    <div className="ods-page ods-flow-lg">
      {/* Header — bold mockup-style */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
        background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
        border: '1px solid rgba(16,185,129,0.18)',
        boxShadow: '0 0 60px rgba(16,185,129,0.04)',
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #10b981 0%, #1E3A8A 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #10b981 0%, rgba(16,185,129,0.3) 40%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(16,185,129,0.06) 0%, transparent 60%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="pl-3">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#34d399' }}>National Car Mart · Dealer OS</div>
            <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em' }}>DEAL DESK</h1>
            <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>Active and completed deal pipeline · {activeDeals} active</p>
          </div>
          <button
            onClick={() => navigate('/app/records/deals/new')}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold text-white transition-all hover:brightness-115 hover:scale-[1.02] shrink-0"
            style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 2px 16px rgba(220,38,38,0.45)' }}
          >
            <Plus className="h-4 w-4" /> New Deal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Deals', value: activeDeals.toString(), Icon: Lightning, accent: '#3b82f6' },
          { label: 'Funded This Month', value: fundedThisMonth.toString(), Icon: CheckCircle, accent: '#10b981' },
          { label: 'Total Pipeline', value: `$${(totalPipeline / 1000).toFixed(0)}k`, Icon: CurrencyDollar, accent: '#f59e0b' },
          { label: 'Avg Front Gross', value: `$${avgFrontGross.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, Icon: ChartBar, accent: '#8b5cf6' },
        ].map(({ label, value, Icon, accent }) => (
          <div key={label} style={PANEL_STYLE} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {label}
              </span>
              <Icon className="h-4 w-4" style={{ color: accent }} />
            </div>
            <div className="text-2xl font-bold text-white" style={{ textShadow: `0 0 20px ${accent}60` }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '2px', padding: '4px', ...PANEL_STYLE, width: 'fit-content' }}>
        {DEAL_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            style={tab === t ? {
              background: 'linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.3))',
              color: '#f87171',
              boxShadow: '0 0 12px rgba(220,38,38,0.2)',
            } : {
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Premium Table */}
      <div style={PANEL_STYLE} className="overflow-hidden">
        <StickyTableShell scrollOffset="17rem">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Customer', 'Vehicle', 'Sale Price', 'Status', 'Created', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest ${i >= 2 ? 'text-right' : 'text-left'}`}
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>No deals found.</p>
                    <button
                      onClick={() => navigate('/app/records/deals/new')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
                    >
                      <Plus className="h-4 w-4" /> Create Deal
                    </button>
                  </td>
                </tr>
              ) : filtered.map(deal => (
                <tr
                  key={deal.id}
                  className="transition-colors cursor-pointer group"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
                >
                  <td className="px-4 py-3 font-medium text-white" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
                    {deal.customerName}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }} onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
                    {deal.vehicleDescription}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
                    ${deal.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
                    <span className={statusBadge(deal.status)}>{STATUS_LABELS[deal.status] ?? deal.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: 'rgba(255,255,255,0.4)' }} onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Edit"
                        onClick={() => navigate(`/app/records/deals/${deal.id}/edit`)}
                        className="h-7 w-7 rounded flex items-center justify-center transition-all"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        onMouseEnter={e => { const el = e.currentTarget; el.style.color = 'white'; el.style.background = 'rgba(255,255,255,0.08)' }}
                        onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,0.4)'; el.style.background = '' }}
                      >
                        <PencilSimple className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setDeleteTarget(deal)}
                        className="h-7 w-7 rounded flex items-center justify-center transition-all"
                        style={{ color: 'rgba(239,68,68,0.5)' }}
                        onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#ef4444'; el.style.background = 'rgba(239,68,68,0.1)' }}
                        onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(239,68,68,0.5)'; el.style.background = '' }}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StickyTableShell>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete the deal for <strong>{deleteTarget?.customerName}</strong>
              {deleteTarget?.vehicleDescription ? ` — ${deleteTarget.vehicleDescription}` : ''}?
              {deleteTarget?.status === 'funded' && (
                <span className="block mt-2 font-medium text-amber-600">
                  <Warning className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  This deal is funded. Ensure deletion is intentional.
                </span>
              )}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {deleting ? <SpinnerGap className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
