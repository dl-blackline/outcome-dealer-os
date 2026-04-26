import { useState } from 'react'
import { useRouter } from '@/app/router'
import { CaretRight, ShieldCheck, Lock, Timer, CreditCard, User, HandCoins, ShieldStar } from '@phosphor-icons/react'
import { DEALER } from '@/lib/dealer.constants'

const FINANCE_FOR = [
  { icon: CreditCard, title: 'Bad Credit?', sub: 'We Can Help' },
  { icon: ShieldStar, title: 'No Credit?', sub: 'We Can Help' },
  { icon: User, title: 'First-Time Buyer?', sub: 'We Can Help' },
  { icon: HandCoins, title: 'Family Vehicle?', sub: 'We Can Help' },
  { icon: Timer, title: 'Fast Approvals', sub: 'Get On The Road Faster' },
]

const STEPS = [
  { n: 1, title: 'Get Pre-Approved', sub: 'Fill out our quick and secure online application.' },
  { n: 2, title: 'Get Approved', sub: 'Receive your approval in minutes.' },
  { n: 3, title: 'Choose Your Ride', sub: 'Pick the perfect vehicle from our inventory.' },
  { n: 4, title: 'Drive Today', sub: 'Finalize your paperwork and drive off happy.' },
]

const WHY_ITEMS = [
  'We work with multiple lenders to find you the best rates',
  'Special financing programs for all credit situations',
  'Low down payment options available',
  'Flexible terms that fit your budget',
  'Local Cleveland team that cares',
  'Trusted by thousands of drivers since 1962',
]

const BRING_ITEMS = [
  'Valid driver license',
  'Proof of income',
  'Proof of residence',
  'Insurance information',
  'Down payment (if available)',
]

const WHO_WE_HELP = [
  'Bad Credit', 'No Credit', 'First-Time Buyers', 'Self-Employed',
  'ITIN Applicants', 'Repossession', 'Bankruptcy',
]

const FAQ = [
  { q: 'Will applying affect my credit?', a: 'Our initial pre-qualification uses a soft pull that does not affect your credit score. A hard inquiry only occurs when you formally apply for financing.' },
  { q: 'Can I get approved with bad credit?', a: 'Yes. We work with multiple lenders who specialize in all credit situations and find the best terms available for your situation.' },
  { q: 'How fast will I get approved?', a: 'Most customers receive a preliminary decision within 60 seconds. Same-day approvals are common.' },
  { q: 'Do I need a large down payment?', a: 'Not necessarily. We offer programs with low or no down payment options depending on your credit profile.' },
  { q: 'What if I am self-employed?', a: 'We regularly help self-employed customers. Bring proof of income such as bank statements or tax returns.' },
]

