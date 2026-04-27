import type { MockupReference } from '@/app/mockupReferences'

export function ReferenceHero({ reference }: { reference: MockupReference }) {
  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-white/15 shadow-[0_20px_80px_rgba(2,8,23,0.3)]">
      <div
        style={{
          position: 'relative',
          minHeight: '150px',
          backgroundImage: `linear-gradient(112deg, rgba(2, 8, 23, 0.9), rgba(15, 23, 42, 0.72)), url(${reference.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0.86) 100%)' }} />
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
