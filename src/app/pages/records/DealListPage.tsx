import { useState } from 'react'
import { SectionHeader } from '@/components/core/SectionHeader'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import { StatusPill } from '@/components/core/StatusPill'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRouter } from '@/app/router'
import { useDeals, useDealMutations } from '@/domains/deals/deal.hooks'
import { type MockDeal } from '@/lib/mockData'
import { Plus, PencilSimple, Trash, SpinnerGap, Warning } from '@phosphor-icons/react'

const STATUSES = ['all', 'structured', 'quoted', 'signed', 'funded'] as const

export function DealListPage() {
  const { navigate } = useRouter()
  const deals = useDeals()
  const mutations = useDealMutations()
  const [tab, setTab] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<MockDeal | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = deals.data.filter(d => tab === 'all' || d.status === tab)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await mutations.deleteDeal(deleteTarget.id)
    deals.refresh()
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (deals.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Deals" description="Active and completed deal pipeline" />
      <div className="ods-toolbar ods-sticky-toolbar justify-between">
        <div className="ods-toolbar w-fit gap-0 overflow-hidden rounded-lg p-0">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setTab(s)} className={`px-3 py-1.5 text-sm capitalize ${tab === s ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground'}`}>{s}</button>
          ))}
        </div>
        <Button size="sm" onClick={() => navigate('/app/records/deals/new')} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Deal
        </Button>
      </div>
      <StickyTableShell scrollOffset="17rem">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium">Customer</th>
            <th className="px-4 py-3 text-left font-medium">Vehicle</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No deals yet.</p>
                  <Button size="sm" onClick={() => navigate('/app/records/deals/new')} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Deal
                  </Button>
                </div>
              </td></tr>
            ) : filtered.map(deal => (
              <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium cursor-pointer" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>{deal.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground cursor-pointer" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>{deal.vehicleDescription}</td>
                <td className="px-4 py-3 text-right font-semibold cursor-pointer" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>${deal.amount.toLocaleString()}</td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
                  <StatusPill variant={deal.status === 'funded' ? 'success' : deal.status === 'signed' ? 'info' : deal.status === 'quoted' ? 'warning' : 'neutral'}>{deal.status}</StatusPill>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground cursor-pointer" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>{new Date(deal.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit" onClick={() => navigate(`/app/records/deals/${deal.id}/edit`)}>
                      <PencilSimple className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Delete" onClick={() => setDeleteTarget(deal)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StickyTableShell>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete the deal for <strong>{deleteTarget?.customerName}</strong>{deleteTarget?.vehicleDescription ? ` — ${deleteTarget.vehicleDescription}` : ''}?
              {deleteTarget?.status === 'funded' && (
                <span className="block mt-2 font-medium text-amber-600">
                  <Warning className="inline h-4 w-4 mr-1" aria-hidden="true" />This deal is funded. Ensure deletion is intentional.
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
