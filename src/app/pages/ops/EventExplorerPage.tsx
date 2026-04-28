import { useState } from 'react'
import { CaretLeft, CaretRight, Plus } from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = { // NCM brand
  background: 'linear-gradient(145deg, #1B1E23 0%, #141720 100%)',
  border: '1px solid rgba(192,195,199,0.09)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(192,195,199,0.04), 0 8px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
}

const EVENT_COLORS = {
  appt: { bg: 'rgba(227,27,55,0.25)', border: '#E31B37', text: '#fca5a5' },
  desk: { bg: 'rgba(30,58,138,0.25)', border: '#1E3A8A', text: '#93c5fd' },
  demo: { bg: 'rgba(124,58,237,0.25)', border: '#7c3aed', text: '#c4b5fd' },
  delivery: { bg: 'rgba(16,185,129,0.25)', border: '#10b981', text: '#6ee7b7' },
  team: { bg: 'rgba(245,158,11,0.25)', border: '#f59e0b', text: '#fcd34d' },
}

const WEEK_DAYS = [
  { day: 'SUN', date: 18, isToday: false },
  { day: 'MON', date: 19, isToday: false },
  { day: 'TUE', date: 20, isToday: true },
  { day: 'WED', date: 21, isToday: false },
  { day: 'THU', date: 22, isToday: false },
  { day: 'FRI', date: 23, isToday: false },
  { day: 'SAT', date: 24, isToday: false },
]

const WEEK_EVENTS: Record<number, Array<{ time: string; label: string; sub: string; type: keyof typeof EVENT_COLORS; topPct: number; heightPct: number }>> = {
  19: [
    { time: '10:00 AM', label: 'Appt: Sarah Mitchell', sub: '2024 BMW X5 • Trade + Test Drive', type: 'appt', topPct: 22, heightPct: 11 },
    { time: '11:00 AM', label: 'Desk Meeting', sub: 'Manager 1:1 • Michael Carter', type: 'desk', topPct: 33, heightPct: 9 },
    { time: '4:00 PM', label: 'Team Event', sub: 'Product Training Showroom', type: 'team', topPct: 72, heightPct: 9 },
  ],
  20: [
    { time: '9:00 AM', label: 'Appt: David Thompson', sub: '2024 Ford F-150 • Test Drive', type: 'appt', topPct: 11, heightPct: 9 },
    { time: '10:00 AM', label: 'Appt: Maria Sanchez', sub: '2024 Tesla Model Y • Test Drive', type: 'appt', topPct: 22, heightPct: 9 },
    { time: '11:00 AM', label: 'Desk Meeting', sub: 'Finance Sync', type: 'desk', topPct: 33, heightPct: 7 },
    { time: '12:00 PM', label: 'Desk Meeting', sub: 'Finance Sync • Finance Office', type: 'desk', topPct: 44, heightPct: 7 },
    { time: '1:00 PM', label: 'Demo: 2024 Audi Q5', sub: 'John D.', type: 'demo', topPct: 55, heightPct: 9 },
    { time: '2:00 PM', label: 'Demo: 2024 Dodge Charger', sub: 'Chris D.', type: 'demo', topPct: 64, heightPct: 9 },
    { time: '2:30 PM', label: 'Delivery', sub: '2024 Tesla Model Y • Maria Sanchez', type: 'delivery', topPct: 70, heightPct: 7 },
    { time: '5:00 PM', label: 'Demo: 2024 GMC Sierra 1500', sub: 'Robert J.', type: 'demo', topPct: 88, heightPct: 9 },
  ],
  21: [
    { time: '9:00 AM', label: 'Appt: Chris Dawson', sub: '2023 Chevy Silverado • Test Drive', type: 'appt', topPct: 11, heightPct: 9 },
    { time: '10:00 AM', label: 'Appt: Justin R.', sub: '2026 Lexus RX • Test Drive', type: 'appt', topPct: 22, heightPct: 9 },
    { time: '11:30 AM', label: 'Desk Meeting', sub: 'Sales Strategy Conference Room', type: 'desk', topPct: 38, heightPct: 9 },
  ],
  22: [
    { time: '10:00 AM', label: 'Appt', sub: '2024 Lexus RX • Test Drive', type: 'appt', topPct: 22, heightPct: 9 },
    { time: '1:00 PM', label: 'Desk Meeting', sub: 'BDC Huddle • Virtual', type: 'desk', topPct: 55, heightPct: 9 },
    { time: '2:00 PM', label: 'Demo: 2024 Mercedes GLC', sub: 'Emily W.', type: 'demo', topPct: 66, heightPct: 9 },
    { time: '4:30 PM', label: 'Delivery', sub: '2024 Lexus RX • Justin R.', type: 'delivery', topPct: 82, heightPct: 7 },
  ],
  23: [
    { time: '9:30 AM', label: 'Desk Meeting', sub: 'Weekly Review Conference Room', type: 'desk', topPct: 15, heightPct: 9 },
    { time: '10:00 AM', label: 'Appt: Alex Johnson', sub: '2024 Audi Q7 • Test Drive', type: 'appt', topPct: 22, heightPct: 9 },
    { time: '11:00 AM', label: 'Appt: Emily Watson', sub: '2024 Mercedes GLC • Test Drive', type: 'appt', topPct: 33, heightPct: 9 },
    { time: '1:00 PM', label: 'Delivery', sub: '2024 Audi Q7 • Alex Johnson', type: 'delivery', topPct: 55, heightPct: 7 },
    { time: '2:00 PM', label: 'Demo: 2024 BMW X3', sub: 'James T.', type: 'demo', topPct: 66, heightPct: 9 },
    { time: '3:00 PM', label: 'Desk Meeting', sub: 'Inventory Review Showroom', type: 'desk', topPct: 77, heightPct: 9 },
    { time: '5:00 PM', label: 'Team Event', sub: 'Happy Hour Offsite', type: 'team', topPct: 88, heightPct: 7 },
  ],
  24: [
    { time: 'All Day', label: 'Monthly Sales Huddle', sub: 'All Day', type: 'desk', topPct: 2, heightPct: 6 },
  ],
}

