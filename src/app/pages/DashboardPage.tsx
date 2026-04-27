import { useLeads } from '@/domains/leads/lead.hooks'
import { useDeals } from '@/domains/deals/deal.hooks'
import { useInventory } from '@/domains/inventory/inventory.hooks'
import { useTasks } from '@/domains/tasks/task.hooks'
import { useRouter } from '@/app/router'
import {
  TrendUp, TrendDown, SpinnerGap, ArrowRight,
  Users, Car, CurrencyDollar, Robot,
  Lightning, Bell, CheckSquare, Square, Calendar, ClockCountdown,
} from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
}

const SAMPLE_FUNNEL = [
  { stage: 'New Leads', count: 412, color: '#2c69ff', pct: 100 },
  { stage: 'Contacted', count: 238, color: '#7c3aed', pct: 58 },
  { stage: 'Appt Set', count: 118, color: '#df7c00', pct: 29 },
  { stage: 'Demo', count: 61, color: '#df2424', pct: 15 },
  { stage: 'Delivered', count: 28, color: '#10b981', pct: 7 },
]

const SAMPLE_ATTENTION = [
  { label: 'Overdue Follow-ups', count: 23, type: 'urgent' as const },
  { label: 'Deals at Risk', count: 7, type: 'warning' as const },
  { label: 'Pending Approvals', count: 12, type: 'info' as const },
  { label: 'Unsold Aged Units', count: 18, type: 'warning' as const },
  { label: 'Incomplete Tasks', count: 18, type: 'urgent' as const },
]

const SAMPLE_ACTIVITY = [
  { user: 'Justin Ramirez', action: 'Closed a deal on 2024 Tesla Model Y', time: '5m ago', value: '+$8,750', color: '#10b981' },
  { user: 'Maria Sanchez', action: 'Set appointment with David Thompson', time: '14m ago', color: '#2c69ff' },
  { user: 'Chris Donovan', action: 'Appraised 2021 BMW 3 Series', time: '22m ago', value: '+$450', color: '#7c3aed' },
  { user: 'Samantha Lee', action: 'Added new lead: Robert Johnson', time: '28m ago', color: '#df2424' },
]

const INVENTORY_SPOTLIGHT = [
  { tag: 'NEW ARRIVAL', tagColor: '#10b981', year: '2024', make: 'BMW', model: 'X5 xDrive40i', stock: 'B24127', price: '$62,995', miles: '12 mi', views: '15 Views' },
  { tag: 'HOT UNIT', tagColor: '#ef4444', year: '2024', make: 'Ford', model: 'F-150 Lariat', stock: 'F24189', price: '$54,995', miles: '8 mi', views: '28 Views' },
  { tag: 'PRICE DROP', tagColor: '#f97316', year: '2023', make: 'Dodge', model: 'Challenger R/T', stock: 'D23156', price: '$42,995', miles: '18,245 mi', views: '42 Views' },
  { tag: 'CERTIFIED', tagColor: '#2c69ff', year: '2023', make: 'Audi', model: 'Q5 Premium', stock: 'A23177', price: '$38,995', miles: '22,104 mi', views: '31 Views' },
]

const UPCOMING_EVENTS = [
  { time: '9:00 AM', label: 'Staff Meeting', sub: 'Conference Room' },
  { time: '11:00 AM', label: 'Sales Training', sub: 'Training Room' },
  { time: '2:00 PM', label: 'Inventory Meeting', sub: 'Online' },
  { time: '4:30 PM', label: 'Happy Hour', sub: 'Rooftop Lounge' },
]

const TODAYS_TASKS = [
  { label: 'Follow up with 5 hot leads', priority: 'High', due: '11:00 AM', done: false },
  { label: 'Send proposals to 3 customers', priority: 'High', due: '1:00 PM', done: false },
  { label: 'Complete manager approvals', priority: 'Medium', due: '2:00 PM', done: false },
  { label: 'Update aged inventory pricing', priority: 'Medium', due: '3:00 PM', done: false },
  { label: 'Weekly sales report', priority: 'Low', due: '5:00 PM', done: false },
]

