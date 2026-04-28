import { useState } from 'react'
import { useRouter } from '@/app/router'
import { useHousehold } from '@/domains/households/household.hooks'
import { useLeads } from '@/domains/leads/lead.hooks'
import { useDeals } from '@/domains/deals/deal.hooks'
import {
  ArrowLeft, Phone, EnvelopeSimple, CalendarBlank, Plus, SpinnerGap,
  MapPin, Chat, Clock, CheckCircle,
  Warning, FileText, Robot, Lightning,
} from '@phosphor-icons/react'

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1B1E23 0%, #141720 100%)',
  border: '1px solid rgba(192,195,199,0.09)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(192,195,199,0.04), 0 8px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
}

const TIMELINE_EVENTS = [
  { time: '10:30 AM', type: 'call', label: 'Outbound Call', desc: 'Spoke with customer about X5 availability and scheduled demo.', actor: 'Sarah Mitchell', actorRole: 'Sales Manager', color: '#1E3A8A' },
  { time: '9:15 AM', type: 'text', label: 'Text Message', desc: 'Sent quick spec comparison and pricing overview.', actor: 'Sarah Mitchell', actorRole: 'Sales Manager', color: '#7c3aed' },
]

const YESTERDAY_EVENTS = [
  { time: 'May 24, 2024', type: 'appt', label: 'Demo Appointment Scheduled', desc: 'Demo scheduled for 2024 BMW X5 xDrive40i', extra: '11:00 AM', color: '#10b981' },
]

const OLDER_EVENTS = [
  { date: 'May 20', label: 'Trade Appraisal Completed', desc: '2020 Audi Q5 Premium - Appraised Value: $24,750', color: '#f97316', actor: 'TradeMax Pro' },
  { date: 'May 18', label: 'Credit Pre-Qualification', desc: 'Pre-qualified for up to $75,000', color: '#10b981', actor: 'Lender One System' },
  { date: 'May 16', label: 'Lead Created', desc: 'Added via Google Ads campaign - Luxury SUV', color: '#6b7280', actor: 'System Automated' },
]

const UPCOMING_TASKS = [
  { label: 'Follow up on demo experience', priority: 'High', date: 'May 24, 2024', time: '11:00 AM' },
  { label: 'Send financing options', priority: 'Medium', date: 'May 25, 2024', time: '2:00 PM' },
  { label: 'Check trade-in documentation', priority: 'Medium', date: 'May 26, 2024', time: '10:00 AM' },
  { label: 'Send vehicle brochure', priority: 'Low', date: 'May 28, 2024', time: '9:00 AM' },
]

const DOCUMENTS = [
  { label: "Driver's License", date: 'Uploaded May 16, 2024', status: 'verified' },
  { label: 'Pay Stubs (2)', date: 'Uploaded May 16, 2024', status: 'verified' },
  { label: 'Trade Title', date: 'Uploaded May 20, 2024', status: 'pending' },
  { label: 'Insurance Card', date: 'Uploaded May 16, 2024', status: 'verified' },
]

const NOTES_TABS = ['Notes', 'Activity', 'Vehicles (2)', 'Trade (1)', 'Credit App', 'Documents (6)']

