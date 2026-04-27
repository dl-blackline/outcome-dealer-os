import { useRef } from 'react'
import { CaretRight, Car, CurrencyDollar, Wrench, ArrowsLeftRight, Users, Timer, MapPin, Heart } from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { DEALER } from '@/lib/dealer.constants'
import heroPerformanceMockup from '../../../../01_site_mockups/sleek_performance_car_dealership_homepage_mockup.png'
import muscleUIMockup from '../../../../01_site_mockups/sleek_muscle_car_dealer_website_ui.png'
import premiumBrandingMockup from '../../../../01_site_mockups/powerful_branding_for_a_premium_car_dealership.png'

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
    accent: '#df2424',
  },
  {
    icon: CurrencyDollar,
    title: 'Financing',
    sub: 'Fast & Easy\nApproval Process',
    path: '/finance',
    accent: '#2c69ff',
  },
  {
    icon: ArrowsLeftRight,
    title: 'Trade',
    sub: 'Get Top Dollar\nFor Your Trade',
    path: '/trade',
    accent: '#df2424',
  },
  {
    icon: Wrench,
    title: 'Service',
    sub: 'Expert Service\nYou Can Trust',
    path: '/schedule',
    accent: '#2c69ff',
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

  const showcaseUnits = featuredRecords.length >= 4
    ? featuredRecords.slice(0, 4)
    : publicRecords.slice(0, 4)

  function scrollCards(dir: -1 | 1) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
    }
  }

  return (
    <div className="ncm-page" style={{ background: 'var(--bg-base)' }}>
      <section
        className="ncm-hero-depth"
        style={{
          minHeight: '640px',
          backgroundImage: `linear-gradient(118deg, rgba(8, 10, 18, 0.95), rgba(7, 9, 16, 0.78)), url(${heroPerformanceMockup})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 26%',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '31%', left: '-6%', width: '70%', height: '2px', transform: 'rotate(-4deg)', background: 'linear-gradient(90deg, transparent 0%, rgba(223,36,36,0.88) 45%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: '38%', left: '-5%', width: '76%', height: '1px', transform: 'rotate(-3deg)', background: 'linear-gradient(90deg, transparent 0%, rgba(44,105,255,0.75) 42%, transparent 100%)' }} />
          <div style={{ position: 'absolute', right: '4%', top: '8%', width: '20rem', height: '20rem', borderRadius: '999px', background: 'radial-gradient(circle, rgba(40, 96, 224, 0.28), transparent 65%)', filter: 'blur(4px)' }} />
        </div>

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 3, paddingTop: '5.2rem', paddingBottom: '6rem' }}>
          <div style={{ maxWidth: '56rem' }}>
            <div className="inline-flex items-center gap-2 mb-6" style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', color: 'var(--muted-text)', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--red-accent)' }}>★</span>
              <span>Premium Pre-Owned Vehicles</span>
              <span style={{ color: 'var(--red-accent)' }}>•</span>
              <span>Fast Approvals</span>
              <span style={{ color: 'var(--red-accent)' }}>•</span>
              <span>Cleveland Confidence</span>
              <span style={{ color: 'var(--blue-accent)' }}>★</span>
            </div>

            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: 'clamp(2.4rem, 7vw, 5rem)', textTransform: 'uppercase', lineHeight: 0.88, color: '#dbe5fa', letterSpacing: '0.02em' }}>
                Drive Something
              </div>
              <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(3.3rem, 11vw, 8rem)', textTransform: 'uppercase', lineHeight: 0.78, background: 'linear-gradient(180deg, #ffffff 6%, #d7e2fa 47%, #8ea6d6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.02em', textShadow: '0 0 40px rgba(99, 132, 201, 0.25)' }}>
                POWERFUL
              </div>
            </div>

            <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.96rem', color: '#afbedc', lineHeight: 1.7, maxWidth: '42rem' }}>
              High-quality pre-owned vehicles. Fast approvals for every credit story. A premium buying experience built around confidence, speed, and real value.
            </p>

            <div className="ncm-section-shell" style={{ marginTop: '1.5rem', display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', padding: '0.65rem' }}>
              <button
                onClick={() => navigate('/shop')}
                className="ncm-btn-red flex items-center gap-2 px-7 py-3 text-sm"
                style={{ borderRadius: '0.55rem' }}
              >
                SHOP INVENTORY <CaretRight size={14} weight="bold" />
              </button>
              <button
                onClick={() => navigate('/finance/apply')}
                className="ncm-btn-outline flex items-center gap-2 px-7 py-3 text-sm"
                style={{ borderRadius: '0.55rem' }}
              >
                GET APPROVED <CaretRight size={14} weight="bold" />
              </button>
              <button
                onClick={() => navigate('/trade')}
                className="ncm-btn-blue flex items-center gap-2 px-7 py-3 text-sm"
                style={{ borderRadius: '0.55rem' }}
              >
                VALUE YOUR TRADE <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '2rem' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="ncm-section-shell" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ position: 'relative', minHeight: '250px' }}>
                <img
                  src={muscleUIMockup}
                  alt="Muscle car mockup styling"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,10,18,0.32) 5%, rgba(8,10,18,0.88) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: '1.05rem 1rem' }}>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.66rem', color: '#a7b8d9', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Mockup Integrated</div>
                  <div style={{ marginTop: '0.35rem', fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#f4f8ff', textTransform: 'uppercase', lineHeight: 1.05 }}>
                    Aggressive Metal UI
                  </div>
                </div>
              </div>
            </div>

            <div className="ncm-section-shell" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ position: 'relative', minHeight: '250px' }}>
                <img
                  src={premiumBrandingMockup}
                  alt="Premium dealership branding mockup"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,10,18,0.25) 12%, rgba(8,10,18,0.88) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: '1.05rem 1rem' }}>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.66rem', color: '#a7b8d9', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Brand Direction</div>
                  <div style={{ marginTop: '0.35rem', fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#f4f8ff', textTransform: 'uppercase', lineHeight: 1.05 }}>
                    Premium Performance Identity
                  </div>
                </div>
              </div>
            </div>

            <div className="ncm-section-shell" style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.66rem', color: '#a7b8d9', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Design Notes
              </div>
              <h3 style={{ marginTop: '0.42rem', fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.22rem', color: '#f4f8ff', textTransform: 'uppercase', lineHeight: 1.08 }}>
                Mockup Language Is Now Live
              </h3>
              <div style={{ marginTop: '0.58rem', display: 'grid', gap: '0.45rem', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.8rem', color: '#9ab0d4' }}>
                <span>• Steel-toned hero treatment and cinematic contrast</span>
                <span>• Bold type hierarchy for high-performance merchandising</span>
                <span>• Red-blue action rail for financing and trade conversion</span>
                <span>• Brand-first visual modules tied to mockup references</span>
              </div>
              <button
                onClick={() => navigate('/shop')}
                className="ncm-btn-red mt-4"
                style={{ borderRadius: '0.52rem', fontSize: '0.7rem', padding: '0.6rem 0.85rem' }}
              >
                SHOP THIS LOOK <CaretRight size={12} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 4 }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SERVICE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <button
                  key={card.title}
                  onClick={() => navigate(card.path)}
                  className="ncm-service-card"
                  style={{ borderRadius: '0.8rem', padding: '1rem 1.05rem' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '0.65rem', background: `color-mix(in oklab, ${card.accent} 24%, transparent)`, border: `1px solid color-mix(in oklab, ${card.accent} 46%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} style={{ color: card.accent }} weight="bold" />
                  </div>
                  <div className="text-left">
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f1f5ff' }}>
                      {card.title}
                    </div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#9eb0d3', lineHeight: 1.45, marginTop: '0.18rem', whiteSpace: 'pre-line' }}>
                      {card.sub}
                    </div>
                  </div>
                  <CaretRight size={14} style={{ color: card.accent, marginLeft: 'auto', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--section-spacing) 0 3.1rem' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div style={{ width: '4px', height: '32px', background: 'linear-gradient(180deg, var(--red-accent), var(--blue-accent))', borderRadius: '999px' }} />
              <h2 style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', textTransform: 'uppercase', color: '#eef3ff', letterSpacing: '0.05em' }}>
                Featured Inventory
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => scrollCards(-1)} className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md" style={{ border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.04)', color: '#d4def4' }}>‹</button>
              <button onClick={() => scrollCards(1)} className="hidden sm:flex items-center justify-center w-8 h-8 rounded-md" style={{ border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.04)', color: '#d4def4' }}>›</button>
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#ff6c6c', fontFamily: 'Barlow, Manrope, sans-serif', letterSpacing: '0.11em' }}
              >
                View All Inventory <CaretRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          {showcaseUnits.length > 0 ? (
            <div ref={scrollRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
              {showcaseUnits.map((unit, idx) => {
                const badge = getBadgeType(idx, unit.daysInStock || 99)
                const monthly = getMonthlyPayment(unit.price)
                return (
                  <div key={unit.id} className="ncm-inventory-card" style={{ minWidth: '255px', scrollSnapAlign: 'start', cursor: 'pointer' }} onClick={() => navigate(`/shop/${unit.id}`)}>
                    <div style={{ position: 'relative', height: '208px', background: '#111118', overflow: 'hidden' }}>
                      <InventoryPhotoImage
                        record={unit}
                        alt={`${unit.year} ${unit.make} ${unit.model}`}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,7,10,0) 32%, rgba(6,7,10,0.88) 100%)' }} />

                      {badge && (
                        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                          <span className={BADGE_CLASSES[badge]}>{BADGE_LABELS[badge]}</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation() }}
                        style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderRadius: '999px', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Heart size={14} style={{ color: '#d0dcf5' }} />
                      </button>

                      <div style={{ position: 'absolute', bottom: '10px', left: '11px', right: '11px' }}>
                        <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: '#9eb0d3', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                          {unit.year} {unit.make}
                        </div>
                        <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontSize: '1.08rem', fontWeight: 800, color: '#f6f9ff', textTransform: 'uppercase', lineHeight: 1.08 }}>
                          {unit.model} {unit.trim}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.95rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.56rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#97a9ca', fontSize: '0.72rem' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="m12 6 0 6 4 2" />
                        </svg>
                        {formatMileage(unit.mileage)} MILES
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <div className="ncm-price" style={{ fontSize: '1.55rem' }}>
                            {formatPrice(unit.price)}
                          </div>
                          <div className="ncm-monthly" style={{ fontSize: '0.74rem' }}>
                            ${monthly} <span style={{ color: '#6f80a3', fontWeight: 500 }}>/mo*</span>
                          </div>
                        </div>
                        <button className="ncm-btn-red" style={{ borderRadius: '0.52rem', fontSize: '0.66rem', padding: '0.44rem 0.72rem' }}>
                          VIEW
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#8898b8' }}>
              <Car size={40} style={{ margin: '0 auto 1rem', color: '#2a2a40' }} />
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.9rem' }}>Inventory loading...</p>
              <button onClick={() => navigate('/shop')} className="ncm-btn-red mt-4" style={{ borderRadius: '0.55rem' }}>Browse All Vehicles</button>
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingBottom: '2.5rem' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="ncm-section-shell" style={{ padding: '0.4rem' }}>
            <div className="grid lg:grid-cols-2 items-center gap-0" style={{ borderRadius: '0.7rem', overflow: 'hidden' }}>
              <div style={{ padding: '2.2rem 1.6rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-4">
                  <div style={{ width: '62px', height: '62px', borderRadius: '999px', background: 'radial-gradient(circle, rgba(223,36,36,0.2), rgba(223,36,36,0.04))', border: '1px solid rgba(223,36,36,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CurrencyDollar size={27} style={{ color: '#ff6363' }} weight="bold" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.95rem)', textTransform: 'uppercase', letterSpacing: '0.03em', lineHeight: 1.05, color: '#f6f9ff' }}>
                      Financing For <span style={{ color: '#ff6060' }}>Every</span> Drive
                    </h3>
                    <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.86rem', color: '#9eb0d3', marginTop: '0.45rem' }}>
                      Bad Credit? No Credit? We Can Help.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {['Low Down Payments', 'Flexible Terms', 'Fast Decisions'].map((item) => (
                        <div key={item} className="flex items-center gap-1.5" style={{ color: '#cedaf4', fontSize: '0.78rem', fontFamily: 'Barlow, Manrope, sans-serif' }}>
                          <span style={{ color: '#4b84ff', fontSize: '0.7rem' }}>✓</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.8rem 1.6rem' }}>
                <div className="ncm-panel" style={{ padding: '1.2rem', borderRadius: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.95rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '999px', background: 'rgba(223,36,36,0.16)', border: '1px solid rgba(223,36,36,0.36)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6a6a" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#f0f5ff' }}>
                      Get Pre-Approved
                    </div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.73rem', color: '#9cb0d4', marginTop: '0.2rem' }}>
                      Takes 60 seconds. No impact to your credit.
                    </div>
                  </div>
                  <button onClick={() => navigate('/finance/apply')} className="ncm-btn-red" style={{ borderRadius: '0.52rem', padding: '0.58rem 1rem', fontSize: '0.72rem' }}>
                    GET STARTED <CaretRight size={12} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" style={{ paddingBottom: '2.8rem' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="ncm-section-shell" style={{ padding: '1.25rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.95rem' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '0.8rem', background: 'linear-gradient(140deg, rgba(223,36,36,0.2), rgba(44,105,255,0.12))', border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={21} style={{ color: '#ff6565' }} weight="bold" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f4f8ff' }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.78rem', color: '#99adcf', marginTop: '0.34rem', lineHeight: 1.5 }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="contact" style={{ padding: '0 0 3.6rem' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="ncm-section-shell" style={{ textAlign: 'center', padding: '1.2rem 1rem' }}>
            <p style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: 'clamp(0.95rem, 2vw, 1.28rem)', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a8b8d6', margin: 0 }}>
              {DEALER.addressFull}
              <span style={{ margin: '0 0.75rem', color: 'rgba(255,255,255,0.26)' }}>•</span>
              <a href={DEALER.phoneTel} style={{ color: '#f0f5ff', textDecoration: 'none' }}>{DEALER.phone}</a>
              <span style={{ margin: '0 0.75rem', color: 'rgba(255,255,255,0.26)' }}>•</span>
              <span>Mon-Sat 9AM-8PM</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