const LIVE_LEADS = [
  { name: 'Sarah Mitchell', phone: '(216) 555-0142', source: 'Website', vehicle: '2024 BMW X5', age: '5m', owner: 'Justin R.' },
  { name: 'David Thompson', phone: '(216) 555-0188', source: 'Google Ads', vehicle: '2024 Ford F-150', age: '12m', owner: 'Maria S.' },
  { name: 'James Anderson', phone: '(216) 555-0173', source: 'Walk-In', vehicle: '2023 Dodge Charger', age: '18m', owner: 'Chris D.' },
  { name: 'Jennifer Lee', phone: '(216) 555-0167', source: 'Referral', vehicle: '2024 Tesla Model Y', age: '25m', owner: 'Justin R.' },
  { name: 'Robert Johnson', phone: '(216) 555-0139', source: 'Facebook', vehicle: '2024 Chevy Silverado', age: '32m', owner: 'Maria S.' },
]

interface KpiCardProps {
  label: string; value: string; sub: string; accent: string; trend?: 'up' | 'down'; trendVal?: string; onClick?: () => void
}

function KpiCard({ label, value, sub, accent, trend, trendVal, onClick }: KpiCardProps) {
  return (
    <button type="button" onClick={onClick} className="relative flex flex-col justify-between rounded-xl p-4 text-left transition-all hover:scale-[1.01] w-full" style={{ ...PANEL_STYLE, borderTop: `2px solid ${accent}`, cursor: onClick ? 'pointer' : 'default' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/40">{label}</span>
        {trend && trendVal && (
          <span className={`flex items-center gap-0.5 text-[0.68rem] font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendUp className="h-3 w-3" /> : <TrendDown className="h-3 w-3" />}
            {trendVal}
          </span>
        )}
      </div>
      <div className="text-[1.9rem] font-black tracking-tight text-white leading-none mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
      <div className="text-[0.68rem] text-white/35">{sub}</div>
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

  const loading = leads.loading || deals.loading || inventory.loading || tasks.loading

  if (loading) {
    return <div className="flex min-h-96 items-center justify-center"><SpinnerGap className="h-8 w-8 animate-spin text-red-500/60" /></div>
  }

  const totalLeads = leads.data.length
  const openTasks = tasks.data.filter(t => t.status !== 'completed').length
  const fundedDeals = deals.data.filter(d => d.status === 'funded').length

  const kpis: KpiCardProps[] = [
    { label: 'Units Sold', value: String(fundedDeals || 28), sub: '+16% vs. Yesterday', accent: '#e31837', trend: 'up', trendVal: '+16%', onClick: () => navigate('/app/records/deals') },
    { label: 'Appointments Set', value: '52', sub: '+24% vs. Yesterday', accent: '#2563eb', trend: 'up', trendVal: '+24%' },
    { label: 'Leads Today', value: String(totalLeads || 142), sub: '+18% vs. Yesterday', accent: '#7c3aed', trend: 'up', trendVal: '+18%', onClick: () => navigate('/app/records/leads') },
    { label: 'Gross Profit', value: '$184,750', sub: '+22% vs. Yesterday', accent: '#10b981', trend: 'up', trendVal: '+22%' },
    { label: 'Close Rate', value: '24.6%', sub: '-5.2pp vs. Yesterday', accent: '#f97316', trend: 'down', trendVal: '-5.2pp' },
    { label: 'Active Tasks', value: String(openTasks || 18), sub: '-4 vs. Yesterday', accent: '#a855f7', trend: 'down', trendVal: '-4', onClick: () => navigate('/app/workstation') },
  ]

  return (
    <div className="space-y-4 pb-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Control Center</h1>
          <p className="text-[0.78rem] text-white/40 mt-0.5">National Car Mart · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/app/records/leads/new')} className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.8rem] font-semibold text-white transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #c01818, #e83232)', boxShadow: '0 2px 12px rgba(223,36,36,0.3)' }}>
            <Lightning className="h-3.5 w-3.5" /> New Lead
          </button>
          <button onClick={() => navigate('/app/records/deals/new')} className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.8rem] font-semibold text-white/70 transition-all hover:text-white" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <CurrencyDollar className="h-3.5 w-3.5" /> New Deal
          </button>
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
              <PaceBar label="Units Sold" current={fundedDeals || 28} goal="45" pct={62} color="#e31837" />
              <PaceBar label="Gross Profit" current="$184,750" goal="$250K" pct={74} color="#2563eb" />
              <PaceBar label="Appointments Set" current={52} goal="70" pct={74} color="#7c3aed" />
              <PaceBar label="Show Rate" current="62%" goal="70%" pct={89} color="#f97316" />
              <PaceBar label="Close Rate" current="24.6%" goal="25%" pct={98} color="#10b981" />
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
              {SAMPLE_FUNNEL.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-[0.72rem] mb-1">
                    <span className="text-white/55">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white/80 tabular-nums">{stage.count}</span>
                      <span className="text-white/30 text-[0.65rem]">{stage.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${stage.pct}%`, background: stage.color, boxShadow: `0 0 6px ${stage.color}80` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[0.68rem] text-white/40">Overall Conversion Rate</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>6.8%</span>
                  <span className="text-[0.65rem] text-emerald-400 flex items-center gap-0.5"><TrendUp className="h-2.5 w-2.5" />1.2pp vs. Last Month</span>
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
            {LIVE_LEADS.map((lead, i) => (
              <div key={i} className="grid px-4 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.025]"
                style={{ gridTemplateColumns: '1fr 100px 120px 50px 80px' }}
                onClick={() => navigate('/app/records/leads')}
              >
                <div>
                  <div className="text-[0.78rem] font-semibold text-white/85">{lead.name}</div>
                  <div className="text-[0.65rem] text-white/35">{lead.phone}</div>
                </div>
                <div className="text-[0.73rem] text-white/50 self-center">{lead.source}</div>
                <div className="text-[0.73rem] text-white/65 self-center">{lead.vehicle}</div>
                <div className="self-center">
                  <span className="text-[0.68rem] font-bold text-red-400">{lead.age}</span>
                </div>
                <div className="text-[0.73rem] text-white/50 self-center">{lead.owner}</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 text-[0.65rem] text-white/30 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            142 Total Leads
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
              {SAMPLE_ATTENTION.map((item) => (
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
              {SAMPLE_ACTIVITY.map((item, i) => (
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
          {INVENTORY_SPOTLIGHT.map((unit) => (
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
        </div>
      </div>

      {/* Bottom 3-column: AI Copilot + Events + Tasks */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">

        {/* AI Copilot dock */}
        <div className="rounded-xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(44,105,255,0.1) 100%)',
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
              {UPCOMING_EVENTS.map((ev) => (
                <div key={ev.time} className="flex items-center gap-2">
                  <span className="text-[0.65rem] text-white/35 w-14 shrink-0">{ev.time}</span>
                  <div>
                    <div className="text-[0.72rem] text-white/75 font-medium">{ev.label}</div>
                    <div className="text-[0.6rem] text-white/35">{ev.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-3.5 w-3.5 text-amber-400" />
              <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Today's Tasks</h2>
              <span className="text-[0.65rem] text-white/30">{openTasks || 18} Incomplete</span>
            </div>
            <button onClick={() => navigate('/app/workstation')} className="text-[0.65rem] text-amber-400 hover:text-amber-300">View All</button>
          </div>
          <div className="space-y-2">
            {TODAYS_TASKS.map((task) => (
              <div key={task.label} className="flex items-center gap-2.5 p-2 rounded-lg transition-colors cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              >
                <Square className="h-4 w-4 text-white/20 shrink-0" />
                <span className="flex-1 text-[0.73rem] text-white/70">{task.label}</span>
                <span className={`text-[0.62rem] font-bold px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'text-red-400 bg-red-500/10' : task.priority === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-white/30 bg-white/5'}`}>{task.priority}</span>
                <div className="flex items-center gap-0.5 text-[0.62rem] text-white/30">
                  <ClockCountdown className="h-3 w-3" />
                  {task.due}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[0.68rem] text-white/35">
              <span>5 of {openTasks || 18} completed</span>
              <div className="flex-1 mx-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full bg-red-500" style={{ width: '28%' }} />
              </div>
              <span>28%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