export function FinanceHubPage() {
  const { navigate } = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', timeAtAddress: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate('/finance/apply')
  }

  return (
    <div style={{ background: '#0a0a0f' }}>
      <section className="ncm-hero-depth" style={{ minHeight: '560px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '33%', left: '-8%', width: '72%', height: '2px', transform: 'rotate(-4deg)', background: 'linear-gradient(90deg, transparent 0%, rgba(223,36,36,0.8) 52%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: '39%', left: '-6%', width: '80%', height: '1px', transform: 'rotate(-3deg)', background: 'linear-gradient(90deg, transparent 0%, rgba(44,105,255,0.72) 48%, transparent 100%)' }} />
        </div>

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full" style={{ position: 'relative', zIndex: 2, padding: '4.8rem 1.5rem 5.2rem' }}>
          <div style={{ maxWidth: '760px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <span style={{ color: '#4d83ff', fontSize: '0.75rem' }}>★</span>
              <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', color: '#97a9cc', textTransform: 'uppercase' }}>
                Drive Something Powerful
              </span>
              <span style={{ color: '#4d83ff', fontSize: '0.75rem' }}>★</span>
            </div>

            <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: 'clamp(2.3rem, 5.6vw, 3.8rem)', textTransform: 'uppercase', color: '#d8e2f8', lineHeight: 0.9, letterSpacing: '0.01em' }}>
              Fast Easy
            </div>
            <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(3.2rem, 9vw, 6.8rem)', textTransform: 'uppercase', lineHeight: 0.78, background: 'linear-gradient(180deg, #ff5e5e 0%, #df2424 58%, #a71111 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.01em' }}>
              APPROVALS
            </div>

            <p style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 600, fontSize: 'clamp(0.95rem, 2.2vw, 1.25rem)', textTransform: 'uppercase', color: '#c9d7f2', letterSpacing: '0.06em', marginTop: '0.8rem' }}>
              Good Credit, Bad Credit, No Credit. We Can Help.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {['All Credit Types Welcome', 'First-Time Buyers', 'Families Welcome'].map((tag, i) => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.42rem', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', color: '#cfdcf5' }}>
                  <span style={{ color: i === 0 ? '#69a0ff' : '#ff5e5e', fontSize: '0.72rem' }}>{i === 0 ? '✓' : '◆'}</span>
                  {tag}
                </div>
              ))}
            </div>

            <div className="ncm-section-shell" style={{ marginTop: '1.45rem', display: 'inline-flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', padding: '0.62rem' }}>
              <button onClick={() => navigate('/finance/apply')} className="ncm-btn-red flex items-center gap-2 px-6 py-3 text-sm" style={{ borderRadius: '0.55rem' }}>
                GET PRE-APPROVED <CaretRight size={14} weight="bold" />
              </button>
              <button onClick={() => navigate('/shop')} className="ncm-btn-outline flex items-center gap-2 px-6 py-3 text-sm" style={{ borderRadius: '0.55rem' }}>
                VIEW INVENTORY <CaretRight size={14} weight="bold" />
              </button>
            </div>

            <div className="flex flex-wrap gap-6 mt-6">
              {[
                { icon: ShieldCheck, label: 'No Impact', sub: 'To Your Credit Score' },
                { icon: Timer, label: 'Fast Approvals', sub: 'As Quick As 60 Seconds' },
                { icon: Lock, label: 'Secure & Private', sub: 'Your Information Is Safe' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '33px', height: '33px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} style={{ color: '#9db2d7' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#f1f6ff' }}>{label}</div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', color: '#7e93b6' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '2.6rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h2 style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(1.28rem, 2.8vw, 1.75rem)', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#f2f7ff', marginBottom: '1.25rem' }}>
                Financing For Every Drive
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {FINANCE_FOR.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="ncm-section-shell" style={{ borderRadius: '0.8rem', padding: '0.9rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '0.7rem', margin: '0 auto 0.5rem', background: 'linear-gradient(140deg, rgba(223,36,36,0.22), rgba(44,105,255,0.18))', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} style={{ color: '#ff6969' }} weight="bold" />
                      </div>
                      <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#f1f7ff' }}>{item.title}</div>
                      <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', color: '#98abd0', marginTop: '0.2rem' }}>{item.sub}</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: '1.9rem' }}>
                <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#95a8cb', marginBottom: '1.2rem', textAlign: 'center' }}>
                  How Our Financing Process Works
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {STEPS.map((step, i) => (
                    <div key={step.n} style={{ position: 'relative' }}>
                      {i < STEPS.length - 1 && (
                        <div style={{ position: 'absolute', top: '14px', left: 'calc(50% + 16px)', right: '-16px', height: '1px', background: 'rgba(223,36,36,0.3)', display: 'none' }} className="hidden sm:block" />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                        <div className="ncm-step-badge">{step.n}</div>
                        <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#f1f6ff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{step.title}</div>
                        <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#98abd0', lineHeight: 1.4 }}>{step.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="ncm-section-shell" style={{ borderRadius: '0.9rem', padding: '1.6rem' }}>
                <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#96a9cd', marginBottom: '1.25rem' }}>
                  Pre-Qualify In 60 Seconds
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
                    <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} />
                  </div>
                  <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} style={inputStyle} />
                  <select value={form.timeAtAddress} onChange={(e) => setForm((p) => ({ ...p, timeAtAddress: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Time at Current Address</option>
                    <option value="under1">Under 1 Year</option>
                    <option value="1-2">1-2 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="over5">Over 5 Years</option>
                  </select>

                  <button type="submit" className="ncm-btn-red" style={{ borderRadius: '0.55rem', justifyContent: 'center', padding: '0.86rem', fontSize: '0.82rem', gap: '0.5rem', marginTop: '0.25rem' }}>
                    GET PRE-APPROVED NOW <Lock size={14} />
                  </button>

                  <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', color: '#7186aa', textAlign: 'center', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <Lock size={11} /> This will not affect your credit score
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '2.6rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="ncm-section-shell" style={{ borderRadius: '0.84rem', padding: '1.3rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f5ff', marginBottom: '1rem' }}>
                Why Finance With National Car Mart?
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {WHY_ITEMS.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#c7d5f2', lineHeight: 1.4 }}>
                    <span style={{ color: '#ff5f5f', flexShrink: 0, marginTop: '0.1rem' }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ncm-section-shell" style={{ borderRadius: '0.84rem', padding: '1.3rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f5ff', marginBottom: '1rem' }}>
                What To Bring
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {BRING_ITEMS.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#c7d5f2' }}>
                    <span style={{ color: '#6ca2ff', flexShrink: 0 }}>☑</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#95a8cc', marginTop: '1rem', lineHeight: 1.45 }}>
                Missing one of these? No problem. We can still help.
              </p>
            </div>

            <div className="ncm-section-shell" style={{ borderRadius: '0.84rem', padding: '1.3rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f5ff', marginBottom: '1rem' }}>
                Who We Help
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {WHO_WE_HELP.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#c7d5f2' }}>
                    <span style={{ color: '#ff5f5f', flexShrink: 0 }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ncm-section-shell" style={{ borderRadius: '0.84rem', padding: '1.3rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f5ff', marginBottom: '1rem' }}>
                Frequently Asked Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {FAQ.map((item, i) => (
                  <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => setOpenFaq((p) => p === i ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.62rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#c7d5f2', lineHeight: 1.4, flex: 1, paddingRight: '0.5rem' }}>
                        {item.q}
                      </span>
                      <span style={{ color: '#ff5f5f', fontSize: '1rem', flexShrink: 0 }}>
                        {openFaq === i ? '-' : '+'}
                      </span>
                    </button>
                    {openFaq === i && (
                      <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#93a7cb', lineHeight: 1.5, paddingBottom: '0.75rem' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, #0f141f, #0a0e18)', borderTop: '1px solid var(--border-subtle)', padding: '1.2rem 0 1.3rem' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
            <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d1ddf5' }}>
              Cleveland's Trusted Pre-Owned Dealer Since 1962
              <span style={{ color: '#ff5a5a', margin: '0 0.4rem' }}>★</span>
              <span style={{ color: '#4d83ff' }}>★</span>
            </div>
            {['Over 60 Years Of Service', 'Thousands Of Happy Customers', '5 Star Rating'].map((item) => (
              <span key={item} style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#97aacf', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item}</span>
            ))}
            <a href={DEALER.phoneTel} style={{ textDecoration: 'none' }}>
              <button className="ncm-btn-red" style={{ borderRadius: '0.55rem', fontSize: '0.72rem', padding: '0.54rem 0.95rem' }}>CALL {DEALER.phone}</button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  background: 'rgba(9,12,18,0.7)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '0.55rem',
  color: '#f0f5ff',
  fontFamily: 'Barlow, Manrope, sans-serif',
  fontSize: '0.82rem',
  padding: '0 0.75rem',
  outline: 'none',
}
