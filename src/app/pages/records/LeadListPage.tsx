import { useState } from 'react'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useRouter } from '@/app/router'
import { useLeads, useLeadMutations } from '@/domains/leads/lead.hooks'
import { type MockLead } from '@/lib/mockData'
import { Plus, PencilSimple, Trash, SpinnerGap, MagnifyingGlass, Funnel, ArrowUpRight, TrendUp, Lightning, Clock, ChartLine } from '@phosphor-icons/react'

const PIPELINE_STAGES = [
  { label: 'NEW', color: '#1E3A8A', count: 298, pct: '24%' },
  { label: 'CONTACTED', color: '#7c3aed', count: 236, pct: '19%' },
  { label: 'APPT SET', color: '#df7c00', count: 189, pct: '15%' },
  { label: 'DEMO', color: '#E31B37', count: 142, pct: '11%' },
  { label: 'WORKING', color: '#f59e0b', count: 98, pct: '8%' },
  { label: 'SOLD', color: '#10b981', count: 76, pct: '6%' },
  { label: 'LOST', color: '#6b7280', count: 209, pct: '17%' },
]

const HOT_LEADS = [
  { name: 'Jason Miller', vehicle: '2024 Toyota RAV4', score: 92 },
  { name: 'Daniel Murphy', vehicle: '2024 Lexus RX 350', score: 91 },
  { name: 'Maria Sanchez', vehicle: '2024 Ford F-150', score: 88 },
  { name: 'Tyler Jenkins', vehicle: '2024 Tesla Model Y', score: 85 },
  { name: 'Brian Anderson', vehicle: '2024 Chevy Silverado', score: 83 },
]

const FOLLOW_UP_TODAY = [
  { name: 'Jason Miller', task: 'Call Back', due: '15m' },
  { name: 'Maria Sanchez', task: 'Follow Up', due: '45m' },
  { name: 'Chris Johnson', task: 'Schedule Appt.', due: '2h 15m' },
  { name: 'Amanda Lee', task: 'Demo Drive', due: '3h 5m' },
  { name: 'Robert Wilson', task: 'Trade Quote', due: '5h 45m' },
]

const ACTIVITY_FEED = [
  { name: 'Maria Sanchez', action: 'opened email', time: '10:24 AM', color: '#1E3A8A' },
  { name: 'Chris Johnson', action: 'requested a test drive', time: '9:58 AM', color: '#7c3aed' },
  { name: 'Daniel Murphy', action: 'responded to text', time: '9:41 AM', color: '#10b981' },
  { name: 'New lead from Google Ads', action: '', time: '9:15 AM', color: '#f59e0b' },
  { name: 'Amanda Lee', action: 'uploaded trade info', time: '8:32 AM', color: '#E31B37' },
]

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #0F1215 0%, #0C0E11 100%)',
  border: '1px solid rgba(192,195,199,0.08)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(192,195,199,0.03), 0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 40 ? '#f59e0b' : '#6b7280'
  const label = score >= 80 ? 'Hot' : score >= 60 ? 'High' : score >= 40 ? 'Med' : 'Low'
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-[0.7rem] font-black"
        style={{ background: `${color}30`, border: `2px solid ${color}`, color }}
      >
        {score}
      </div>
      <span className="text-[0.65rem] font-bold" style={{ color }}>{label}</span>
    </div>
  )
}

