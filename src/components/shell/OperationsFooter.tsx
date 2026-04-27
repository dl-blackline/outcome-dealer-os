import { TrendUp, TrendDown, MapPin } from '@phosphor-icons/react'

const METRICS = [
  { label: 'SERVICE APPTS.', value: '48', delta: '+12%', up: true },
  { label: 'PARTS ORDERS', value: '23', delta: '+8%', up: true },
  { label: 'SERVICE REVENUE', value: '$24,580', delta: '+15%', up: true },
  { label: 'PARTS REVENUE', value: '$8,420', delta: '+7%', up: true },
  { label: 'LOANER UTILIZATION', value: '72%', delta: '+5pp', up: true },
  { label: 'CSI SCORE', value: '94%', delta: '+3pp', up: true },
]

export function OperationsFooter() {
  return (
    <div className="shrink-0 flex items-center gap-0 relative" style={{
      background: 'linear-gradient(180deg, #0d0f16 0%, #080a0f 100%)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      height: '52px',
    }}>
      {/* Red top accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #e31837 0%, rgba(37,99,235,0.5) 60%, transparent 100%)' }} />

      {/* Label */}
      <div className="shrink-0 px-4 flex flex-col justify-center" style={{ borderRight: '1px solid rgba(255,255,255,0.07)', minWidth: '180px', height: '100%' }}>
        <div className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Dealership Operations</div>
        <div className="mt-1 h-1 w-28 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: '62%', background: 'linear-gradient(90deg, #e31837, #ef4444)' }} />
        </div>
        <div className="text-[0.58rem] text-white/25 mt-0.5">Day is 62% Complete</div>
      </div>

      {/* Metrics */}
      <div className="flex-1 flex items-center justify-around px-4">
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col items-center">
            <div className="text-[0.58rem] uppercase tracking-widest text-white/35 font-semibold">{m.label}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[0.82rem] font-bold text-white/90 tabular-nums">{m.value}</span>
              <span className={`flex items-center gap-0.5 text-[0.6rem] font-semibold ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {m.up ? <TrendUp className="h-2.5 w-2.5" /> : <TrendDown className="h-2.5 w-2.5" />}
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Location/Weather */}
      <div className="shrink-0 px-4 flex items-center gap-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
        <MapPin className="h-3 w-3 text-white/30" />
        <div>
          <div className="text-[0.68rem] text-white/70 font-semibold">Cleveland, OH</div>
          <div className="text-[0.6rem] text-white/35">72° Partly Cloudy</div>
        </div>
      </div>
    </div>
  )
}
