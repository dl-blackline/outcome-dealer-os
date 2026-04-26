import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { computePaymentEstimate } from '@/domains/buyer-hub/buyerHub.types'
import { useShoppingState } from '@/domains/buyer-hub/useShoppingState'
import { useInventoryRecord } from '@/domains/inventory/inventory.runtime'
import { setSelectedUnit } from '@/domains/buyer-hub/helpers/selectedVehicleContext'
import { InventoryPhotoImage } from '@/components/inventory/InventoryPhotoImage'
import { ArrowLeft, Heart, Car, Lock } from '@phosphor-icons/react'

function fmt(v: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}
function fmtMi(v: number) {
  return new Intl.NumberFormat('en-US').format(v)
}

export function VehicleDetailPage() {
  const { params, navigate } = useRouter()
  const { isSaved, toggleSaved } = useShoppingState()
  const { record: vehicle, loading } = useInventoryRecord(params.unitId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  useEffect(() => {
    if (params.unitId) setSelectedUnit(params.unitId, 'shop')
  }, [params.unitId])

  const isFavorited = vehicle ? isSaved(vehicle.id) : false

  const paymentEstimate = useMemo(() => {
    if (!vehicle) return null
    return computePaymentEstimate({ vehiclePrice: vehicle.price, downPayment: 0, tradeValue: 0, termMonths: 72, interestRate: 6.9 })
  }, [vehicle])

  if (loading) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8898b8', fontFamily: 'Barlow, Manrope, sans-serif' }}>Loading vehicle…</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Car size={56} style={{ color: '#2a2a40' }} />
        <p style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 700, fontSize: '1.3rem', textTransform: 'uppercase', color: '#c8d4f0' }}>Vehicle Not Found</p>
        <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.85rem', color: '#8898b8' }}>This vehicle may no longer be available.</p>
        <button onClick={() => navigate('/shop')} className="ncm-btn-red" style={{ borderRadius: '4px', marginTop: '0.5rem' }}>
          <ArrowLeft size={15} /> Back to Inventory
        </button>
      </div>
    )
  }

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`
  const selectedPhoto = vehicle.photos[selectedPhotoIndex] || vehicle.photos[0]
  const monthly = paymentEstimate ? Math.round(paymentEstimate.monthlyPayment) : null

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Back nav */}
      <div style={{ background: '#0d0d15', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 0' }}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/shop')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', color: '#8898b8',
              background: 'none', border: 'none', cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            <ArrowLeft size={14} /> Back to Inventory
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Gallery + details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Hero photo */}
            <div
              style={{
                position: 'relative', borderRadius: '8px', overflow: 'hidden',
                background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ height: '380px', position: 'relative' }}>
                {selectedPhoto ? (
                  <InventoryPhotoImage
                    record={vehicle}
                    photo={selectedPhoto}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Car size={64} style={{ color: '#2a2a40' }} />
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(10,10,15,0.9) 100%)' }} />
                {/* Title overlay */}
                <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: '#8898b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                    {vehicle.year} {vehicle.make}
                  </div>
                  <h1
                    style={{
                      fontFamily: 'Barlow Condensed, Syncopate, sans-serif',
                      fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                      textTransform: 'uppercase', color: '#f0f2f8', lineHeight: 1, marginTop: '0.2rem',
                    }}
                  >
                    {vehicle.model} {vehicle.trim}
                  </h1>
                  {vehicle.available && (
                    <span style={{ display: 'inline-block', marginTop: '0.5rem', background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.4)', color: '#4ade80', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: '3px' }}>
                      ● Available
                    </span>
                  )}
                </div>
                {/* Heart */}
                <button
                  onClick={() => toggleSaved(vehicle.id)}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart size={18} style={{ color: isFavorited ? '#f03030' : '#c8d4f0' }} weight={isFavorited ? 'fill' : 'regular'} />
                </button>
              </div>

              {/* Thumbnail strip */}
              {vehicle.photos.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', overflowX: 'auto', background: '#0d0d15', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {vehicle.photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhotoIndex(i)}
                      style={{
                        flexShrink: 0, width: '72px', height: '54px', borderRadius: '4px', overflow: 'hidden',
                        border: i === selectedPhotoIndex ? '2px solid #d41a1a' : '2px solid rgba(255,255,255,0.1)',
                        background: '#111118', cursor: 'pointer',
                      }}
                    >
                      <InventoryPhotoImage
                        record={vehicle}
                        photo={photo}
                        alt={photo.alt}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spec strip */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                background: '#0d0d15', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden',
              }}
            >
              {[
                { label: 'Price', value: fmt(vehicle.price), color: '#f03030' },
                { label: 'Mileage', value: `${fmtMi(vehicle.mileage)} mi`, color: '#60a5fa' },
                { label: 'Year', value: String(vehicle.year), color: '#f0f2f8' },
                { label: 'Body', value: vehicle.bodyStyle, color: '#f0f2f8' },
              ].map((spec, i) => (
                <div key={spec.label} style={{ padding: '1rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8898b8', marginBottom: '0.3rem' }}>{spec.label}</div>
                  <div style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: spec.color }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            {vehicle.features.length > 0 && (
              <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8898b8', marginBottom: '0.85rem' }}>Highlights</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {vehicle.features.map((f) => (
                    <span key={f} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', padding: '0.25rem 0.6rem', fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.72rem', color: '#c8d4f0' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8898b8', marginBottom: '0.75rem' }}>Vehicle Overview</h3>
                <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.82rem', color: '#c8d4f0', lineHeight: 1.65 }}>{vehicle.description}</p>
              </div>
            )}

            {/* Vehicle details grid */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8898b8', marginBottom: '0.85rem' }}>Vehicle Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Condition', vehicle.condition || 'Pre-owned'],
                  ['Drivetrain', vehicle.drivetrain || 'Not specified'],
                  ['Engine', vehicle.engine || 'Not specified'],
                  ['Transmission', vehicle.transmission || 'Not specified'],
                  ['Exterior Color', vehicle.exteriorColor || vehicle.color || 'Not specified'],
                  ['Interior Color', vehicle.interiorColor || 'Not specified'],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '0.65rem 0.85rem' }}>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8898b8' }}>{label}</div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#f0f2f8', marginTop: '0.2rem' }}>{value}</div>
                  </div>
                ))}
              </div>
              {vehicle.vin && (
                <div style={{ marginTop: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '0.65rem 0.85rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8898b8' }}>VIN</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem', color: '#f0f2f8', marginTop: '0.2rem' }}>{vehicle.vin}</div>
                  </div>
                  {vehicle.stockNumber && (
                    <div>
                      <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8898b8' }}>Stock #</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.82rem', color: '#f0f2f8', marginTop: '0.2rem' }}>{vehicle.stockNumber}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Pricing + CTAs */}
          <div className="lg:col-span-2 space-y-5 lg:sticky lg:top-[80px] lg:self-start">
            {/* Price panel */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: '#8898b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                  {vehicle.year} {vehicle.make}
                </div>
                <h2 style={{ fontFamily: 'Barlow Condensed, Syncopate, sans-serif', fontWeight: 800, fontSize: '1.4rem', textTransform: 'uppercase', color: '#f0f2f8', lineHeight: 1.1, marginTop: '0.2rem' }}>
                  {vehicle.model} {vehicle.trim}
                </h2>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <div className="ncm-price" style={{ fontSize: '2.2rem' }}>{fmt(vehicle.price)}</div>
                {monthly && (
                  <div className="ncm-monthly" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    ${monthly} <span style={{ color: '#6678a0', fontWeight: 400 }}>/mo*</span>
                    <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.65rem', color: '#6678a0', marginLeft: '0.4rem' }}>est. 72mo @ 6.9%</span>
                  </div>
                )}
                {paymentEstimate && (
                  <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.62rem', color: '#6678a0', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {paymentEstimate.disclaimer}
                  </p>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => navigate(`/inquiry/${vehicle.id}`)}
                className="ncm-btn-red"
                style={{ borderRadius: '4px', justifyContent: 'center', width: '100%', padding: '0.85rem' }}
              >
                CHECK AVAILABILITY
              </button>
              <button
                onClick={() => { setSelectedUnit(vehicle.id, 'finance'); navigate('/finance/apply') }}
                className="ncm-btn-red"
                style={{ borderRadius: '4px', justifyContent: 'center', width: '100%', padding: '0.85rem' }}
              >
                GET APPROVED
              </button>
              <button
                onClick={() => navigate('/schedule')}
                className="ncm-btn-outline"
                style={{ borderRadius: '4px', justifyContent: 'center', width: '100%', padding: '0.75rem' }}
              >
                SCHEDULE TEST DRIVE
              </button>
              <button
                onClick={() => navigate('/trade')}
                className="ncm-btn-outline"
                style={{ borderRadius: '4px', justifyContent: 'center', width: '100%', padding: '0.75rem' }}
              >
                VALUE YOUR TRADE
              </button>
              <a
                href="tel:+12165693344"
                className="ncm-btn-outline"
                style={{ borderRadius: '4px', justifyContent: 'center', width: '100%', padding: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                📞 CALL (216) 569-3344
              </a>
              <button
                onClick={() => toggleSaved(vehicle.id)}
                style={{
                  width: '100%', padding: '0.6rem', background: 'none',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px',
                  color: isFavorited ? '#f03030' : '#8898b8',
                  fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.75rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                <Heart size={15} weight={isFavorited ? 'fill' : 'regular'} />
                {isFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>
            </div>

            {/* Trust box */}
            <div style={{ background: 'rgba(212,26,26,0.05)', border: '1px solid rgba(212,26,26,0.2)', borderRadius: '6px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lock size={14} style={{ color: '#d41a1a' }} />
                <span style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f0f2f8' }}>Secure &amp; Trusted</span>
              </div>
              <p style={{ fontFamily: 'Barlow, Manrope, sans-serif', fontSize: '0.68rem', color: '#8898b8', lineHeight: 1.5 }}>
                Family-owned since 1962. Over 60 years of serving Cleveland with honesty and integrity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 lg:hidden"
        style={{ background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', backdropFilter: 'blur(8px)' }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { setSelectedUnit(vehicle.id, 'finance'); navigate('/finance/apply') }}
            className="ncm-btn-red"
            style={{ flex: 1, borderRadius: '4px', justifyContent: 'center', fontSize: '0.72rem', padding: '0.75rem 0.5rem' }}
          >
            GET APPROVED
          </button>
          <button
            onClick={() => navigate('/schedule')}
            className="ncm-btn-outline"
            style={{ flex: 1, borderRadius: '4px', justifyContent: 'center', fontSize: '0.72rem', padding: '0.75rem 0.5rem' }}
          >
            SCHEDULE
          </button>
          <a
            href="tel:+12165693344"
            style={{ flex: 1, borderRadius: '4px', justifyContent: 'center', fontSize: '0.72rem', padding: '0.75rem 0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#f0f2f8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'Barlow, Manrope, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            📞 CALL
          </a>
        </div>
      </div>
    </div>
  )
}
