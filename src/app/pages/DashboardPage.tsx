import { useLeads } from '@/domains/leads/lead.hooks'
import { useDeals } from '@/domains/deals/deal.hooks'
import { useInventory } from '@/domains/inventory/inventory.hooks'
import { useTasks } from '@/domains/tasks/task.hooks'
import { useRouter } from '@/app/router'
import {
  TrendUp, TrendDown, Warning, SpinnerGap, ArrowRight,
  Users, Car, CurrencyDollar, CalendarCheck, Robot,
  ArrowUpRight, Lightning, Bell,
} from '@phosphor-icons/react'

// Sample data for demo panels (replace with real data as available)
const SAMPLE_FUNNEL = [
  { stage: 'New Leads', count: 47, color: '#2c69ff', pct: 100 },
  { stage: 'Contacted', count: 31, color: '#7c3aed', pct: 66 },
  { stage: 'Appt Set', count: 12, color: '#df7c00', pct: 26 },
  { stage: 'Demo', count: 8, color: '#df2424', pct: 17 },
  { stage: 'Delivered', count: 5, color: '#10b981', pct: 11 },
]

const SAMPLE_ATTENTION = [
  { label: '3 leads with no contact in 72h', type: 'urgent', icon: Warning },
  { label: 'Unit #4821 aged 61 days — price drop rec.', type: 'warning', icon: Car },
  { label: '2 deals waiting lender approval', type: 'info', icon: CurrencyDollar },
  { label: 'Martinez appt in 45 min — no confirm', type: 'urgent', icon: CalendarCheck },
]

const SAMPLE_ACTIVITY = [
  { user: 'J. Rodriguez', action: 'Converted lead → deal', time: '4m ago', color: '#10b981' },
  { user: 'T. Williams', action: 'Sent credit app to Chase', time: '11m ago', color: '#2c69ff' },
  { user: 'K. Patel', action: 'Added note to Garcia lead', time: '22m ago', color: '#7c3aed' },
  { user: 'System', action: 'Lender approval: First National', time: '38m ago', color: '#10b981' },
  { user: 'M. Carter', action: 'Marked deal #2204 as delivered', time: '52m ago', color: '#df2424' },
]

const PANEL_STYLE = {
  background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
}

interface KpiCardProps {
  label: string
  value: string
  sub: string
  accent: string
  trend?: 'up' | 'down' | 'neutral'
  trendVal?: string
  onClick?: () => void
}

function KpiCard({ label, value, sub, accent, trend, trendVal, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col justify-between rounded-xl p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99] w-full"
      style={{
        ...PANEL_STYLE,
        borderTop: `2px solid ${accent}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-white/40">{label}</span>
        {trend && trendVal && (
          <span className={`flex items-center gap-0.5 text-[0.7rem] font-semibold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'}`}>
            {trend === 'up' ? <TrendUp className="h-3 w-3" /> : trend === 'down' ? <TrendDown className="h-3 w-3" /> : null}
            {trendVal}
          </span>
        )}
      </div>
      <div className="text-[1.9rem] font-black tracking-tight text-white leading-none mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {value}
      </div>
      <div className="text-[0.72rem] text-white/40">{sub}</div>
    </button>
  )
}

interface PaceBarProps {
  label: string
  current: number
  goal: number
  color: string
}

