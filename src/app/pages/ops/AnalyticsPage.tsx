import { useState } from 'react'
import { useRouter } from '@/app/router'
import {
  TrendUp, TrendDown, Download, CalendarBlank, FunnelSimple,
  Robot,
} from '@phosphor-icons/react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, oklch(0.16 0.018 248), oklch(0.13 0.015 248))',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.5)',
}

const SALES_TREND = [
  { month: 'Jan', units: 42, gross: 168000, target: 45 },
  { month: 'Feb', units: 38, gross: 152000, target: 45 },
  { month: 'Mar', units: 51, gross: 204000, target: 50 },
  { month: 'Apr', units: 48, gross: 192000, target: 50 },
  { month: 'May', units: 56, gross: 224000, target: 55 },
  { month: 'Jun', units: 62, gross: 248000, target: 55 },
  { month: 'Jul', units: 58, gross: 232000, target: 60 },
  { month: 'Aug', units: 67, gross: 268000, target: 60 },
  { month: 'Sep', units: 72, gross: 288000, target: 65 },
  { month: 'Oct', units: 65, gross: 260000, target: 65 },
  { month: 'Nov', units: 78, gross: 312000, target: 70 },
  { month: 'Dec', units: 84, gross: 336000, target: 75 },
]

const LEAD_SOURCE_DATA = [
  { source: 'Website', leads: 342, converted: 48 },
  { source: 'Google Ads', leads: 286, converted: 38 },
  { source: 'Facebook', leads: 198, converted: 22 },
  { source: 'Referral', leads: 167, converted: 34 },
  { source: 'Walk-In', leads: 134, converted: 28 },
  { source: 'CarGurus', leads: 121, converted: 18 },
]

const TOP_REPS = [
  { name: 'Justin Ramirez', units: 28, gross: 112000, target: 25, pct: 112 },
  { name: 'Sarah Mitchell', units: 24, gross: 96000, target: 25, pct: 96 },
  { name: 'Maria Sanchez', units: 22, gross: 88000, target: 25, pct: 88 },
  { name: 'Chris Donovan', units: 19, gross: 76000, target: 25, pct: 76 },
  { name: 'David Thompson', units: 17, gross: 68000, target: 25, pct: 68 },
]

const FUNNEL_DATA = [
  { stage: 'New Leads', count: 1248, pct: 100, color: '#2c69ff' },
  { stage: 'Contacted', count: 892, pct: 71.5, color: '#7c3aed' },
  { stage: 'Appointment', count: 445, pct: 35.7, color: '#f97316' },
  { stage: 'Demo', count: 267, pct: 21.4, color: '#e31837' },
  { stage: 'Deal Working', count: 134, pct: 10.7, color: '#10b981' },
  { stage: 'Sold', count: 84, pct: 6.7, color: '#22c55e' },
]

const AI_INSIGHTS = [
  { text: 'Website leads have the highest conversion rate (14.0%) — recommend increasing ad spend', type: 'success' },
  { text: 'Tuesday and Thursday show 23% higher close rates — consider scheduling more demos on these days', type: 'info' },
  { text: '47 units are aged 60+ days — immediate price optimization recommended', type: 'warning' },
  { text: 'Referral program showing 20.4% conversion — top quartile for your market', type: 'success' },
]

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0f1219',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.73rem',
  },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
}

