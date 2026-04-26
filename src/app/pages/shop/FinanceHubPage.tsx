import { useState } from 'react'
import { useRouter } from '@/app/router'
import { CaretRight, CaretDown, ShieldCheck, Lock, Users, Timer } from '@phosphor-icons/react'
import { DEALER } from '@/lib/dealer.constants'

const FINANCE_FOR = [
  { icon: '💳', title: 'Bad Credit?', sub: 'We Can Help' },
  { icon: '🚗', title: 'No Credit?', sub: 'We Can Help' },
  { icon: '👤', title: 'First-Time Buyer?', sub: 'We Can Help' },
  { icon: '👨‍👩‍👧', title: 'Family Vehicle?', sub: 'We Can Help' },
  { icon: '⏱️', title: 'Fast Approvals', sub: 'Get On The Road Faster' },
]

const STEPS = [
  { n: 1, title: 'Get Pre-Approved', sub: 'Fill out our quick & secure online application.' },
  { n: 2, title: 'Get Approved', sub: 'Receive your approval in minutes.' },
  { n: 3, title: 'Choose Your Ride', sub: 'Pick the perfect vehicle from our inventory.' },
  { n: 4, title: 'Drive Today', sub: 'Finalize your paperwork and drive off happy.' },
]

const WHY_ITEMS = [
  'We Work With Multiple Lenders To Find You The Best Rates',
  'Special Financing Programs For All Credit Situations',
  'Low Down Payment Options Available',
  'Flexible Terms That Fit Your Budget',
  'Local Cleveland Team That Cares',
  'Trusted By Thousands Of Drivers Since 1962',
]

const BRING_ITEMS = [
  'Valid Driver\'s License',
  'Proof Of Income',
  'Proof Of Residence',
  'Insurance Information',
  'Down Payment (If Available)',
]

const WHO_WE_HELP = [
  'Bad Credit', 'No Credit', 'First-Time Buyers', 'Self-Employed',
  'ITIN Applicants', 'Repossession', 'Bankruptcy',
]