const MY_TASKS = [
  { label: 'Follow up: Maria Sanchez', time: '9:00 AM', done: true },
  { label: 'Credit App: Maria Sanchez', time: '10:15 AM', done: true },
  { label: 'Trade Appraisal: 2020 Model Y', time: '11:30 AM', done: false, overdue: true },
  { label: 'Prepare Docs: Deal #5721', time: '1:00 PM', done: false, overdue: true },
  { label: 'Insurance: Maria Sanchez', time: '2:00 PM', done: false, overdue: true },
  { label: 'Final Walkaround', time: '2:30 PM', done: false },
  { label: 'Delivery: 2024 Model Y', time: '2:30 PM', done: false },
  { label: 'Follow up: Robert Johnson', time: '4:15 PM', done: false },
  { label: 'Desk Meeting: Finance Sync', time: '12:00 PM', done: false },
]

const OVERDUE_TASKS = [
  { label: 'Follow up: Jake Anderson', overdue: 'Overdue 2d' },
  { label: 'Credit App: Maria Sanchez', overdue: 'Overdue 1d' },
  { label: 'Trade Appraisal: 2020 F-150', overdue: 'Overdue 1d' },
  { label: 'Doc Prep: Deal #5687', overdue: 'Overdue 3d' },
  { label: 'Insurance: Chris Dawson', overdue: 'Overdue 1d' },
]

const TEAM_AVAILABILITY = [
  { name: 'Sarah Mitchell', pct: 78, status: 'available' },
  { name: 'David Thompson', pct: 92, status: 'busy' },
  { name: 'Chris Dawson', pct: 65, status: 'available' },
  { name: 'Maria Sanchez', pct: 88, status: 'busy' },
  { name: 'Justin Ramirez', pct: 74, status: 'available' },
]

