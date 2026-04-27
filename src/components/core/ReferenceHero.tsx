import type { MockupReference } from '@/app/mockupReferences'

export function ReferenceHero({ reference }: { reference: MockupReference }) {
  const accent = reference.chip.toLowerCase().includes('buyer')
    ? 'rgba(14, 165, 233, 0.36)'
    : 'rgba(239, 68, 68, 0.34)'

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_80px_rgba(2,8,23,0.3)]">
      <div
        style={{
          position: 'relative',
          minHeight: '150px',
          backgroundImage: `radial-gradient(circle at 15% 12%, ${accent}, transparent 42%), radial-gradient(circle at 82% 6%, rgba(59,130,246,0.2), transparent 40%), linear-gradient(112deg, rgba(2, 8, 23, 0.94), rgba(15, 23, 42, 0.86))`,
        }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.86) 100%)' }} />
        <div className="absolute left-[-4%] top-[22%] h-px w-[58%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.62) 44%, transparent 100%)' }} />
        <div className="absolute left-[-2%] top-[34%] h-px w-[62%]" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.48) 42%, transparent 100%)' }} />
        <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-100">
            {reference.chip}
          </span>
          <h2 className="mt-2 text-xl font-bold uppercase tracking-[0.08em] text-slate-50 sm:text-2xl">
            {reference.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-200/90 sm:text-[15px]">
            {reference.subtitle}
          </p>
        </div>
      </div>
    </section>
  )
}
