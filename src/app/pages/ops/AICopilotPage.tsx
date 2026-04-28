import { useState } from 'react'
import { Robot, PaperPlaneTilt, Paperclip, Microphone, Wrench, Lightning, SpinnerGap } from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { useLeads } from '@/domains/leads/lead.hooks'

const PANEL_STYLE: React.CSSProperties = { // NCM brand
  background: 'linear-gradient(145deg, #0F1215 0%, #0C0E11 100%)',
  border: '1px solid rgba(192,195,199,0.09)',
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px rgba(192,195,199,0.04), 0 8px 32px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
}

type AtRiskDeal = { customer: string; vehicle: string; issue: string; status: string; gross: string }
type LeaderboardRep = { name: string; units: number; gross: string; trend: string }

type MessageData =
  | { type: 'at-risk-deals'; deals: AtRiskDeal[] }
  | { type: 'leaderboard'; reps: LeaderboardRep[] }

interface Message {
  role: 'user' | 'assistant'
  content: string
  data?: MessageData
}

const SAMPLE_MESSAGES: Message[] = [
  {
    role: 'user',
    content: 'Show me the at-risk deals that need attention today.',
  },
  {
    role: 'assistant',
    content: "I've identified 7 deals currently at risk. Here's a summary of deals requiring immediate attention:",
    data: {
      type: 'at-risk-deals',
      deals: [
        { customer: 'David Thompson', vehicle: '2024 BMW X5', issue: 'Lender approval pending 4+ days', status: 'critical', gross: '$4,200' },
        { customer: 'Maria Sanchez', vehicle: '2024 Ford F-150', issue: 'Missing stips: paystubs, proof of insurance', status: 'warning', gross: '$3,800' },
        { customer: 'Chris Johnson', vehicle: '2024 Tesla Model Y', issue: 'Trade payoff higher than expected by $1,200', status: 'warning', gross: '$2,100' },
        { customer: 'Amanda Lee', vehicle: '2024 Chevy Tahoe', issue: "Customer hasn't responded in 3 days", status: 'info', gross: '$5,600' },
      ],
    },
  },
  {
    role: 'user',
    content: 'What are my top performing salespeople this month?',
  },
  {
    role: 'assistant',
    content: 'Based on current month data, here are your top performers:',
    data: {
      type: 'leaderboard',
      reps: [
        { name: 'Justin Ramirez', units: 12, gross: '$48,200', trend: '+22%' },
        { name: 'Sarah Mitchell', units: 10, gross: '$41,800', trend: '+15%' },
        { name: 'Maria Sanchez', units: 9, gross: '$38,500', trend: '+8%' },
      ],
    },
  },
]

const RECOMMENDED_ACTIONS = [
  { label: 'Follow up with 5 hot leads', priority: 'high', icon: '🔥' },
  { label: 'Review 7 at-risk deals', priority: 'high', icon: '⚠️' },
  { label: 'Price drop on 23 aging units', priority: 'medium', icon: '📉' },
  { label: 'Send financing options to 4 customers', priority: 'medium', icon: '💰' },
]

const SUGGESTED_AUTOMATIONS = [
  { label: 'Auto follow-up: leads > 24h no contact', active: false },
  { label: 'Alert manager: deals pending > 5 days', active: true },
  { label: 'Weekly inventory pricing review', active: true },
]

const QUICK_PROMPTS = [
  "Show me today's hot leads",
  'Which deals are at risk?',
  'Inventory aging report',
  'Top performers this month',
  'Upcoming appointments',
  'Lender approval status',
]

const FALLBACK_LEADS = [
  { name: 'Jason Miller', vehicle: '2024 Toyota RAV4', score: 92 },
  { name: 'Maria Sanchez', vehicle: '2024 Ford F-150', score: 88 },
  { name: 'Chris Johnson', vehicle: '2024 Tesla Model Y', score: 75 },
  { name: 'Daniel Murphy', vehicle: '2024 Lexus RX 350', score: 91 },
]

