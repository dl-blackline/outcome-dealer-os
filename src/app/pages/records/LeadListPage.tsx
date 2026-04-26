import { useState } from 'react'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRouter } from '@/app/router'
import { useLeads, useLeadMutations } from '@/domains/leads/lead.hooks'
import { type MockLead } from '@/lib/mockData'
import { Plus, PencilSimple, Trash, SpinnerGap, MagnifyingGlass, Funnel, ArrowUpRight } from '@phosphor-icons/react'

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'converted'] as const

const PIPELINE_STAGES = [
  { label: 'New', color: '#2c69ff', count: 14 },
  { label: 'Contacted', color: '#7c3aed', count: 9 },
  { label: 'Appt Set', color: '#df7c00', count: 6 },
  { label: 'Demo', color: '#df2424', count: 4 },
  { label: 'Working', color: '#f59e0b', count: 3 },
  { label: 'Sold', color: '#10b981', count: 2 },
  { label: 'Lost', color: '#6b7280', count: 5 },
]

const PANEL_STYLE = {
  background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem',
}

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
    return (
      <div className="flex min-h-96 items-center justify-center">
        <SpinnerGap className="h-8 w-8 animate-spin text-red-500/60" />
      </div>
    )
  }

  const totalLeads = leads.data.length
  const contactedLeads = leads.data.filter(l => l.status === 'contacted').length
  const qualifiedLeads = leads.data.filter(l => l.status === 'qualified').length
  const convertedLeads = leads.data.filter(l => l.status === 'converted').length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Lead Command Center
          </h1>
          <p className="text-[0.78rem] text-white/40 mt-0.5">Track, manage and convert your pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/records/leads/new')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.8rem] font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #c01818, #e83232)',
              boxShadow: '0 2px 12px rgba(223,36,36,0.3)',
            }}
          >
            <Plus className="h-3.5 w-3.5" /> New Lead
          </button>
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] font-medium text-white/60 transition-colors hover:text-white/80"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Import
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Total Leads', value: totalLeads, accent: '#2c69ff' },
          { label: 'New This Week', value: leads.data.filter(l => l.status === 'new').length, accent: '#7c3aed' },
          { label: 'Contact Rate', value: `${totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0}%`, accent: '#df7c00' },
          { label: 'Qualified', value: qualifiedLeads, accent: '#10b981' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, accent: '#df2424' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ ...PANEL_STYLE, borderTop: `2px solid ${k.accent}` }}>
            <div className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/35 mb-2">{k.label}</div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Strip */}
      <div className="rounded-xl p-3" style={PANEL_STYLE}>
        <div className="flex items-center gap-1 overflow-x-auto">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-1 shrink-0">
              <div
                className="flex flex-col items-center px-4 py-2 rounded-lg min-w-[80px]"
                style={{ background: `${stage.color}18`, border: `1px solid ${stage.color}30` }}
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-white/40">{stage.label}</span>
                <span className="text-lg font-black mt-0.5" style={{ color: stage.color, fontFamily: 'Space Grotesk, sans-serif' }}>{stage.count}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="text-white/20 text-xs shrink-0">›</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search leads by name, source…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg py-2 pl-9 pr-4 text-[0.82rem] text-white/80 placeholder-white/25 outline-none transition-all"
            style={{
              background: 'oklch(0.13 0.014 248)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(223,36,36,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className="px-3 py-2 text-[0.75rem] capitalize font-medium transition-all"
              style={tab === s ? {
                background: 'rgba(223,36,36,0.2)',
                color: '#f87171',
              } : {
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.75rem] text-white/40 transition-colors hover:text-white/60"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Funnel className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
        <StickyTableShell scrollOffset="22rem">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Customer', 'Source', 'Score', 'Status', 'Created', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-semibold text-[0.65rem] uppercase tracking-wider text-white/30 ${i >= 4 ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">
                    <div className="space-y-3">
                      <p>No leads found.</p>
                      <button
                        onClick={() => navigate('/app/records/leads/new')}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #c01818, #e83232)' }}
                      >
                        <Plus className="h-4 w-4" /> Create Lead
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td className="px-4 py-3 font-semibold text-white/85" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                    {lead.customerName}
                  </td>
                  <td className="px-4 py-3 text-white/45" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                    {lead.source}
                  </td>
                  <td className="px-4 py-3" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${lead.score}%`,
                            background: lead.score >= 70 ? '#10b981' : lead.score >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-[0.72rem] text-white/50 tabular-nums">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${
                      lead.status === 'converted' ? 'bg-emerald-500/20 text-emerald-400' :
                      lead.status === 'qualified' ? 'bg-blue-500/20 text-blue-400' :
                      lead.status === 'contacted' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/35" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="h-7 w-7 flex items-center justify-center rounded text-white/35 hover:text-white/70 transition-colors"
                        title="Edit"
                        onClick={() => navigate(`/app/records/leads/${lead.id}/edit`)}
                      >
                        <PencilSimple className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="h-7 w-7 flex items-center justify-center rounded text-white/35 hover:text-red-400 transition-colors"
                        title="Delete"
                        onClick={() => setDeleteTarget(lead)}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="h-7 w-7 flex items-center justify-center rounded text-white/35 hover:text-white/70 transition-colors"
                        title="Open"
                        onClick={() => navigate(`/app/records/leads/${lead.id}`)}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
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
        <AlertDialogContent style={{ background: 'oklch(0.14 0.016 248)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Lead</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Permanently delete <strong className="text-white/80">{deleteTarget?.customerName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-white/10 text-white/60 hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #c01818, #e83232)' }}
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