export function LeadListPage() {
  const { navigate } = useRouter()
  const leads = useLeads()
  const mutations = useLeadMutations()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<MockLead | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = leads.data.filter(l =>
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
  const convertedLeads = leads.data.filter(l => l.status === 'converted').length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  return (
    <div className="flex gap-4 pb-6 min-h-0">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header — bold mockup-style */}
        <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
          background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
          border: '1px solid rgba(227,27,55,0.18)',
          boxShadow: '0 0 60px rgba(227,27,55,0.06)',
        }}>
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #E31B37 0%, #7c3aed 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #E31B37 0%, rgba(227,27,55,0.3) 40%, transparent 100%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(227,27,55,0.07) 0%, transparent 60%)' }} />
          <div className="relative flex items-start justify-between">
            <div className="pl-3">
              <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#E31B37' }}>National Car Mart · Dealer OS</div>
              <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em', textShadow: '0 0 40px rgba(227,27,55,0.25)' }}>LEAD COMMAND CENTER</h1>
              <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>Manage, prioritize, and convert leads · {totalLeads} total leads</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/app/records/leads/new')}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold text-white transition-all hover:brightness-115 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)', boxShadow: '0 2px 16px rgba(227,27,55,0.5), 0 0 0 1px rgba(227,27,55,0.3)' }}
              >
                <Plus className="h-3.5 w-3.5" /> New Lead
              </button>
              <button className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[0.78rem] font-medium text-white/60 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>Import</button>
            </div>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search leads by name, phone, email, or VIN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg py-2 pl-9 pr-4 text-[0.82rem] text-white/80 placeholder-white/25 outline-none transition-all"
              style={{ background: '#0B0D10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(227,27,55,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <select
            className="rounded-lg px-3 py-2 text-[0.78rem] text-white/60 outline-none"
            style={{ background: '#0B0D10', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option>All Sources</option>
            <option>Website</option>
            <option>Google Ads</option>
            <option>Facebook</option>
            <option>Referral</option>
            <option>Walk-In</option>
          </select>
          <select
            className="rounded-lg px-3 py-2 text-[0.78rem] text-white/60 outline-none"
            style={{ background: '#0B0D10', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option>All Statuses</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Qualified</option>
            <option>Converted</option>
          </select>
          <select
            className="rounded-lg px-3 py-2 text-[0.78rem] text-white/60 outline-none"
            style={{ background: '#0B0D10', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option>All Salespeople</option>
          </select>
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.75rem] text-white/40 transition-colors hover:text-white/60"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Funnel className="h-3.5 w-3.5" /> More Filters
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: 'TOTAL LEADS', value: totalLeads || 1248, delta: '+18% vs. Last 30 Days', accent: '#1E3A8A', up: true },
            { label: 'NEW THIS WEEK', value: leads.data.filter(l => l.status === 'new').length || 236, delta: '+12% vs. Last Week', accent: '#7c3aed', up: true },
            { label: 'CONTACT RATE', value: `${totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 63}%`, delta: '+6.4% vs. Last 30 Days', accent: '#f97316', up: true },
            { label: 'APPOINTMENT RATE', value: '28.7%', delta: '+4.1% vs. Last 30 Days', accent: '#10b981', up: true },
            { label: 'CONVERSION RATE', value: `${conversionRate || 14}%`, delta: '+2.8% vs. Last 30 Days', accent: '#e31837', up: true },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-3.5" style={{ ...PANEL_STYLE, borderTop: `2px solid ${k.accent}` }}>
              <div className="text-[0.62rem] font-semibold uppercase tracking-widest text-white/35 mb-2">{k.label}</div>
              <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{k.value}</div>
              <div className={`text-[0.62rem] flex items-center gap-0.5 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
                <TrendUp className="h-2.5 w-2.5" />{k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Strip */}
        <div className="rounded-xl p-3" style={PANEL_STYLE}>
          <div className="flex items-center gap-1 overflow-x-auto">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-1 shrink-0 flex-1">
                <div
                  className="flex flex-col items-center px-3 py-2.5 rounded-lg w-full cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: `${stage.color}18`, border: `1px solid ${stage.color}30` }}
                >
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">{stage.label}</span>
                  <span className="text-xl font-black mt-0.5" style={{ color: stage.color, fontFamily: 'Space Grotesk, sans-serif' }}>{stage.count}</span>
                  <span className="text-[0.6rem] text-white/30">{stage.pct}</span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && <div className="text-white/15 text-sm shrink-0">›</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-[0.78rem] text-white/60">
              All Leads <span className="text-white/40">({filtered.length || 1248})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.73rem] text-white/40 transition-colors hover:text-white/60"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                View: Default
              </button>
              <button className="flex items-center gap-1.5 rounded px-2 py-1.5 text-[0.73rem] text-white/40 hover:text-white/60">
                <Funnel className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <StickyTableShell scrollOffset="22rem">
            <table className="w-full text-[0.78rem]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="w-8 px-3 py-3">
                    <input type="checkbox" className="opacity-40 accent-red-500" />
                  </th>
                  {['CUSTOMER', 'VEHICLE INTEREST', 'SOURCE', 'LEAD SCORE', 'LAST TOUCH', 'NEXT TASK', 'REP', 'STATUS', ''].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left font-semibold text-[0.62rem] uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-white/30 text-sm">
                      <div className="space-y-3">
                        <p>No leads found.</p>
                        <button
                          onClick={() => navigate('/app/records/leads/new')}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)' }}
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
                    <td className="px-3 py-2.5">
                      <input type="checkbox" className="opacity-40 accent-red-500" onClick={e => e.stopPropagation()} />
                    </td>
                    <td className="px-3 py-2.5" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
                        >
                          {lead.customerName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white/85">{lead.customerName}</div>
                          <div className="text-[0.65rem] text-white/35">{lead.phone || '(555) 310-5566'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-white/55" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      <div className="text-[0.73rem]">{lead.interestedVehicle || '—'}</div>
                      <div className="text-[0.62rem] text-white/30">AWD</div>
                    </td>
                    <td className="px-3 py-2.5 text-white/50 text-[0.73rem]" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      {lead.source}
                    </td>
                    <td className="px-3 py-2.5" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="px-3 py-2.5" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      <div className="text-[0.72rem] text-white/65">
                        Today, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                      <div className="text-[0.62rem] text-white/35">Phone Call</div>
                    </td>
                    <td className="px-3 py-2.5" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      <div className="text-[0.72rem] text-white/65">Call Back</div>
                      <div className="text-[0.62rem] text-red-400 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> 15m
                      </div>
                    </td>
                    <td className="px-3 py-2.5" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                        >
                          {lead.assignedTo ? lead.assignedTo.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="text-[0.7rem] text-white/55">
                          {lead.assignedTo ? lead.assignedTo.split(' ')[0] : 'Sarah N.'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[0.62rem] font-bold uppercase tracking-wide ${
                        lead.status === 'converted' ? 'bg-emerald-500/20 text-emerald-400' :
                        lead.status === 'qualified' ? 'bg-blue-500/20 text-blue-400' :
                        lead.status === 'contacted' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {lead.status === 'new' ? 'New' :
                          lead.status === 'contacted' ? 'Contacted' :
                          lead.status === 'qualified' ? 'Appt Set' : 'Sold'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="h-7 w-7 flex items-center justify-center rounded text-white/35 hover:text-white/70 transition-colors"
                          onClick={e => { e.stopPropagation(); navigate(`/app/records/leads/${lead.id}/edit`) }}
                        >
                          <PencilSimple className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-7 w-7 flex items-center justify-center rounded text-white/35 hover:text-red-400 transition-colors"
                          onClick={e => { e.stopPropagation(); setDeleteTarget(lead) }}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="h-7 w-7 flex items-center justify-center rounded text-white/35 hover:text-white/70 transition-colors"
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
          {/* Pagination footer */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-[0.72rem] text-white/35">
              Showing 1 to 25 of {filtered.length || 1248} leads
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  className={`h-7 w-7 flex items-center justify-center rounded text-[0.73rem] transition-colors ${
                    p === 1 ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
              <span className="text-white/25 px-1">...</span>
              <button className="h-7 w-7 flex items-center justify-center rounded text-[0.73rem] text-white/40 hover:text-white/70">
                50
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Lead Insights */}
      <div className="shrink-0 w-72 space-y-4">

        {/* Lead Insights + Hot Leads */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <ChartLine className="h-3.5 w-3.5 text-red-400" />
              <h2 className="text-[0.75rem] font-bold text-white/80 uppercase tracking-widest">Lead Insights</h2>
            </div>
          </div>

          {/* Hot Leads */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Lightning className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[0.72rem] font-bold text-white/70 uppercase tracking-wider">HOT LEADS</span>
              </div>
              <button className="text-[0.65rem] text-red-400 hover:text-red-300">View All</button>
            </div>
            <div className="space-y-2">
              {HOT_LEADS.map(lead => (
                <div
                  key={lead.name}
                  className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
                  >
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.73rem] font-semibold text-white/80 truncate">{lead.name}</div>
                    <div className="text-[0.62rem] text-white/35 truncate">{lead.vehicle}</div>
                  </div>
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[0.65rem] font-black border-2 shrink-0"
                    style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                  >
                    {lead.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Needs Follow-Up Today */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[0.72rem] font-bold text-white/70 uppercase tracking-wider">Needs Follow-Up Today</span>
              <span className="text-[0.65rem] font-bold text-amber-400 bg-amber-500/10 rounded-full px-1.5 py-0.5">23</span>
            </div>
            <button className="text-[0.65rem] text-amber-400 hover:text-amber-300">View All</button>
          </div>
          <div className="p-3 space-y-2">
            {FOLLOW_UP_TODAY.map(f => (
              <div
                key={f.name}
                className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <div>
                  <div className="text-[0.73rem] font-semibold text-white/80">{f.name}</div>
                  <div className="text-[0.62rem] text-white/40">{f.task}</div>
                </div>
                <div className="flex items-center gap-0.5 text-[0.65rem] font-bold text-red-400">
                  <Clock className="h-2.5 w-2.5" /> {f.due}
                </div>
              </div>
            ))}
            <div className="text-[0.65rem] text-white/30 text-center pt-1">+ 18 more</div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-1.5">
              <ChartLine className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[0.72rem] font-bold text-white/70 uppercase tracking-wider">Activity Feed</span>
            </div>
            <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="p-3 space-y-2.5">
            {ACTIVITY_FEED.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-[0.58rem] font-bold text-white shrink-0 mt-0.5"
                  style={{ background: a.color + '33', border: `1px solid ${a.color}60` }}
                >
                  {a.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.72rem] text-white/70 leading-tight">
                    <span className="font-semibold text-white/85">{a.name}</span>
                    {a.action ? ` ${a.action}` : ''}
                  </div>
                </div>
                <span className="text-[0.62rem] text-white/30 shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => navigate('/app/ops/reports')}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-[0.73rem] font-semibold text-white/50 hover:text-white/80 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Go to Reports
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent style={{ background: '#1B1E23', border: '1px solid rgba(192,195,199,0.10)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Lead</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Permanently delete{' '}
              <strong className="text-white/80">{deleteTarget?.customerName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-white/10 text-white/60 hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)' }}
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
