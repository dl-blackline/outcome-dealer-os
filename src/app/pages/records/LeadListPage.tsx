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
import { useLeads, useLeadMutations } from '@/domains/leads/lead.hooks'
import { type MockLead } from '@/lib/mockData'
import { Plus, PencilSimple, Trash, SpinnerGap } from '@phosphor-icons/react'

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'converted'] as const

export function LeadListPage() {
  const { navigate } = useRouter()
  const leads = useLeads()
  const mutations = useLeadMutations()
  const [tab, setTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<MockLead | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = leads.data.filter(l =>
    (tab === 'all' || l.status === tab) &&
    (!search || l.customerName.toLowerCase().includes(search.toLowerCase()))
  )

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await mutations.deleteLead(deleteTarget.id)
    leads.refresh()
    setDeleting(false)
    setDeleteTarget(null)
  }

  if (leads.loading) {
    return <div className="flex items-center justify-center py-24"><SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="ods-page ods-flow-lg">
      <SectionHeader title="Leads" description="Track and manage sales leads" />
      <div className="ods-toolbar ods-sticky-toolbar justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setTab(s)} className={`px-3 py-1.5 text-sm capitalize ${tab === s ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
          <input type="text" placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)}
            className="h-8 w-48 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground" />
        </div>
        <Button size="sm" onClick={() => navigate('/app/records/leads/new')} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Lead
        </Button>
      </div>
      <StickyTableShell scrollOffset="18rem">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium">Customer</th>
            <th className="px-4 py-3 text-left font-medium">Source</th>
            <th className="px-4 py-3 text-left font-medium">Score</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No leads yet.</p>
                  <Button size="sm" onClick={() => navigate('/app/records/leads/new')} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Lead
                  </Button>
                </div>
              </td></tr>
            ) : filtered.map(lead => (
              <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium cursor-pointer" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>{lead.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground cursor-pointer" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>{lead.source}</td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${lead.score}%` }} /></div>
                    <span className="text-xs">{lead.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                  <StatusPill variant={lead.status === 'converted' ? 'success' : lead.status === 'qualified' ? 'info' : lead.status === 'contacted' ? 'warning' : 'neutral'}>{lead.status}</StatusPill>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground cursor-pointer" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit" onClick={() => navigate(`/app/records/leads/${lead.id}/edit`)}>
                      <PencilSimple className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Delete" onClick={() => setDeleteTarget(lead)}>
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
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete <strong>{deleteTarget?.customerName}</strong>? This action cannot be undone.
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