const FAQ = [
  { q: 'Will applying affect my credit?', a: 'Our initial pre-qualification uses a soft pull that does not affect your credit score. A hard inquiry only occurs when you formally apply for financing.' },
  { q: 'Can I get approved with bad credit?', a: 'Yes! We work with multiple lenders who specialize in all credit situations. We find the best terms available for your situation.' },
  { q: 'How fast will I get approved?', a: 'Most of our customers receive a preliminary decision within 60 seconds. Same-day approvals are common.' },
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
      {/* ═══════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '440px',
          background: 'linear-gradient(135deg, #080810 0%, #0e0e1a 50%, #12121e 100%)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Atmosphere */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(30,40,80,0.4), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '42%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,26,26,0.6), rgba(212,26,26,0.2) 70%, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '47%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)', pointerEvents: 'none' }} />

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 w-full" style={{ position: 'relative', zIndex: 2, padding: '4rem 1.5rem 4.5rem' }}>
          {/* Sub label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ color: '#3b82f6', fontSize: '0.75rem' }}>★</span>
            <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', color: '#8898b8', textTransform: 'uppercase' }}>
              Drive Something Powerful
            </span>
            <span style={{ color: '#3b82f6', fontSize: '0.75rem' }}>★</span>
          </div>

          {/* Headline */}
          <div style={{ maxWidth: '700px' }}>
            <div
              style={{
                fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                textTransform: 'uppercase',
                color: '#c8d4f0',
                lineHeight: 0.95,
                letterSpacing: '0.01em',
              }}
            >
              Fast Easy
            </div>
            <div
              style={{
                fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                textTransform: 'uppercase',
                lineHeight: 0.88,
                background: 'linear-gradient(180deg, #f03030 0%, #d41a1a 60%, #a01010 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}
            >
              APPROVALS
            </div>

            <p
              style={{
                fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                textTransform: 'uppercase',
                color: '#c8d4f0',
                letterSpacing: '0.06em',
                marginTop: '0.75rem',
              }}
            >
              Good Credit, Bad Credit, No Credit — We Can Help!
            </p>

            {/* Credit tags */}
            <div className="flex flex-wrap gap-3 mt-4">
              {['All Credit Types Welcome', 'First-Time Buyers', 'Families Welcome'].map((tag, i) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', color: '#c8d4f0',
                  }}
                >
                  <span style={{ color: i === 0 ? '#3b82f6' : '#d41a1a', fontSize: '0.7rem' }}>
                    {i === 0 ? '✓' : '◆'}
                  </span>
                  {tag}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => navigate('/finance/apply')}
                className="ncm-btn-red flex items-center gap-2 px-6 py-3 text-sm"
                style={{ borderRadius: '4px' }}
              >
                GET PRE-APPROVED <CaretRight size={14} weight="bold" />
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="ncm-btn-outline flex items-center gap-2 px-6 py-3 text-sm"
                style={{ borderRadius: '4px' }}
              >
                VIEW INVENTORY <CaretRight size={14} weight="bold" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-6">
              {[
                { icon: ShieldCheck, label: 'No Impact', sub: 'To Your Credit Score' },
                { icon: Timer, label: 'Fast Approvals', sub: 'As Quick As 60 Seconds' },
                { icon: Lock, label: 'Secure & Private', sub: 'Your Information Is Safe' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} style={{ color: '#8898b8' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#f0f2f8' }}>{label}</div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', color: '#6678a0' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINANCING FOR EVERY DRIVE + PRE-QUALIFY FORM
          ═══════════════════════════════════════════════ */}
      <section style={{ background: '#0d0d15', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Financing for every drive */}
            <div className="lg:col-span-3">
              <h2
                style={{
                  fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#f0f2f8',
                  marginBottom: '1.25rem',
                }}
              >
                Financing For Every Drive
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {FINANCE_FOR.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      background: '#111118',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      padding: '1rem 0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#f0f2f8' }}>{item.title}</div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', color: '#8898b8', marginTop: '0.2rem' }}>{item.sub}</div>
                  </div>
                ))}
              </div>

              {/* How it works */}
              <div style={{ marginTop: '2rem' }}>
                <h3
                  style={{
                    fontFamily: 'Barlow, Manrope, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: '#8898b8',
                    marginBottom: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  How Our Financing Process Works
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {STEPS.map((step, i) => (
                    <div key={step.n} style={{ position: 'relative' }}>
                      {i < STEPS.length - 1 && (
                        <div style={{
                          position: 'absolute', top: '14px', left: 'calc(50% + 16px)', right: '-16px',
                          height: '1px', background: 'rgba(212,26,26,0.3)',
                          display: 'none', // hide on mobile
                        }} className="hidden sm:block" />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                        <div className="ncm-step-badge">{step.n}</div>
                        <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#f0f2f8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{step.title}</div>
                        <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#8898b8', lineHeight: 1.4 }}>{step.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pre-qualify form */}
            <div className="lg:col-span-2">
              <div
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '1.75rem',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Barlow, Manrope, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: '#8898b8',
                    marginBottom: '1.25rem',
                  }}
                >
                  Pre-Qualify In 60 Seconds
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    style={inputStyle}
                  />
                  <select
                    value={form.timeAtAddress}
                    onChange={(e) => setForm((p) => ({ ...p, timeAtAddress: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Time at Current Address</option>
                    <option value="under1">Under 1 Year</option>
                    <option value="1-2">1–2 Years</option>
                    <option value="3-5">3–5 Years</option>
                    <option value="over5">Over 5 Years</option>
                  </select>

                  <button
                    type="submit"
                    className="ncm-btn-red"
                    style={{ borderRadius: '4px', justifyContent: 'center', padding: '0.85rem', fontSize: '0.82rem', gap: '0.5rem', marginTop: '0.25rem' }}
                  >
                    GET PRE-APPROVED NOW <Lock size={14} />
                  </button>

                  <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', color: '#6678a0', textAlign: 'center', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <Lock size={11} /> This will not affect your credit score
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4-COLUMN INFO SECTION
          ═══════════════════════════════════════════════ */}
      <section style={{ background: '#0a0a0f', padding: '2.5rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Why Finance */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f2f8', marginBottom: '1rem' }}>
                Why Finance With National Car Mart?
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {WHY_ITEMS.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#c8d4f0', lineHeight: 1.4 }}>
                    <span style={{ color: '#d41a1a', flexShrink: 0, marginTop: '0.1rem' }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What To Bring */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f2f8', marginBottom: '1rem' }}>
                What To Bring
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {BRING_ITEMS.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#c8d4f0' }}>
                    <span style={{ color: '#3b82f6', flexShrink: 0 }}>☑</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#8898b8', marginTop: '1rem', lineHeight: 1.45 }}>
                Don't have everything listed?<br />
                <strong style={{ color: '#c8d4f0' }}>No problem — we can still help!</strong>
              </p>
            </div>

            {/* Who We Help */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f2f8', marginBottom: '1rem' }}>
                Who We Help
              </h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {WHO_WE_HELP.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#c8d4f0' }}>
                    <span style={{ color: '#d41a1a', flexShrink: 0 }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f0f2f8', marginBottom: '1rem' }}>
                Frequently Asked Questions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {FAQ.map((item, i) => (
                  <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => setOpenFaq((p) => p === i ? null : i)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        width: '100%', padding: '0.6rem 0', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#c8d4f0', lineHeight: 1.4, flex: 1, paddingRight: '0.5rem' }}>
                        {item.q}
                      </span>
                      <span style={{ color: '#d41a1a', fontSize: '1rem', flexShrink: 0 }}>
                        {openFaq === i ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === i && (
                      <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#8898b8', lineHeight: 1.5, paddingBottom: '0.75rem' }}>
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

      {/* ═══════════════════════════════════════════════
          BOTTOM TRUST STRIP
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0d0d15, #111118)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '1.25rem 0',
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
            <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8d4f0' }}>
              Cleveland's Trusted Pre-Owned Dealer Since 1962
              <span style={{ color: '#d41a1a', margin: '0 0.4rem' }}>★</span>
              <span style={{ color: '#d41a1a' }}>★</span>
              <span style={{ color: '#d41a1a', marginLeft: '0.4rem' }}>★</span>
            </div>
            {['Over 60 Years Of Service', 'Thousands Of Happy Customers', '5 Star Rating'].map((item, i) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>}
                <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#8898b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              {/* Social icons */}
              {[
                { label: 'Facebook', href: 'https://www.facebook.com/nationalcarmart', icon: 'f' },
                { label: 'Instagram', href: 'https://www.instagram.com/nationalcarmart', icon: 'in' },
                { label: 'YouTube', href: 'https://www.youtube.com/@nationalcarmart', icon: 'yt' },
                { label: 'TikTok', href: 'https://www.tiktok.com/@nationalcarmart', icon: 'tk' },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow National Car Mart on ${label}`}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#8898b8', fontWeight: 700, textDecoration: 'none' }}
                >
                  {icon}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.3rem 0.6rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e8c84a' }}>BBB</span>
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#c8d4f0', lineHeight: 1.2 }}>Accredited Business</div>
                <div style={{ fontSize: '0.5rem', color: '#8898b8' }}>A+ Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  background: '#0d0d15',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '4px',
  color: '#f0f2f8',
  fontFamily: 'Barlow, Manrope, sans-serif',
  fontSize: '0.82rem',
  padding: '0 0.75rem',
  outline: 'none',
}