export function AICopilotPage() {
  const { navigate } = useRouter()
  const leads = useLeads()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(SAMPLE_MESSAGES)
  const [loading, setLoading] = useState(false)

  const hotLeads = leads.data
    .filter(l => l.score >= 70)
    .slice(0, 4)
    .map(l => ({ name: l.customerName, vehicle: l.interestedVehicle ?? '2024 Vehicle', score: l.score }))

  const displayLeads = hotLeads.length > 0 ? hotLeads : FALLBACK_LEADS

  function handleSend() {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', content: input }
    const assistantMsg: Message = {
      role: 'assistant',
      content: `Processing your request: "${input}". Give me a moment to analyze your dealership data...`,
    }
    setMessages(prev => [...prev, userMsg, assistantMsg] as Message[])
    setInput('')
    setLoading(false)
  }

  return (
    <div className="flex gap-4 pb-4 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Main: Chat Workspace */}
      <div className="flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden" style={PANEL_STYLE}>
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
            <Robot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[0.85rem] font-bold text-white">AI Copilot</div>
            <div className="text-[0.65rem] text-purple-400/70">BETA · Powered by dealership intelligence</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[0.68rem] text-white/40">Connected</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                  <Robot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-2xl space-y-3 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-xl text-[0.82rem] leading-relaxed ${msg.role === 'user' ? 'text-white/90' : 'text-white/80'}`}
                  style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(30,58,138,0.2))',
                    border: '1px solid rgba(124,58,237,0.25)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {msg.content}
                </div>

                {/* Data cards */}
                {msg.data?.type === 'at-risk-deals' && (
                  <div className="w-full rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-widest text-white/40" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                      At-Risk Deals
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                      {msg.data.deals.map((deal, j) => (
                        <div key={j} className="flex items-center gap-4 px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.78rem] font-semibold text-white/85">{deal.customer}</div>
                            <div className="text-[0.68rem] text-white/40">{deal.vehicle}</div>
                            <div className="text-[0.68rem] text-amber-400 mt-0.5">{deal.issue}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[0.75rem] font-bold text-white/70">{deal.gross}</div>
                            <span className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.5 rounded ${deal.status === 'critical' ? 'bg-red-500/15 text-red-400' : deal.status === 'warning' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>
                              {deal.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.data?.type === 'leaderboard' && (
                  <div className="w-full rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-widest text-white/40" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                      Top Performers
                    </div>
                    {msg.data.reps.map((rep, j) => (
                      <div key={j} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: j < msg.data!.reps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>{rep.name.charAt(0)}</div>
                        <div className="flex-1">
                          <div className="text-[0.78rem] font-semibold text-white/85">{rep.name}</div>
                          <div className="text-[0.65rem] text-white/40">{rep.units} units · {rep.gross}</div>
                        </div>
                        <span className="text-[0.72rem] font-bold text-emerald-400">{rep.trend}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[0.68rem] font-bold text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                  M
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                <Robot className="h-4 w-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-xl text-[0.82rem] text-white/50" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <SpinnerGap className="h-4 w-4 animate-spin inline mr-2" />Analyzing dealership data...
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="px-5 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => setInput(p)} className="shrink-0 px-3 py-1.5 rounded-lg text-[0.68rem] text-purple-300/70 hover:text-purple-300 transition-colors whitespace-nowrap" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-5 pb-4 shrink-0">
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about your dealership…"
              className="flex-1 bg-transparent text-[0.82rem] text-white/80 outline-none placeholder-white/25"
            />
            <div className="flex items-center gap-1.5">
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 transition-colors"><Paperclip className="h-3.5 w-3.5" /></button>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 transition-colors"><Microphone className="h-3.5 w-3.5" /></button>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 transition-colors"><Wrench className="h-3.5 w-3.5" /></button>
              <button onClick={handleSend} className="h-8 w-8 flex items-center justify-center rounded-lg text-white transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 0 10px rgba(124,58,237,0.4)' }}>
                <PaperPlaneTilt className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="shrink-0 w-72 space-y-4 overflow-y-auto">

        {/* Recent Hot Leads */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-white/60">Recent Hot Leads</span>
            <button onClick={() => navigate('/app/records/leads')} className="text-[0.65rem] text-red-400 hover:text-red-300">View All</button>
          </div>
          <div className="p-3 space-y-2">
            {displayLeads.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onClick={() => navigate('/app/records/leads')}
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-[0.62rem] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>{l.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.73rem] font-semibold text-white/80 truncate">{l.name}</div>
                  <div className="text-[0.62rem] text-white/35 truncate">{l.vehicle}</div>
                </div>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[0.6rem] font-black border-2 shrink-0" style={{ borderColor: '#ef4444', color: '#ef4444' }}>{l.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Lightning className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-white/60">Recommended Actions</span>
          </div>
          <div className="p-3 space-y-2">
            {RECOMMENDED_ACTIONS.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <span className="text-base">{a.icon}</span>
                <span className="text-[0.72rem] text-white/70 flex-1">{a.label}</span>
                <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded ${a.priority === 'high' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{a.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Automations */}
        <div className="rounded-xl overflow-hidden" style={PANEL_STYLE}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-white/60">Suggested Automations</span>
          </div>
          <div className="p-3 space-y-3">
            {SUGGESTED_AUTOMATIONS.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-[0.72rem] text-white/60 flex-1 leading-tight">{a.label}</span>
                <div className={`h-5 w-10 rounded-full flex items-center px-0.5 cursor-pointer transition-colors shrink-0 ${a.active ? 'bg-purple-600 justify-end' : 'bg-white/10 justify-start'}`}>
                  <div className="h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* One-click actions */}
        <div className="rounded-xl p-4" style={PANEL_STYLE}>
          <div className="text-[0.72rem] font-bold uppercase tracking-widest text-white/60 mb-3">One-Click Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Generate Report', color: '#1E3A8A' },
              { label: 'Export Data', color: '#10b981' },
              { label: 'Alert Team', color: '#f97316' },
              { label: 'Schedule Follow-ups', color: '#7c3aed' },
            ].map(a => (
              <button key={a.label} className="py-2 px-3 rounded-lg text-[0.68rem] font-semibold text-white/70 hover:text-white transition-colors text-center" style={{ background: a.color + '18', border: `1px solid ${a.color}30` }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
