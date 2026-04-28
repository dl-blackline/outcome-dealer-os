import { useLeads } from '@/domains/leads/lead.hooks'
import { useDeals } from '@/domains/deals/deal.hooks'
import { useInventory } from '@/domains/inventory/inventory.hooks'
import { useTasks } from '@/domains/tasks/task.hooks'
import { useRouter } from '@/app/router'
import {
  TrendUp, ArrowRight,
  Users, Car, CurrencyDollar, Robot,
  Lightning, Bell, CheckSquare, Square, Calendar, ClockCountdown,
} from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #0F1215 0%, #0C0E11 100%)',
  border: '1px solid rgba(192,195,199,0.08)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(192,195,199,0.03), 0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toRelativeTime(iso?: string): string {
  if (!iso) return 'now'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return 'now'
  const mins = Math.max(0, Math.round((Date.now() - parsed.getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  return `${days}d ago`
}

interface KpiCardProps {
  label: string; value: string; sub: string; accent: string; trend?: 'up' | 'down'; trendVal?: string; onClick?: () => void
}

function KpiCard({ label, value, sub, accent, trend, trendVal, onClick }: KpiCardProps) {
  return (
    <button type="button" onClick={onClick} className="relative flex flex-col justify-between rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:brightness-110 w-full" style={{
      background: `linear-gradient(145deg, #0F1215 0%, #0A0C0F 100%)`,
      borderLeft: `1px solid ${accent}30`,
      borderRight: `1px solid ${accent}30`,
      borderBottom: `1px solid ${accent}30`,
      borderTop: `2px solid ${accent}`,
      borderRadius: '0.75rem',
      boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 20px ${accent}08`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em]" style={{ color: `${accent}cc` }}>{label}</span>
        {trend && trendVal && (
          <span className={`flex items-center gap-0.5 text-[0.68rem] font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendUp className="h-3 w-3" /> : <TrendDown className="h-3 w-3" />}
            {trendVal}
          </span>
        )}
      </div>
      <div className="text-[2rem] font-black tracking-tight text-white leading-none mb-1.5" style={{ fontFamily: 'Oswald, Space Grotesk, sans-serif', textShadow: `0 0 30px ${accent}40` }}>{value}</div>
      <div className="text-[0.65rem] font-medium" style={{ color: 'rgba(192,195,199,0.45)' }}>{sub}</div>
    </button>
  )
}

function PaceBar({ label, current, goal, pct, color }: { label: string; current: string | number; goal: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.75rem]">
        <span className="text-white/60 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/80 font-semibold tabular-nums">{current}</span>
          <span className="text-white/30 text-[0.7rem]">Goal: {goal}</span>
          <span className="text-white/50 text-[0.68rem]">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 8px ${color}80` }} />
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

  const leadsData = leads.data ?? []
  const dealsData = deals.data ?? []
  const inventoryData = inventory.data ?? []
  const tasksData = tasks.data ?? []
  const now = new Date()

  const totalLeads = leadsData.length
  const todayLeads = leadsData.filter((l) => sameDay(new Date(l.createdAt), now)).length
  const appointmentsSet = leadsData.filter((l) => l.status === 'qualified' || l.status === 'converted').length
  const openTasks = tasksData.filter(t => t.status !== 'completed').length
  const completedTasks = tasksData.filter(t => t.status === 'completed').length
  const fundedDeals = dealsData.filter(d => d.status === 'funded').length
  const grossProfit = dealsData
    .filter((d) => ['funded', 'delivered', 'sold_pending_delivery'].includes(d.status))
    .reduce((sum, deal) => sum + (deal.amount || 0), 0)
  const closeRate = totalLeads > 0 ? (dealsData.length / totalLeads) * 100 : 0
  const taskCompletionRate = tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0

  const funnelStages = [
    { stage: 'New Leads', count: leadsData.filter((l) => l.status === 'new').length, color: '#1E3A8A' },
    { stage: 'Contacted', count: leadsData.filter((l) => l.status === 'contacted').length, color: '#7c3aed' },
    { stage: 'Qualified', count: leadsData.filter((l) => l.status === 'qualified').length, color: '#df7c00' },
    { stage: 'Converted', count: leadsData.filter((l) => l.status === 'converted').length, color: '#E31B37' },
    { stage: 'Funded Deals', count: fundedDeals, color: '#10b981' },
  ]
  const funnelBase = Math.max(totalLeads, 1)

  const needsAttention = [
    { label: 'Overdue Tasks', count: tasksData.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now).length, type: 'urgent' as const },
    { label: 'Deals In Progress', count: dealsData.filter((d) => ['structured', 'quoted', 'signed'].includes(d.status)).length, type: 'warning' as const },
    { label: 'Aged Inventory (60+ days)', count: inventoryData.filter((u) => u.daysInStock >= 60).length, type: 'warning' as const },
    { label: 'Open Tasks', count: openTasks, type: 'info' as const },
  ]

  const recentActivity = [
    ...dealsData.slice(0, 3).map((deal) => ({
      user: deal.salesperson || 'Unassigned',
      action: `Updated deal for ${deal.customerName}`,
      time: toRelativeTime(deal.updatedAt || deal.createdAt),
      value: deal.amount ? `+${formatCurrency(deal.amount)}` : undefined,
      color: '#10b981',
    })),
    ...leadsData.slice(0, 3).map((lead) => ({
      user: lead.assignedTo || 'Unassigned',
      action: `Lead captured: ${lead.customerName}`,
      time: toRelativeTime(lead.updatedAt || lead.createdAt),
      value: undefined,
      color: '#1E3A8A',
    })),
  ].slice(0, 5)

  const liveLeadQueue = [...leadsData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const inventorySpotlight = inventoryData.slice(0, 4).map((unit) => ({
    tag: unit.status.toUpperCase(),
    tagColor: unit.status === 'frontline' ? '#10b981' : unit.status === 'aging' ? '#f97316' : unit.status === 'recon' ? '#1E3A8A' : '#C0C3C7',
    year: String(unit.year),
    make: unit.make,
    model: unit.model,
    stock: unit.id.slice(0, 8).toUpperCase(),
    price: formatCurrency(unit.askingPrice || 0),
    miles: unit.daysInStock ? `${unit.daysInStock} days` : 'New',
    views: `VIN ${unit.vin?.slice(-6) || 'N/A'}`,
  }))

  const upcomingEvents = tasksData
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)
    .map((task) => ({
      time: new Date(task.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      label: task.title,
      sub: task.assignedTo,
    }))

  const todaysTasks = tasksData.filter((t) => t.status !== 'completed').slice(0, 5)

  const kpis: KpiCardProps[] = [
    { label: 'Units Sold', value: String(fundedDeals), sub: 'Funded deals', accent: '#E31B37', onClick: () => navigate('/app/records/deals') },
    { label: 'Appointments Set', value: String(appointmentsSet), sub: 'Qualified or converted leads', accent: '#1E3A8A' },
    { label: 'Leads Today', value: String(todayLeads), sub: `${totalLeads} total leads`, accent: '#7c3aed', onClick: () => navigate('/app/records/leads') },
    { label: 'Gross Profit', value: formatCurrency(grossProfit), sub: 'From funded/delivered deals', accent: '#10b981' },
    { label: 'Close Rate', value: `${closeRate.toFixed(1)}%`, sub: 'Deals vs. leads', accent: '#f97316' },
    { label: 'Active Tasks', value: String(openTasks), sub: `${completedTasks} completed`, accent: '#C0C3C7', onClick: () => navigate('/app/workstation') },
  ]

  return (
    <div className="space-y-5 pb-6">

      {/* Page header — mockup-style bold title bar */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-6" style={{
        background: 'linear-gradient(112deg, #0C0E13 0%, #0F1318 60%, #0A0C10 100%)',
        border: '1px solid rgba(227,27,55,0.18)',
        boxShadow: '0 0 60px rgba(227,27,55,0.06), 0 1px 0 rgba(255,255,255,0.03)',
      }}>
        {/* Accent lines */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg, #E31B37 0%, #1E3A8A 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #E31B37 0%, rgba(227,27,55,0.3) 40%, transparent 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 0% 50%, rgba(227,27,55,0.08) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(30,58,138,0.06) 0%, transparent 60%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="pl-3">
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: '#E31B37' }}>National Car Mart · Dealer OS</div>
            <h1 className="text-3xl font-black uppercase text-white leading-none sm:text-4xl" style={{ fontFamily: 'Oswald, Barlow Condensed, Space Grotesk, sans-serif', letterSpacing: '0.04em', textShadow: '0 0 40px rgba(227,27,55,0.25)' }}>CONTROL CENTER</h1>
            <p className="text-[0.78rem] mt-1.5 font-medium" style={{ color: 'rgba(192,195,199,0.55)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Live operations mode</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/app/records/leads/new')} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-bold text-white transition-all hover:brightness-115 hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)', boxShadow: '0 2px 16px rgba(227,27,55,0.5), 0 0 0 1px rgba(227,27,55,0.3)' }}>
              <Lightning className="h-3.5 w-3.5" /> New Lead
            </button>
            <button onClick={() => navigate('/app/records/deals/new')} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] font-semibold text-white/70 transition-all hover:text-white hover:border-white/30 hover:bg-white/5" style={{ border: '1px solid rgba(192,195,199,0.15)', background: 'rgba(255,255,255,0.03)' }}>
              <CurrencyDollar className="h-3.5 w-3.5" /> New Deal
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* Main 3-column grid */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1.6fr_280px]">

        {/* Col 1: Performance + Funnel */}
        <div className="space-y-4">

          {/* Today's Performance */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Today's Performance</h2>
              <span className="text-[0.65rem] text-white/30 border border-white/10 rounded px-2 py-0.5">vs. Daily Goal</span>
            </div>
            <div className="space-y-3">
              <PaceBar label="Units Sold" current={fundedDeals} goal={fundedDeals > 0 ? String(fundedDeals) : 'N/A'} pct={fundedDeals > 0 ? 100 : 0} color="#e31837" />
              <PaceBar label="Gross Profit" current={formatCurrency(grossProfit)} goal={grossProfit > 0 ? formatCurrency(grossProfit) : 'N/A'} pct={grossProfit > 0 ? 100 : 0} color="#2563eb" />
              <PaceBar label="Appointments Set" current={appointmentsSet} goal={appointmentsSet > 0 ? String(appointmentsSet) : 'N/A'} pct={appointmentsSet > 0 ? 100 : 0} color="#7c3aed" />
              <PaceBar label="Lead Volume" current={todayLeads} goal={todayLeads > 0 ? String(todayLeads) : 'N/A'} pct={todayLeads > 0 ? 100 : 0} color="#f97316" />
              <PaceBar label="Task Completion" current={`${taskCompletionRate}%`} goal="100%" pct={taskCompletionRate} color="#10b981" />
            </div>
            <button className="mt-3 text-[0.7rem] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
              All Goals <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Sales Funnel */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Sales Funnel</h2>
              <span className="text-[0.65rem] text-white/30 border border-white/10 rounded px-2 py-0.5">This Month</span>
            </div>
            <div className="space-y-2.5">
              {funnelStages.map((stage) => {
                const pct = Math.min(100, Math.round((stage.count / funnelBase) * 100))
                return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-[0.72rem] mb-1">
                    <span className="text-white/55">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white/80 tabular-nums">{stage.count}</span>
                      <span className="text-white/30 text-[0.65rem]">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: stage.color, boxShadow: `0 0 6px ${stage.color}80` }} />
                  </div>
                </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] text-white/40">Overall Conversion Rate</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{closeRate.toFixed(1)}%</span>
                  <span className="text-[0.65rem] text-emerald-400 flex items-center gap-0.5"><TrendUp className="h-2.5 w-2.5" />Live conversion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Live Lead Queue */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Live Lead Queue</h2>
            <button onClick={() => navigate('/app/records/leads')} className="flex items-center gap-1 text-[0.7rem] text-red-400 hover:text-red-300 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {/* Column headers */}
          <div className="grid px-4 py-2" style={{ gridTemplateColumns: '1fr 100px 120px 50px 80px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {['LEAD', 'SOURCE', 'VEHICLE INTEREST', 'AGE', 'OWNER'].map(h => (
              <div key={h} className="text-[0.6rem] font-semibold uppercase tracking-wider text-white/30">{h}</div>
            ))}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {liveLeadQueue.map((lead) => (
              <div key={lead.id} className="grid px-4 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.025]"
                style={{ gridTemplateColumns: '1fr 100px 120px 50px 80px' }}
                onClick={() => navigate('/app/records/leads')}
              >
                <div>
                  <div className="text-[0.78rem] font-semibold text-white/85">{lead.customerName}</div>
                  <div className="text-[0.65rem] text-white/35">{lead.phone || 'No phone'}</div>
                </div>
                <div className="text-[0.73rem] text-white/50 self-center">{lead.source || 'Unknown'}</div>
                <div className="text-[0.73rem] text-white/65 self-center">{lead.interestedVehicle || 'Not set'}</div>
                <div className="self-center">
                  <span className="text-[0.68rem] font-bold text-red-400">{toRelativeTime(lead.createdAt)}</span>
                </div>
                <div className="text-[0.73rem] text-white/50 self-center">{lead.assignedTo || 'Unassigned'}</div>
              </div>
            ))}
            {liveLeadQueue.length === 0 && (
              <div className="px-4 py-8 text-center text-[0.72rem] text-white/40">No live leads yet. New leads will appear here.</div>
            )}
          </div>
          <div className="px-4 py-2.5 text-[0.65rem] text-white/30 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {totalLeads} Total Leads
          </div>
        </div>

        {/* Col 3: Needs Attention + Team Activity */}
        <div className="space-y-4">

          {/* Needs Attention */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-red-400" />
                <h2 className="text-[0.75rem] font-bold text-white/80 uppercase tracking-widest">Needs Attention</h2>
              </div>
              <button className="text-[0.65rem] text-red-400 hover:text-red-300">View All</button>
            </div>
            <div className="space-y-2">
              {needsAttention.map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${item.type === 'urgent' ? 'bg-red-400' : item.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <span className="text-[0.72rem] text-white/65">{item.label}</span>
                  </div>
                  <span className={`text-[0.75rem] font-bold tabular-nums ${item.type === 'urgent' ? 'text-red-400' : item.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Activity */}
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-400" />
                <h2 className="text-[0.75rem] font-bold text-white/80 uppercase tracking-widest">Team Activity</h2>
              </div>
              <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">View All</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[0.6rem] font-black text-white" style={{ background: item.color + '33', border: `1px solid ${item.color}60` }}>
                    {item.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.72rem] text-white/75 leading-tight font-semibold">{item.user}</div>
                    <div className="text-[0.65rem] text-white/40 leading-tight mt-0.5">{item.action}</div>
                  </div>
                  <div className="text-right">
                    {item.value && <div className="text-[0.68rem] font-bold text-emerald-400">{item.value}</div>}
                    <div className="text-[0.62rem] text-white/25">{item.time}</div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-[0.72rem] text-white/40">No recent activity yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Spotlight */}
      <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Inventory Spotlight</h2>
          <button onClick={() => navigate('/app/records/inventory')} className="flex items-center gap-1 text-[0.7rem] text-red-400 hover:text-red-300 transition-colors">
            View All Inventory <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
          {inventorySpotlight.map((unit) => (
            <div key={unit.stock} className="rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => navigate('/app/records/inventory')}
            >
              {/* Vehicle image placeholder */}
              <div className="relative h-32 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f1219 0%, #161b25 100%)' }}>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[0.6rem] font-bold tracking-wide" style={{ background: unit.tagColor + '30', border: `1px solid ${unit.tagColor}60`, color: unit.tagColor }}>
                  {unit.tag}
                </span>
                <Car className="h-12 w-12 text-white/10" />
              </div>
              <div className="p-3">
                <div className="text-[0.73rem] font-bold text-white/85">{unit.year} {unit.make} {unit.model}</div>
                <div className="text-[0.62rem] text-white/35 mt-0.5">STOCK # {unit.stock}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[0.82rem] font-black text-red-400">{unit.price}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[0.62rem] text-white/35">
                  <span>⚡ {unit.miles}</span>
                  <span>👁 {unit.views}</span>
                </div>
              </div>
            </div>
          ))}
          {inventorySpotlight.length === 0 && (
            <div className="col-span-full rounded-lg border border-white/10 p-8 text-center text-[0.75rem] text-white/45">No inventory synced yet.</div>
          )}
        </div>
      </div>

      {/* Bottom 3-column: AI Copilot + Events + Tasks */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">

        {/* AI Copilot dock */}
        <div className="rounded-xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(30,58,138,0.1) 100%)',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 0 30px rgba(124,58,237,0.08)',
        }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}>
              <Robot className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-[0.78rem] font-bold text-purple-300 uppercase tracking-widest">AI COPILOT</div>
              <div className="text-[0.6rem] text-purple-400/60">BETA</div>
            </div>
            <span className="ml-auto text-[0.65rem] text-purple-400/60 border border-purple-500/20 rounded px-1.5 py-0.5">Active</span>
          </div>
          <p className="text-[0.72rem] text-white/50 leading-relaxed mb-3">
            Ask anything about your dealership. Get insights. Take action.
          </p>
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <input
              placeholder="Ask something… (e.g. 'Show me my top leads')"
              className="flex-1 bg-transparent text-[0.73rem] text-white/70 outline-none placeholder-white/25"
              onClick={() => navigate('/app/ops/assistant')}
              readOnly
            />
            <button className="h-6 w-6 flex items-center justify-center rounded" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <ArrowRight className="h-3 w-3 text-white" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Leads Summary', 'Inventory Insights', 'Sales Trends', 'Top Opportunities'].map(p => (
              <button key={p} onClick={() => navigate('/app/ops/assistant')} className="px-2.5 py-1 rounded text-[0.65rem] text-purple-300/70 transition-colors hover:text-purple-300" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Upcoming Events</h2>
            </div>
            <button onClick={() => navigate('/app/ops/events')} className="flex items-center gap-1 text-[0.65rem] text-blue-400 hover:text-blue-300 transition-colors">
              View Calendar <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {/* Date display */}
          <div className="flex items-center gap-4 mb-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-center">
              <div className="text-[0.65rem] text-white/40 uppercase">MAY</div>
              <div className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>24</div>
              <div className="text-[0.62rem] text-white/35">FRIDAY</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {upcomingEvents.map((ev) => (
                <div key={ev.time} className="flex items-center gap-2">
                  <span className="text-[0.65rem] text-white/35 w-14 shrink-0">{ev.time}</span>
                  <div>
                    <div className="text-[0.72rem] text-white/75 font-medium">{ev.label}</div>
                    <div className="text-[0.6rem] text-white/35">{ev.sub}</div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="text-[0.72rem] text-white/40">No upcoming events from open tasks.</div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Today's Tasks</h2>
              <span className="text-[0.65rem] text-white/30">{openTasks} Incomplete</span>
            </div>
            <button onClick={() => navigate('/app/workstation')} className="text-[0.65rem] text-amber-400 hover:text-amber-300">View All</button>
          </div>
          <div className="space-y-2">
            {todaysTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2.5 p-2 rounded-lg transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              >
                <Square className="h-4 w-4 text-white/20 shrink-0" />
                <span className="flex-1 text-[0.73rem] text-white/70">{task.title}</span>
                <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'text-red-400 bg-red-500/10' : task.priority === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-white/30 bg-white/5'}`}>{task.priority.toUpperCase()}</span>
                <div className="flex items-center gap-0.5 text-[0.62rem] text-white/30">
                  <ClockCountdown className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {todaysTasks.length === 0 && (
              <div className="text-[0.72rem] text-white/40">No open tasks yet.</div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[0.68rem] text-white/35">
              <span>{completedTasks} of {tasksData.length} completed</span>
              <div className="flex-1 mx-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full bg-red-500" style={{ width: `${taskCompletionRate}%` }} />
              </div>
              <span>{taskCompletionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