const HOURS = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM']

const BOTTOM_STATS = [
  { label: "TODAY'S APPOINTMENTS", val: '3', delta: '↑ 20% vs yesterday', up: true },
  { label: "TODAY'S DEMOS", val: '1', delta: '↓ 0% vs yesterday', up: false },
  { label: "TODAY'S DELIVERIES", val: '1', delta: '↑ 100% vs yesterday', up: true },
  { label: 'TASKS COMPLETED', val: '6/9', delta: '67%', up: true },
  { label: 'OVERDUE TASKS', val: '5', delta: '↓ 2 vs yesterday', up: false },
  { label: 'UPCOMING EVENTS', val: '4', delta: 'Next: Desk Meeting 12:00 PM', up: true },
]

export function EventExplorerPage() {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('week')

  return (
    <div className="flex gap-4 pb-4 h-full min-h-0">
      {/* Left Sidebar */}
      <div className="shrink-0 w-52 space-y-4 overflow-y-auto">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Calendar &amp; Execution</h1>
          <p className="text-[0.73rem] text-white/40 mt-0.5">Schedule everything. Execute flawlessly.</p>
        </div>

        {/* Agenda Snapshot */}
        <div className="rounded-xl p-3.5" style={PANEL_STYLE}>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2">Agenda Snapshot</div>
          <div className="text-[0.72rem] text-white/50 mb-3">Saturday, May 18 · ☁️ 72°F</div>
          <div className="space-y-1.5">
            {[
              { label: 'Appointments', count: 8, icon: '📅' },
              { label: 'Demos', count: 3, icon: '🚗' },
              { label: 'Deliveries', count: 2, icon: '🚚' },
              { label: 'Meetings', count: 2, icon: '🗓' },
              { label: 'Tasks Due', count: 14, icon: '⏰', color: '#ef4444' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem]">{item.icon}</span>
                  <span className="text-[0.72rem] text-white/60">{item.label}</span>
                </div>
                <span className="text-[0.78rem] font-bold tabular-nums" style={{ color: item.color ?? 'rgba(255,255,255,0.8)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Add */}
        <div className="rounded-xl p-3.5" style={PANEL_STYLE}>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2.5">Quick Add</div>
          <div className="space-y-2">
            {[
              { label: 'New Appointment', color: '#E31B37', bg: 'rgba(227,27,55,0.15)', border: 'rgba(227,27,55,0.3)' },
              { label: 'New Task', color: '#1E3A8A', bg: 'rgba(30,58,138,0.15)', border: 'rgba(30,58,138,0.3)' },
              { label: 'Desk / Meeting', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
              { label: 'Team Event', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
            ].map(btn => (
              <button key={btn.label} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[0.72rem] font-semibold transition-all hover:brightness-110" style={{ background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color }}>
                <Plus className="h-3 w-3" /> {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Filters */}
        <div className="rounded-xl p-3.5" style={PANEL_STYLE}>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 mb-2.5">Task Filters</div>
          <div className="space-y-1.5">
            {[
              { label: 'All Tasks', count: 24 },
              { label: 'Follow Ups', count: 7 },
              { label: 'Appointments', count: 8 },
              { label: 'Deliveries', count: 2 },
              { label: 'Desk Meetings', count: 3 },
              { label: 'Overdue', count: 5, color: '#ef4444' },
            ].map(f => (
              <label key={f.label} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-red-500 h-3 w-3" />
                  <span className="text-[0.72rem] text-white/60">{f.label}</span>
                </div>
                <span className="text-[0.68rem] font-bold tabular-nums" style={{ color: f.color ?? 'rgba(255,255,255,0.4)' }}>{f.count}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="rounded-xl p-3.5" style={PANEL_STYLE}>
          <div className="text-[0.65rem] font-bold uppercase tracking-widest text-red-400/70 mb-2.5">Overdue Tasks</div>
          <div className="space-y-2">
            {OVERDUE_TASKS.map((t, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <span className="text-[0.7rem] text-white/60 leading-tight flex-1">{t.label}</span>
                <span className="text-[0.62rem] font-bold text-red-400 shrink-0 whitespace-nowrap">{t.overdue}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-[0.65rem] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            View all overdue tasks →
          </button>
        </div>
      </div>

      {/* Center: Calendar */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Top toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 rounded-lg text-[0.78rem] font-semibold text-white/70 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Today</button>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}><CaretLeft className="h-4 w-4" /></button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}><CaretRight className="h-4 w-4" /></button>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-[0.78rem] text-white/70" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            📅 May 18 – May 24, 2024
          </button>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {(['Month', 'Week', 'Day', 'Agenda'] as const).map((v) => (
              <button key={v} onClick={() => setViewMode(v.toLowerCase() as typeof viewMode)}
                className="px-3 py-2 text-[0.75rem] font-medium transition-all"
                style={viewMode === v.toLowerCase() ? { background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}
              >{v}</button>
            ))}
          </div>
          <select className="rounded-lg px-3 py-2 text-[0.73rem] text-white/60 outline-none" style={{ background: '#0B0D10', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option>All Departments</option>
          </select>
          <select className="rounded-lg px-3 py-2 text-[0.73rem] text-white/60 outline-none" style={{ background: '#0B0D10', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option>All Salespeople</option>
          </select>
        </div>

        {/* Weekly Calendar Grid */}
        <div className="rounded-xl overflow-hidden flex-1" style={PANEL_STYLE}>
          {/* Day headers */}
          <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-12" />
            {WEEK_DAYS.map((d) => (
              <div key={d.date} className="h-12 flex flex-col items-center justify-center" style={d.isToday ? { borderBottom: '2px solid #2563eb' } : {}}>
                <div className="text-[0.62rem] text-white/40 uppercase tracking-wide">{d.day}</div>
                <div className={`flex items-center justify-center h-7 w-7 rounded-full text-[0.85rem] font-bold mt-0.5 ${d.isToday ? 'bg-blue-600 text-white' : 'text-white/70'}`}>{d.date}</div>
                {d.isToday && <div className="text-[0.55rem] text-blue-400 uppercase tracking-widest">TODAY</div>}
              </div>
            ))}
          </div>
          {/* Time grid */}
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            <div className="grid relative" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              {/* Time labels column */}
              <div>
                {HOURS.map(h => (
                  <div key={h} className="h-16 flex items-start justify-end pr-2 pt-1">
                    <span className="text-[0.6rem] text-white/25 whitespace-nowrap">{h}</span>
                  </div>
                ))}
              </div>
              {/* Day columns */}
              {WEEK_DAYS.map((d) => (
                <div key={d.date} className="relative border-l" style={{ borderColor: 'rgba(255,255,255,0.04)', height: `${HOURS.length * 64}px` }}>
                  {/* Hour lines */}
                  {HOURS.map((_, i) => (
                    <div key={i} className="absolute left-0 right-0" style={{ top: `${i * 64}px`, borderTop: '1px solid rgba(255,255,255,0.04)' }} />
                  ))}
                  {/* Today indicator */}
                  {d.isToday && (
                    <div className="absolute left-0 right-0 flex items-center" style={{ top: '230px', zIndex: 10 }}>
                      <div className="h-2 w-2 rounded-full bg-red-500 -ml-1" />
                      <div className="flex-1 h-px bg-red-500 opacity-60" />
                    </div>
                  )}
                  {/* Events */}
                  {(WEEK_EVENTS[d.date] ?? []).map((evt, i) => {
                    const colors = EVENT_COLORS[evt.type]
                    return (
                      <div key={i} className="absolute left-1 right-1 rounded-md overflow-hidden cursor-pointer transition-all hover:brightness-110"
                        style={{
                          top: `${evt.topPct * HOURS.length * 64 / 100}px`,
                          height: `${evt.heightPct * HOURS.length * 64 / 100}px`,
                          background: colors.bg,
                          border: `1px solid ${colors.border}40`,
                          padding: '3px 5px',
                        }}
                      >
                        <div className="text-[0.58rem] font-bold leading-tight" style={{ color: colors.text }}>{evt.time}</div>
                        <div className="text-[0.6rem] font-semibold leading-tight" style={{ color: colors.text }}>{evt.label}</div>
                        <div className="text-[0.55rem] leading-tight text-white/40 truncate">{evt.sub}</div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats strip */}
        <div className="grid grid-cols-6 gap-3">
          {BOTTOM_STATS.map((s, i) => (
            <div key={i} className="rounded-xl p-3" style={PANEL_STYLE}>
              <div className="text-[0.58rem] font-bold uppercase tracking-widest text-white/35">{s.label}</div>
              <div className="text-lg font-black text-white mt-0.5" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.val}</div>
              <div className={`text-[0.6rem] mt-0.5 ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar: Today Panel */}
      <div className="shrink-0 w-64 space-y-4">
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div className="text-[0.7rem] font-bold text-white/80 uppercase tracking-widest">TODAY</div>
              <div className="text-[0.62rem] text-white/40">Tuesday, May 20</div>
            </div>
            <button className="h-6 w-6 flex items-center justify-center rounded text-white/30 hover:text-white/60 transition-colors">✕</button>
          </div>

          {/* My Tasks */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">My Tasks</div>
              <span className="text-[0.65rem] text-white/35">6/9</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full bg-red-500" style={{ width: '67%' }} />
            </div>
            <div className="space-y-1.5">
              {MY_TASKS.map((t, i) => (
                <div key={i} className={`flex items-center gap-2 cursor-pointer transition-colors ${t.overdue ? 'opacity-90' : ''}`}>
                  <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 ${t.done ? 'bg-emerald-500/20 border border-emerald-500/40' : 'border border-white/15'}`}>
                    {t.done && <span className="text-[0.6rem] text-emerald-400">✓</span>}
                  </div>
                  <span className={`text-[0.7rem] flex-1 ${t.done ? 'line-through text-white/30' : 'text-white/65'}`}>{t.label}</span>
                  <span className={`text-[0.6rem] shrink-0 ${t.overdue ? 'text-red-400 font-bold' : 'text-white/30'}`}>{t.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50 mb-2.5">🔔 Reminders</div>
          <div className="space-y-2">
            {[
              { label: 'Monthly Sales Reports due', date: 'May 25' },
              { label: 'Inventory Count', date: 'May 27' },
              { label: 'Training: New CRM Features', date: 'May 28' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[0.7rem] text-white/60">{r.label}</span>
                <span className="text-[0.65rem] text-white/35">{r.date}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-[0.65rem] text-blue-400 hover:text-blue-300 transition-colors">View all reminders →</button>
        </div>

        {/* Team Availability */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">Team Availability</div>
            <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">View all</button>
          </div>
          <div className="space-y-3">
            {TEAM_AVAILABILITY.map((m) => (
              <div key={m.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                      {m.name.charAt(0)}
                    </div>
                    <span className="text-[0.72rem] text-white/70">{m.name}</span>
                  </div>
                  <span className="text-[0.65rem] text-white/40">{m.pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.status === 'available' ? '#10b981' : m.status === 'busy' ? '#f97316' : '#6b7280' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            {[{ color: '#10b981', label: 'Available' }, { color: '#f97316', label: 'Busy' }, { color: '#6b7280', label: 'Out of Office' }].map(s => (
              <div key={s.label} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[0.6rem] text-white/35">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