export function AnalyticsPage() {
  const [dateRange] = useState('Last 30 Days')
  const { navigate } = useRouter()

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Analytics &amp; Reports
          </h1>
          <p className="text-[0.78rem] text-white/40 mt-0.5">
            Dealership intelligence, performance metrics, and data insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] text-white/60 transition-colors hover:text-white/80"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] text-white/60 transition-colors hover:text-white/80"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: dateRange, Icon: CalendarBlank },
          { label: 'All Departments', Icon: FunnelSimple },
          { label: 'All Salespeople', Icon: FunnelSimple },
          { label: 'All Sources', Icon: FunnelSimple },
          { label: 'All Stores', Icon: FunnelSimple },
        ].map((f, i) => (
          <button
            key={i}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.75rem] text-white/60 hover:text-white/80 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <f.Icon className="h-3.5 w-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'TOTAL REVENUE', value: '$2.84M', delta: '+22%', accent: '#10b981', up: true },
          { label: 'UNITS SOLD', value: '741', delta: '+18%', accent: '#2c69ff', up: true },
          { label: 'AVG GROSS/UNIT', value: '$3,842', delta: '+7.4%', accent: '#7c3aed', up: true },
          { label: 'LEAD-TO-SALE', value: '13.6%', delta: '+2.8%', accent: '#f97316', up: true },
          { label: 'CUSTOMER SAT', value: '94%', delta: '+3pp', accent: '#e31837', up: true },
          { label: 'MARKET SHARE', value: '18.2%', delta: '+1.4pp', accent: '#a855f7', up: true },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-3.5" style={{ ...PANEL_STYLE, borderTop: `2px solid ${k.accent}` }}>
            <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/35 mb-2">{k.label}</div>
            <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{k.value}</div>
            <div className={`text-[0.62rem] flex items-center gap-0.5 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {k.up ? <TrendUp className="h-2.5 w-2.5" /> : <TrendDown className="h-2.5 w-2.5" />}
              {k.delta} vs. Last Period
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Sales Trend */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Sales Trend</h2>
            <select className="text-[0.7rem] text-white/40 bg-transparent border border-white/10 rounded px-2 py-1 outline-none">
              <option>Units Sold</option>
              <option>Gross Profit</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SALES_TREND}>
              <defs>
                <linearGradient id="unitsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2c69ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2c69ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="units" stroke="#2c69ff" fill="url(#unitsGradient)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="target" stroke="#df2424" strokeDasharray="4 2" fill="none" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Source */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Lead Sources</h2>
            <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">Details</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={LEAD_SOURCE_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis type="category" dataKey="source" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} width={60} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="leads" fill="#2c69ff" opacity={0.7} radius={[0, 3, 3, 0]} />
              <Bar dataKey="converted" fill="#10b981" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_320px]">
        {/* Top Performers */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Gross Profit by Salesperson</h2>
            <button onClick={() => navigate('/app/ops/reports')} className="text-[0.65rem] text-blue-400 hover:text-blue-300">
              Full Report
            </button>
          </div>
          <div className="space-y-3">
            {TOP_REPS.map((rep, i) => (
              <div key={rep.name}>
                <div className="flex items-center justify-between text-[0.73rem] mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white"
                      style={{ background: `hsl(${210 + i * 30}, 70%, 40%)` }}
                    >
                      {rep.name.charAt(0)}
                    </div>
                    <span className="text-white/70">{rep.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[0.68rem]">{rep.units} units</span>
                    <span className="font-bold text-white/80">${(rep.gross / 1000).toFixed(0)}K</span>
                    <span className={`text-[0.65rem] font-bold ${rep.pct >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {rep.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(rep.pct, 100)}%`,
                      background: rep.pct >= 100
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #2c69ff, #60a5fa)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel Conversion */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[0.78rem] font-bold text-white/80 uppercase tracking-widest">Funnel Conversion</h2>
          </div>
          <div className="space-y-2.5">
            {FUNNEL_DATA.map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between text-[0.72rem] mb-1">
                  <span className="text-white/55">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/80 tabular-nums">{stage.count.toLocaleString()}</span>
                    <span className="text-white/30 text-[0.65rem]">{stage.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${stage.pct}%`, background: stage.color, boxShadow: `0 0 6px ${stage.color}60` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[0.68rem] text-white/40">Overall Conversion</span>
            <span className="text-[0.85rem] font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>6.73%</span>
          </div>
        </div>

        {/* AI Insights */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(145deg, rgba(124,58,237,0.12) 0%, rgba(44,105,255,0.08) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '0.75rem',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Robot className="h-4 w-4 text-purple-400" />
            <h2 className="text-[0.78rem] font-bold text-purple-300 uppercase tracking-widest">AI Insights</h2>
            <span className="text-[0.6rem] text-purple-400/50 border border-purple-500/20 rounded px-1.5 py-0.5">BETA</span>
          </div>
          <div className="space-y-2.5">
            {AI_INSIGHTS.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                    insight.type === 'success' ? 'bg-emerald-400' : insight.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                  }`}
                />
                <span className="text-[0.7rem] text-white/65 leading-relaxed">{insight.text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/app/ops/assistant')}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[0.72rem] font-semibold text-purple-300 transition-colors hover:text-purple-200"
            style={{ border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <Robot className="h-3.5 w-3.5" /> Ask AI Copilot for More
          </button>
        </div>
      </div>
    </div>
  )
}