export function HouseholdRecordPage() {
  const { params, navigate } = useRouter()
  const hhQuery = useHousehold(params.id ?? '')
  const leadsQuery = useLeads()
  const dealsQuery = useDeals()
  const [activeTab, setActiveTab] = useState('Notes')
  const [timelineTab, setTimelineTab] = useState('All Activity')
  const [note, setNote] = useState('')

  if (hhQuery.loading) {
    return <div className="flex min-h-96 items-center justify-center"><SpinnerGap className="h-8 w-8 animate-spin text-red-500/60" /></div>
  }

  const hh = hhQuery.data
  if (!hh) return <div className="py-24 text-center text-white/30">Customer not found.</div>

  const linkedLeads = leadsQuery.data.filter(l => l.householdId === hh.id)
  const linkedDeals = dealsQuery.data.filter(d => linkedLeads.some(l => l.id === d.leadId))
  const initials = hh.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const leadScore = linkedLeads[0]?.score ?? 92

  return (
    <div className="space-y-4 pb-4">
      {/* Breadcrumb + back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[0.72rem] text-white/35">
          <button onClick={() => navigate('/app/records/households')} className="hover:text-white/60 transition-colors">Customers</button>
          <span>/</span>
          <span className="text-white/60">Customer 360</span>
        </div>
        <button onClick={() => navigate('/app/records/households')} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.73rem] text-white/50 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
        </button>
      </div>

      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <span className="text-sm font-black text-white">👤</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Customer 360</h1>
          <p className="text-[0.73rem] text-white/40">Complete view of customer relationships, interactions, and opportunities.</p>
        </div>
      </div>

      {/* Customer Hero Panel */}
      <div className="rounded-xl p-5" style={PANEL_STYLE}>
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-full flex items-center justify-center text-xl font-black text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)', border: '3px solid rgba(255,255,255,0.1)', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}>
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-400 border-2 border-black" />
          </div>

          {/* Name + badges + contact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{hh.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase text-blue-300" style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(30,58,138,0.3)' }}>VIP</span>
              <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase text-emerald-300" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>Loyal Customer</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[0.73rem] text-white/55">
              <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-white/30" /> (312) 555-0187 Mobile</div>
              <div className="flex items-center gap-1.5"><EnvelopeSimple className="h-3.5 w-3.5 text-white/30" /> {hh.name.toLowerCase().replace(' ', '.') + '@email.com'} Email</div>
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-white/30" /> Chicago, IL 60614 · Local Customer</div>
              <div className="flex items-center gap-1.5"><CalendarBlank className="h-3.5 w-3.5 text-white/30" /> Customer Since Mar 18, 2022</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="flex gap-6 flex-wrap">
            <div>
              <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Lead Score</div>
              <div className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#ef4444' }}>{leadScore}</div>
              <div className="text-[0.65rem] text-white/40">High Intent</div>
            </div>
            <div>
              <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Source</div>
              <div className="text-[0.82rem] font-bold text-white/80">Google Ads</div>
              <div className="text-[0.65rem] text-white/40">Paid Search</div>
            </div>
            <div>
              <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Assigned To</div>
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[0.58rem] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>S</div>
                <div>
                  <div className="text-[0.78rem] font-bold text-white/80">Sarah Mitchell</div>
                  <div className="text-[0.62rem] text-white/40">Sales Manager</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Current Stage</div>
              <div className="flex items-center gap-1.5 text-[0.78rem] font-bold text-blue-300">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                Demo Scheduled
              </div>
              <div className="text-[0.62rem] text-white/40">Active</div>
            </div>
            <div>
              <div className="text-[0.6rem] font-semibold uppercase tracking-widest text-white/30 mb-0.5">Desired Vehicle</div>
              <div className="text-[0.78rem] font-bold text-white/80">2024 BMW X5</div>
              <div className="text-[0.62rem] text-white/40">xDrive40i</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mt-4 pt-4 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Call', icon: Phone, color: '#1E3A8A' },
            { label: 'Text', icon: Chat, color: '#7c3aed' },
            { label: 'Email', icon: EnvelopeSimple, color: '#10b981' },
            { label: 'Schedule', icon: CalendarBlank, color: '#f97316' },
          ].map(btn => (
            <button key={btn.label} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[0.78rem] font-semibold text-white/80 transition-all hover:text-white" style={{ background: btn.color + '18', border: `1px solid ${btn.color}30` }}>
              <btn.icon className="h-3.5 w-3.5" style={{ color: btn.color }} />
              {btn.label}
            </button>
          ))}
          <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[0.78rem] font-bold text-white transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)', boxShadow: '0 2px 12px rgba(227,27,55,0.3)' }}
            onClick={() => navigate('/app/records/deals/new')}>
            <Plus className="h-3.5 w-3.5" /> Create Deal
          </button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid gap-4 xl:grid-cols-[280px_1fr_280px]">

        {/* Left: Profile Summary + Vehicle Interests */}
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">Profile Summary</span>
              <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">Edit</button>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Customer Type', value: 'Retail' },
                { label: 'Occupation', value: 'Senior Financial Analyst' },
                { label: 'Annual Income', value: '$125,000+' },
                { label: 'Preferred Contact', value: 'Mobile Phone' },
                { label: 'Best Time to Contact', value: 'Evenings (5PM - 8PM)' },
                { label: 'Communication Pref.', value: 'Text / Email' },
                { label: 'Family Status', value: 'Married, 2 Children' },
                { label: 'Trade-In Vehicle', value: '2020 Audi Q5 Premium' },
                { label: 'Loyalty Tier', value: '⭐ Platinum', highlight: true },
                { label: 'Total Deals', value: String(linkedDeals.length || 3) },
                { label: 'Total Spent', value: `$${hh.lifetimeValue.toLocaleString()}` },
                { label: 'Last Purchase', value: '2023 Audi Q5 Aug 12, 2023' },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-2 text-[0.72rem]">
                  <span className="text-white/35 shrink-0 leading-relaxed">{row.label}</span>
                  <span className={`text-right leading-relaxed ${row.highlight ? 'text-amber-400 font-semibold' : 'text-white/70'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">Vehicle Interests</span>
              <button className="flex items-center gap-1 text-[0.65rem] text-blue-400 hover:text-blue-300"><Plus className="h-3 w-3" /> Add Interest</button>
            </div>
            <div className="space-y-3">
              {[
                { year: '2024', make: 'BMW', model: 'X5 xDrive40i', interest: 90, status: 'New' },
                { year: '2024', make: 'Mercedes', model: 'GLE 450', interest: 75, status: 'New' },
              ].map((v, i) => (
                <div key={i} className="rounded-lg overflow-hidden cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3 p-3">
                    <div className="h-12 w-16 rounded flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #0a0d14, #12161f)' }}>🚗</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.73rem] font-bold text-white/85">{v.year} {v.make} {v.model}</div>
                      <div className="flex items-center justify-between mt-1 mb-1">
                        <span className="text-[0.62rem] text-white/35">Interest Level</span>
                        <span className="text-[0.62rem] font-bold text-blue-400">{v.status}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${v.interest}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />
                      </div>
                      <div className="text-[0.6rem] text-white/35 mt-0.5">{v.interest}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Customer Journey Timeline */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-white/60">Customer Journey Timeline</span>
            <button className="flex items-center gap-1 text-[0.65rem] text-white/35 hover:text-white/60 transition-colors">🔍 Filter</button>
          </div>
          <div className="flex gap-1 px-4 pt-3 overflow-x-auto">
            {['All Activity', 'Communications', 'Appointments', 'Tasks', 'Milestones'].map(t => (
              <button key={t} onClick={() => setTimelineTab(t)} className="shrink-0 px-3 py-1.5 rounded-lg text-[0.7rem] font-medium transition-all"
                style={timelineTab === t ? { background: 'rgba(227,27,55,0.15)', color: '#f87171', border: '1px solid rgba(227,27,55,0.25)' } : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}
              >{t}</button>
            ))}
          </div>
          <div className="p-4 space-y-5 overflow-y-auto" style={{ maxHeight: '480px' }}>
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/30 mb-3">Today</div>
              {TIMELINE_EVENTS.map((evt, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full mt-1 shrink-0" style={{ background: evt.color, boxShadow: `0 0 6px ${evt.color}80` }} />
                    {i < TIMELINE_EVENTS.length - 1 && <div className="flex-1 w-px mt-1" style={{ background: 'rgba(255,255,255,0.07)' }} />}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[0.62rem] text-white/30">{evt.time}</div>
                        <div className="text-[0.78rem] font-semibold text-white/85 mt-0.5">{evt.label}</div>
                        <div className="text-[0.7rem] text-white/50 mt-0.5">{evt.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[0.65rem] font-semibold text-white/55">{evt.actor}</div>
                        <div className="text-[0.6rem] text-white/30">{evt.actorRole}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-widest text-white/30 mb-3">Yesterday</div>
              {YESTERDAY_EVENTS.map((evt, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full mt-1 shrink-0" style={{ background: evt.color, boxShadow: `0 0 6px ${evt.color}80` }} />
                  <div className="flex-1">
                    <div className="text-[0.62rem] text-white/30">{evt.time}</div>
                    <div className="text-[0.78rem] font-semibold text-white/85">{evt.label}</div>
                    <div className="text-[0.7rem] text-white/50">{evt.desc} {evt.extra && `• ${evt.extra}`}</div>
                  </div>
                </div>
              ))}
            </div>
            {OLDER_EVENTS.map((evt, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <div className="h-2.5 w-2.5 rounded-full mt-1 shrink-0" style={{ background: evt.color, boxShadow: `0 0 6px ${evt.color}80` }} />
                <div className="flex-1">
                  <div className="text-[0.62rem] text-white/30">{evt.date}</div>
                  <div className="text-[0.78rem] font-semibold text-white/85">{evt.label}</div>
                  <div className="text-[0.7rem] text-white/50">{evt.desc}</div>
                  <div className="text-[0.62rem] text-white/30 mt-0.5">{evt.actor}</div>
                </div>
              </div>
            ))}
            <button className="w-full text-center text-[0.7rem] text-blue-400 hover:text-blue-300 py-2 transition-colors">View Full Timeline</button>
          </div>
        </div>

        {/* Right: Tasks + Financing + Documents + AI Insights */}
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">Upcoming Tasks</span>
              <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">View All</button>
            </div>
            <div className="space-y-2">
              {UPCOMING_TASKS.map((task, i) => (
                <div key={i} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[0.73rem] font-medium text-white/75 leading-tight">{task.label}</span>
                    <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded shrink-0 ${task.priority === 'High' ? 'bg-red-500/15 text-red-400' : task.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-white/40'}`}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[0.62rem] text-white/30">
                    <CalendarBlank className="h-3 w-3" /> {task.date}
                    <Clock className="h-3 w-3 ml-1.5" /> {task.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">Financing Status</span>
              <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">Edit</button>
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 100 100" className="h-24 w-24">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeDasharray="188 63" strokeDashoffset="-94" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="113 138" strokeDashoffset="-94" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>720</div>
                  <div className="text-[0.58rem] text-emerald-400 font-semibold">Good</div>
                </div>
              </div>
            </div>
            <div className="text-center mb-3">
              <div className="text-[0.6rem] text-white/35">Pre-Qualified</div>
              <div className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>$75,000</div>
              <div className="text-[0.6rem] text-white/30">Credit Limit</div>
            </div>
            <div className="space-y-1.5 text-[0.72rem]">
              {[
                { label: 'Interest Rate', value: '6.24%', sub: 'Est.' },
                { label: 'Term', value: '72 Months', sub: '' },
                { label: 'Monthly Payment', value: '$1,247', sub: 'Est.' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-white/40">{row.label}</span>
                  <div className="text-right">
                    <span className="text-white/80 font-semibold">{row.value}</span>
                    {row.sub && <span className="text-white/30 text-[0.62rem] ml-1">{row.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full text-center text-[0.68rem] text-blue-400 hover:text-blue-300 py-1.5 transition-colors border border-blue-500/20 rounded-lg">
              View Credit Application
            </button>
          </div>

          <div className="rounded-xl p-4" style={PANEL_STYLE}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-white/50">Documents</span>
              <button className="text-[0.65rem] text-blue-400 hover:text-blue-300">View All</button>
            </div>
            <div className="space-y-2">
              {DOCUMENTS.map((doc, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.72rem] font-medium text-white/75">{doc.label}</div>
                    <div className="text-[0.6rem] text-white/30">{doc.date}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.status === 'verified' ? (
                      <span className="text-[0.6rem] text-emerald-400 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> Verified</span>
                    ) : (
                      <span className="text-[0.6rem] text-amber-400 flex items-center gap-0.5"><Warning className="h-3 w-3" /> Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{
            background: 'linear-gradient(145deg, rgba(124,58,237,0.12), rgba(30,58,138,0.08))',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '0.75rem',
          }}>
            <div className="flex items-center gap-2 mb-3">
              <Robot className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-purple-300">AI Insights</span>
              <span className="text-[0.55rem] text-purple-400/50 border border-purple-500/20 rounded px-1 py-0.5">BETA</span>
            </div>
            <div className="text-[0.73rem] text-white/60 leading-relaxed mb-3">
              {hh.name.split(' ')[0]} shows high intent based on engagement patterns. Recommend priority follow-up within 24 hours.
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['High Intent', 'Price Sensitive', 'SUV Shopper', 'Loyal Customer'].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[0.6rem] font-semibold text-purple-300" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[0.68rem] text-purple-300/70">
              <Lightning className="h-3 w-3" />
              Next Best Action: Schedule test drive follow-up
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tabs */}
      <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
        <div className="flex gap-1 px-4 pt-3 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {NOTES_TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t.split(' ')[0])} className="shrink-0 px-4 py-2.5 text-[0.73rem] font-medium transition-all -mb-px"
              style={activeTab === t.split(' ')[0] ? { color: '#f87171', borderBottom: '2px solid #e31837' } : { color: 'rgba(255,255,255,0.45)' }}
            >{t}</button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'Notes' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
                  placeholder={`Add a note about ${hh.name.split(' ')[0]}…`}
                  className="w-full rounded-xl p-3 text-[0.82rem] text-white/70 placeholder-white/20 resize-none outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-[0.75rem] font-semibold text-white/70 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  + Add Note
                </button>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-[0.62rem] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>S</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.73rem] font-semibold text-white/80">Sarah Mitchell</span>
                      <span className="text-[0.6rem] text-blue-400 border border-blue-500/25 rounded px-1.5 py-0.5">Manager Note</span>
                    </div>
                    <p className="text-[0.73rem] text-white/55 leading-relaxed">
                      Great conversation about the X5. {hh.name.split(' ')[0]} is very interested in the premium package and wants to compare lease vs buy options. Follow up after demo.
                    </p>
                    <div className="text-[0.62rem] text-white/25 mt-2">May 22, 2024 at 2:30 PM</div>
                  </div>
                  <button className="text-white/20 hover:text-white/40 transition-colors">⋯</button>
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'Notes' && (
            <div className="py-8 text-center text-[0.78rem] text-white/30">
              {activeTab} content for {hh.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
