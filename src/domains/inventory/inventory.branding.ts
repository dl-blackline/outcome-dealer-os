export interface ManufacturerBranding {
  make: string
  shortLabel: string
  mark: string
  accentClass: string
}

const BRANDING: Record<string, Omit<ManufacturerBranding, 'make'>> = {
  toyota: { shortLabel: 'Toyota', mark: 'T', accentClass: 'from-red-500/30 to-red-800/40' },
  honda: { shortLabel: 'Honda', mark: 'H', accentClass: 'from-slate-400/30 to-slate-700/45' },
  ford: { shortLabel: 'Ford', mark: 'F', accentClass: 'from-blue-400/35 to-blue-700/50' },
  chevrolet: { shortLabel: 'Chevrolet', mark: 'C', accentClass: 'from-amber-400/35 to-yellow-700/45' },
  nissan: { shortLabel: 'Nissan', mark: 'N', accentClass: 'from-zinc-400/35 to-zinc-700/50' },
  kia: { shortLabel: 'Kia', mark: 'K', accentClass: 'from-rose-500/35 to-rose-800/45' },
  hyundai: { shortLabel: 'Hyundai', mark: 'H', accentClass: 'from-sky-500/35 to-blue-700/50' },
  mazda: { shortLabel: 'Mazda', mark: 'M', accentClass: 'from-slate-500/30 to-slate-800/55' },
  subaru: { shortLabel: 'Subaru', mark: 'S', accentClass: 'from-indigo-500/35 to-blue-800/45' },
  jeep: { shortLabel: 'Jeep', mark: 'J', accentClass: 'from-emerald-500/35 to-lime-800/45' },
  ram: { shortLabel: 'Ram', mark: 'R', accentClass: 'from-cyan-500/30 to-slate-800/50' },
  dodge: { shortLabel: 'Dodge', mark: 'D', accentClass: 'from-red-500/35 to-orange-800/45' },
  gmc: { shortLabel: 'GMC', mark: 'G', accentClass: 'from-red-500/35 to-zinc-800/45' },
  bmw: { shortLabel: 'BMW', mark: 'B', accentClass: 'from-sky-400/35 to-indigo-800/45' },
  mercedes: { shortLabel: 'Mercedes', mark: 'M', accentClass: 'from-zinc-300/35 to-zinc-700/45' },
  lexus: { shortLabel: 'Lexus', mark: 'L', accentClass: 'from-slate-300/35 to-zinc-700/45' },
  volkswagen: { shortLabel: 'Volkswagen', mark: 'VW', accentClass: 'from-blue-500/35 to-indigo-800/45' },
  audi: { shortLabel: 'Audi', mark: 'A', accentClass: 'from-zinc-300/35 to-zinc-700/45' },
  tesla: { shortLabel: 'Tesla', mark: 'T', accentClass: 'from-red-600/35 to-zinc-900/55' },
}

function buildFallbackMark(make: string): string {
  const words = make.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
}

export function getManufacturerBranding(make: string | undefined): ManufacturerBranding {
  const normalizedMake = (make || 'Unknown').trim()
  const key = normalizedMake.toLowerCase()
  const base = BRANDING[key]

  if (!base) {
    return {
      make: normalizedMake || 'Unknown',
      shortLabel: normalizedMake || 'Unknown',
      mark: buildFallbackMark(normalizedMake || 'Unknown'),
      accentClass: 'from-slate-500/35 to-slate-800/55',
    }
  }

  return {
    make: normalizedMake,
    shortLabel: base.shortLabel,
    mark: base.mark,
    accentClass: base.accentClass,
  }
}