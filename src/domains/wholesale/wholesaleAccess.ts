const WHOLESALE_ACCESS_KEY = 'outcome.wholesale.access'
const WHOLESALE_TTL_MS = 1000 * 60 * 60 * 12

interface WholesaleAccessState {
  grantedAt: number
  expiresAt: number
}

function getConfiguredPassword(): string {
  const fromEnv = (import.meta.env.VITE_WHOLESALE_PASSWORD as string | undefined)?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv : 'dealer-wholesale'
}

function readState(): WholesaleAccessState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(WHOLESALE_ACCESS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WholesaleAccessState
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(WHOLESALE_ACCESS_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function hasWholesaleAccess(): boolean {
  return Boolean(readState())
}

export function grantWholesaleAccess(password: string): { ok: boolean; error?: string } {
  const expected = getConfiguredPassword()
  if (password.trim() !== expected) {
    return { ok: false, error: 'Incorrect wholesale password.' }
  }

  if (typeof window !== 'undefined') {
    const now = Date.now()
    const state: WholesaleAccessState = {
      grantedAt: now,
      expiresAt: now + WHOLESALE_TTL_MS,
    }
    window.localStorage.setItem(WHOLESALE_ACCESS_KEY, JSON.stringify(state))
  }

  return { ok: true }
}

export function clearWholesaleAccess() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(WHOLESALE_ACCESS_KEY)
}