function PaceBar({ label, current, goal, color }: PaceBarProps) {
  const pct = Math.min(100, Math.round((current / goal) * 100))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.75rem]">
        <span className="text-white/60 font-medium">{label}</span>
        <span className="text-white/80 font-semibold tabular-nums">{current}<span className="text-white/30">/{goal}</span></span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const leads = useLeads()
  const deals = useDeals()
  const inventory = useInventory()
  const tasks = useTasks()
  const { navigate } = useRouter()

  const loading = leads.loading || deals.loading || inventory.loading || tasks.loading

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <SpinnerGap className="h-8 w-8 animate-spin text-red-500/60" />
      </div>
    )
  }

  const totalLeads = leads.data.length
  const openTasks = tasks.data.filter(t => t.status !== 'completed').length
  const fundedDeals = deals.data.filter(d => d.status === 'funded').length

  const kpis: KpiCardProps[] = [
    { label: 'Units Sold', value: String(fundedDeals || 5), sub: 'This month', accent: '#10b981', trend: 'up', trendVal: '+12%', onClick: () => navigate('/app/records/deals') },
    { label: 'Leads Today', value: String(totalLeads || 23), sub: 'In pipeline', accent: '#2c69ff', trend: 'up', trendVal: '+4', onClick: () => navigate('/app/records/leads') },
    { label: 'Appts Set', value: '12', sub: 'Next 7 days', accent: '#7c3aed', trend: 'up', trendVal: '+3' },
    { label: 'Gross Profit', value: '$284k', sub: 'MTD pace', accent: '#df2424', trend: 'up', trendVal: '+8%' },
    { label: 'Close Rate', value: '31%', sub: 'Last 30 days', accent: '#f59e0b', trend: 'down', trendVal: '-2%' },
    { label: 'Active Tasks', value: String(openTasks || 18), sub: 'Open items', accent: '#ec4899', trend: 'neutral', onClick: () => navigate('/app/workstation') },
  ]

  const recentLeads = leads.data.slice(0, 5)

  return (
    <div className="space-y-5 pb-10">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Control Center
          </h1>
          <p className="text-[0.78rem] text-white/40 mt-0.5">
            National Car Mart · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/records/leads/new')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.8rem] font-semibold text-white transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #c01818, #e83232)',
              boxShadow: '0 2px 12px rgba(223,36,36,0.3)',
            }}
          >
            <Lightning className="h-3.5 w-3.5" />
            New Lead
          </button>
          <button
            onClick={() => navigate('/app/records/deals/new')}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.8rem] font-semibold text-white/70 transition-all hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <CurrencyDollar className="h-3.5 w-3.5" />
            New Deal
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Main 2-column grid */}
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">

        {/* Left/center: Performance + Funnel + Lead Queue */}
        <div className="space-y-4">

          {/* Today's Performance */}
          <div className="rounded-xl p-5" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[0.82rem] font-bold text-white/80 uppercase tracking-widest">Today's Performance</h2>
              <span className="text-[0.7rem] text-white/30">Pace to Goal</span>
            </div>
            <div className="space-y-3">
              <PaceBar label="Units Sold" current={fundedDeals || 3} goal={8} color="#10b981" />
              <PaceBar label="Gross Profit" current={71} goal={100} color="#2c69ff" />
              <PaceBar label="Appointments" current={5} goal={12} color="#7c3aed" />
              <PaceBar label="Leads Contacted" current={14} goal={20} color="#df7c00" />
            </div>
          </div>

          {/* Sales Funnel + Lead Queue */}
          <div className="grid gap-4 md:grid-cols-[200px_1fr]">

            {/* Sales Funnel */}
            <div className="rounded-xl p-4" style={PANEL_STYLE}>
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest mb-4">Sales Funnel</h2>
              <div className="space-y-2">
                {SAMPLE_FUNNEL.map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between text-[0.72rem] mb-1">
                      <span className="text-white/55">{stage.stage}</span>
                      <span className="font-bold text-white/80 tabular-nums">{stage.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${stage.pct}%`, background: stage.color, boxShadow: `0 0 6px ${stage.color}80` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Lead Queue */}
            <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Live Lead Queue</h2>
                <button
                  onClick={() => navigate('/app/records/leads')}
                  className="flex items-center gap-1 text-[0.7rem] text-red-400 hover:text-red-300 transition-colors"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[0.78rem]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <th className="px-4 py-2.5 text-left font-semibold text-white/30 uppercase tracking-wider text-[0.65rem]">Customer</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-white/30 uppercase tracking-wider text-[0.65rem]">Source</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-white/30 uppercase tracking-wider text-[0.65rem]">Score</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-white/30 uppercase tracking-wider text-[0.65rem]">Status</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-white/30 uppercase tracking-wider text-[0.65rem]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-[0.78rem]">
                          No leads yet. Create your first lead to get started.
                        </td>
                      </tr>
                    ) : recentLeads.map((lead, i) => (
                      <tr
                        key={lead.id}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: i < recentLeads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                        onClick={() => navigate(`/app/records/leads/${lead.id}`)}
                      >
                        <td className="px-4 py-2.5 font-semibold text-white/85">{lead.customerName}</td>
                        <td className="px-3 py-2.5 text-white/45">{lead.source}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-12 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: lead.score >= 70 ? '#10b981' : lead.score >= 40 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                            <span className="text-[0.7rem] text-white/50 tabular-nums">{lead.score}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${
                            lead.status === 'converted' ? 'bg-emerald-500/20 text-emerald-400' :
                            lead.status === 'qualified' ? 'bg-blue-500/20 text-blue-400' :
                            lead.status === 'contacted' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-white/10 text-white/40'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button className="flex items-center gap-1 ml-auto text-red-400 hover:text-red-300 text-[0.7rem] font-semibold transition-colors">
                            View <ArrowUpRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar: Attention + Activity + AI Copilot */}
        <div className="space-y-4">

          {/* Needs Attention */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-3.5 w-3.5 text-red-400" />
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Needs Attention</h2>
            </div>
            <div className="space-y-2.5">
              {SAMPLE_ATTENTION.map((item, i) => {
                const Icon = item.icon
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg transition-colors cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  >
                    <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${item.type === 'urgent' ? 'text-red-400' : item.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                    <span className="text-[0.73rem] text-white/65 leading-relaxed">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team Activity */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Team Activity</h2>
            </div>
            <div className="space-y-2.5">
              {SAMPLE_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[0.6rem] font-black text-white"
                    style={{ background: item.color + '33', border: `1px solid ${item.color}60` }}
                  >
                    {item.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.73rem] text-white/75 leading-tight">{item.user}</div>
                    <div className="text-[0.68rem] text-white/40 leading-tight mt-0.5">{item.action}</div>
                  </div>
                  <span className="text-[0.63rem] text-white/25 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Copilot dock */}
          <button
            onClick={() => navigate('/app/ops/assistant')}
            className="w-full rounded-xl p-4 text-left transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(44,105,255,0.15) 100%)',
              border: '1px solid rgba(124,58,237,0.3)',
              boxShadow: '0 0 20px rgba(124,58,237,0.1)',
            }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Robot className="h-4 w-4 text-purple-400" />
              <span className="text-[0.78rem] font-bold text-purple-300 uppercase tracking-widest">AI Copilot</span>
              <span className="ml-auto text-[0.65rem] text-purple-400/60 font-medium">Active</span>
            </div>
            <p className="text-[0.72rem] text-white/45 leading-relaxed">
              3 recommendations ready. Ask anything about your deals, leads, or inventory.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
