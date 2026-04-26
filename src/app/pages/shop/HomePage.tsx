import { useRef } from 'react'
import { CaretRight, Car, CurrencyDollar, Wrench, ArrowsLeftRight, Users, Timer, MapPin, Heart } from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'

import { DEALER } from '@/lib/dealer.constants'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function formatMileage(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function getMonthlyPayment(price: number) {
  const est = computePaymentEstimate({ vehiclePrice: price, downPayment: 0, tradeValue: 0, termMonths: 72, interestRate: 6.9 })
  return Math.round(est.monthlyPayment)
}

// Assign a badge type to inventory cards based on index / days in stock
function getBadgeType(idx: number, daysInStock: number): 'new' | 'value' | 'family' | null {
  if (daysInStock <= 7) return 'new'
  if (idx % 3 === 1) return 'value'
  if (idx % 3 === 2) return 'family'
  return 'new'
}

const BADGE_LABELS: Record<'new' | 'value' | 'family', string> = {
  new: 'New Arrival',
  value: 'Great Value',
  family: 'Family Favorite',
}

const BADGE_CLASSES: Record<'new' | 'value' | 'family', string> = {
  new: 'ncm-badge-new',
  value: 'ncm-badge-value',
  family: 'ncm-badge-family',
}

const SERVICE_CARDS = [
  {
    icon: Car,
    title: 'Inventory',
    sub: 'Shop Premium\nPre-Owned Vehicles',
    path: '/shop',
    accent: '#d41a1a',
  },
  {
    icon: CurrencyDollar,
    title: 'Financing',
    sub: 'Fast & Easy\nApproval Process',
    path: '/finance',
    accent: '#2563eb',
  },
  {
    icon: ArrowsLeftRight,
    title: 'Trade',
    sub: 'Get Top Dollar\nFor Your Trade',
    path: '/trade',
    accent: '#d41a1a',
  },
  {
    icon: Wrench,
    title: 'Service',
    sub: 'Expert Service\nYou Can Trust',
    path: '/schedule',
    accent: '#d41a1a',
  },
]

const TRUST_ITEMS = [
  {
    icon: Users,
    title: 'Family-Owned Since 1962',
    sub: 'Over 60 years of serving Cleveland with honesty and integrity.',
  },
  {
    icon: Timer,
    title: 'Fast Approvals',
    sub: 'Most approvals in minutes, not hours.',
  },
  {
    icon: MapPin,
    title: 'Top Cleveland Selection',
    sub: 'Hundreds of quality pre-owned vehicles ready to drive.',
  },
]

export function HomePage() {
  const { navigate } = useRouter()
  const { featuredRecords, publicRecords } = useInventoryCatalog()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Pick best 4-5 for featured cards
  const showcaseUnits = featuredRecords.length >= 4
    ? featuredRecords.slice(0, 4)
    : publicRecords.slice(0, 4)

  function scrollCards(dir: -1 | 1) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: '#0a0a0f' }}>
      {/* ═══════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '520px',
          background: 'linear-gradient(135deg, #080810 0%, #0e0e1a 40%, #12121e 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Atmosphere BG */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(30,40,80,0.45) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Light streaks */}
        <div style={{ position: 'absolute', top: '38%', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,26,26,0.7) 30%, rgba(212,26,26,0.3) 60%, transparent 100%)', transform: 'skewY(-2deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 40%, rgba(59,130,246,0.2) 70%, transparent 100%)', transform: 'skewY(-2deg)', pointerEvents: 'none' }} />

        {/* Hero content */}
        <div
          className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8"
          style={{ position: 'relative', zIndex: 2, paddingTop: '4rem', paddingBottom: '5rem', textAlign: 'center' }}
        >
          {/* Sub-label */}
          <div
            className="inline-flex items-center gap-2 mb-6"
            style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', letterSpacing: '0.22em', color: '#8898b8', textTransform: 'uppercase' }}
          >
            <span style={{ color: '#d41a1a' }}>★</span>
            <span>Premium Pre-Owned Vehicles</span>
            <span style={{ color: '#d41a1a' }}>•</span>
            <span>Fast Approvals</span>
            <span style={{ color: '#d41a1a' }}>•</span>
            <span>Cleveland Confidence</span>
            <span style={{ color: '#3b82f6' }}>★</span>
          </div>

          {/* Main headline */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div
              style={{
                fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
                textTransform: 'uppercase',
                lineHeight: 0.95,
                color: '#d8dff5',
                letterSpacing: '0.01em',
              }}
            >
              Drive Something
            </div>
            <div
              style={{
                fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(3rem, 9vw, 7rem)',
                textTransform: 'uppercase',
                lineHeight: 0.88,
                background: 'linear-gradient(180deg, #ffffff 10%, #c8d4f0 55%, #8898c8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}
            >
              POWERFUL
            </div>
          </div>

          {/* Stars accent */}
          <div className="flex items-center justify-center gap-2 my-5">
            <div style={{ flex: 1, maxWidth: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25))' }} />
            <span style={{ color: '#3b82f6', fontSize: '0.9rem' }}>★</span>
            <span style={{ color: '#c8d4f0', fontSize: '0.9rem' }}>★</span>
            <div style={{ flex: 1, maxWidth: '120px', height: '1px', background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.25))' }} />
          </div>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => navigate('/shop')}
              className="ncm-btn-red flex items-center gap-2 px-7 py-3 text-sm"
              style={{ borderRadius: '4px' }}
            >
              SHOP INVENTORY <CaretRight size={14} weight="bold" />
            </button>
            <button
              onClick={() => navigate('/finance/apply')}
              className="ncm-btn-outline flex items-center gap-2 px-7 py-3 text-sm"
              style={{ borderRadius: '4px' }}
            >
              GET APPROVED <CaretRight size={14} weight="bold" />
            </button>
            <button
              onClick={() => navigate('/trade')}
              className="ncm-btn-blue flex items-center gap-2 px-7 py-3 text-sm"
              style={{ borderRadius: '4px' }}
            >
              VALUE YOUR TRADE <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVICE CARDS ROW
          ═══════════════════════════════════════════════ */}
      <div style={{ background: '#0d0d15', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-[1400px] grid grid-cols-2 lg:grid-cols-4">
          {SERVICE_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.path)}
                className="ncm-service-card"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  borderRadius: 0,
                  padding: '1.25rem 1.5rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '4px',
                    background: `rgba(${card.accent === '#d41a1a' ? '212,26,26' : '37,99,235'},0.15)`,
                    border: `1px solid rgba(${card.accent === '#d41a1a' ? '212,26,26' : '37,99,235'},0.3)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} style={{ color: card.accent }} weight="bold" />
                </div>
                <div className="text-left">
                  <div
                    style={{
                      fontFamily: 'Barlow, Manrope, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#f0f2f8',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Barlow, Manrope, sans-serif',
                      fontSize: '0.72rem',
                      color: '#8898b8',
                      lineHeight: 1.45,
                      marginTop: '0.2rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {card.sub}
                  </div>
                </div>
                <CaretRight size={14} style={{ color: card.accent, marginLeft: 'auto', flexShrink: 0 }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          FEATURED INVENTORY
          ═══════════════════════════════════════════════ */}
      <section style={{ background: '#0a0a0f', padding: '3.5rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div style={{ width: '4px', height: '28px', background: '#d41a1a', borderRadius: '2px' }} />
              <h2
                style={{
                  fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  textTransform: 'uppercase',
                  color: '#f0f2f8',
                  letterSpacing: '0.04em',
                }}
              >
                Featured Inventory
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCards(-1)}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#c8d4f0' }}
              >
                ‹
              </button>
              <button
                onClick={() => scrollCards(1)}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#c8d4f0' }}
              >
                ›
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest transition-colors"
                style={{ color: '#d41a1a', fontFamily: 'Barlow, Manrope, sans-serif', letterSpacing: '0.1em' }}
              >
                View All Inventory <CaretRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          {showcaseUnits.length > 0 ? (
            <div
              ref={scrollRef}
              className="grid grid-cols-2 gap-4 lg:grid-cols-4"
              style={{ overflowX: 'auto', scrollSnapType: 'x mandatory' }}
            >
              {showcaseUnits.map((unit, idx) => {
                const badge = getBadgeType(idx, unit.daysInStock || 99)
                const monthly = getMonthlyPayment(unit.price)
                return (
                  <div
                    key={unit.id}
                    className="ncm-inventory-card"
                    style={{ minWidth: '240px', scrollSnapAlign: 'start', cursor: 'pointer' }}
                    onClick={() => navigate(`/shop/${unit.id}`)}
                  >
                    {/* Photo */}
                    <div style={{ position: 'relative', height: '180px', background: '#111118', overflow: 'hidden' }}>
                      <InventoryPhotoImage
                        record={unit}
                        alt={`${unit.year} ${unit.make} ${unit.model}`}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(10,10,15,0.8) 100%)' }} />

                      {/* Badge */}
                      {badge && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                          <span className={BADGE_CLASSES[badge]}>{BADGE_LABELS[badge]}</span>
                        </div>
                      )}

                      {/* Heart */}
                      <button
                        onClick={(e) => { e.stopPropagation() }}
                        style={{
                          position: 'absolute', top: '10px', right: '10px',
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Heart size={14} style={{ color: '#c8d4f0' }} />
                      </button>

                      {/* Make/model overlay */}
                      <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px' }}>
                        <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', fontWeight: 600, color: '#8898b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {unit.year} {unit.make}
                        </div>
                        <div
                          style={{
                            fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: '#f0f2f8',
                            textTransform: 'uppercase',
                            lineHeight: 1.1,
                          }}
                        >
                          {unit.model} {unit.trim}
                        </div>
                      </div>
                    </div>

                    {/* Card details */}
                    <div style={{ padding: '0.85rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Mileage */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8898b8', fontSize: '0.72rem' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><path d="m12 6 0 6 4 2"/>
                        </svg>
                        {formatMileage(unit.mileage)} MILES
                      </div>

                      {/* Price row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <div className="ncm-price" style={{ fontSize: '1.45rem' }}>
                            {formatPrice(unit.price)}
                          </div>
                          <div className="ncm-monthly" style={{ fontSize: '0.72rem' }}>
                            ${monthly} <span style={{ color: '#6678a0', fontWeight: 400 }}>/mo*</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8898b8' }}>
              <Car size={40} style={{ margin: '0 auto 1rem', color: '#2a2a40' }} />
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.9rem' }}>Inventory loading…</p>
              <button onClick={() => navigate('/shop')} className="ncm-btn-red mt-4" style={{ borderRadius: '4px' }}>Browse All Vehicles</button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINANCING STRIP
          ═══════════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0d0d15 0%, #111118 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 items-center gap-0">
            {/* Left: message */}
            <div style={{ padding: '2.5rem 0 2.5rem 0', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="pr-8">
                {/* Speedometer icon area */}
                <div className="flex items-start gap-4">
                  <div
                    style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(212,26,26,0.15), transparent)',
                      border: '2px solid rgba(212,26,26,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CurrencyDollar size={28} style={{ color: '#d41a1a' }} weight="bold" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                        fontWeight: 800,
                        fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        lineHeight: 1.05,
                      }}
                    >
                      Financing For{' '}
                      <span style={{ color: '#d41a1a' }}>Every</span> Drive
                    </h3>
                    <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.85rem', color: '#8898b8', marginTop: '0.4rem' }}>
                      Bad Credit? No Credit? We Can Help!
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {['Low Down Payments', 'Flexible Terms', 'Fast Decisions'].map((item) => (
                        <div key={item} className="flex items-center gap-1.5" style={{ color: '#c8d4f0', fontSize: '0.78rem', fontFamily: 'Barlow, Manrope, sans-serif' }}>
                          <span style={{ color: '#2563eb', fontSize: '0.7rem' }}>✓</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: CTA panel */}
            <div style={{ padding: '2rem 0 2rem 2rem' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'rgba(212,26,26,0.12)', border: '1px solid rgba(212,26,26,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d41a1a" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f0f2f8' }}>
                    Get Pre-Approved
                  </div>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#8898b8', marginTop: '0.2rem' }}>
                    Takes 60 Seconds<br />Won't Affect Your Credit
                  </div>
                </div>
                <button
                  onClick={() => navigate('/finance/apply')}
                  className="ncm-btn-red"
                  style={{ borderRadius: '4px', padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}
                >
                  GET STARTED <CaretRight size={12} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRUST ROW
          ═══════════════════════════════════════════════ */}
      <section
        id="about"
        style={{
          background: '#0d0d15',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 sm:grid-cols-3">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                style={{
                  padding: '2rem 1.5rem',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(212,26,26,0.10)',
                    border: '1px solid rgba(212,26,26,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={22} style={{ color: '#d41a1a' }} weight="bold" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Barlow, Manrope, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#f0f2f8',
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', color: '#8898b8', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {item.sub}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT ANCHOR (for nav link)
          ═══════════════════════════════════════════════ */}
      <section
        id="contact"
        style={{ background: '#0a0a0f', padding: '3rem 0' }}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 text-center">
          <p
            style={{
              fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1rem, 2vw, 1.4rem)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#8898b8',
            }}
          >
            {DEALER.addressFull}
            <span style={{ margin: '0 0.75rem', color: 'rgba(255,255,255,0.2)' }}>•</span>
            <a href={DEALER.phoneTel} style={{ color: '#f0f2f8' }}>{DEALER.phone}</a>
            <span style={{ margin: '0 0.75rem', color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span>Mon–Sat 9AM–8PM</span>
          </p>
        </div>
      </section>
    </div>
  )
}
