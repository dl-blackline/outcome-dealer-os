const WHOLESALE_ACCESS_KEY = 'outcome.wholesale.access'
const WHOLESALE_FAILED_ATTEMPTS_KEY = 'outcome.wholesale.failed-attempts'
const WHOLESALE_TTL_MS = 1000 * 60 * 60 * 12
const WHOLESALE_MAX_FAILED_ATTEMPTS = 5
const WHOLESALE_LOCKOUT_WINDOW_MS = 1000 * 60 * 10

interface WholesaleAccessState {
  grantedAt: number
  expiresAt: number
}

interface WholesaleFailedAttemptsState {
  count: number
  firstFailedAt: number
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

function readFailedAttemptsState(): WholesaleFailedAttemptsState | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(WHOLESALE_FAILED_ATTEMPTS_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as WholesaleFailedAttemptsState
    if (!parsed.firstFailedAt || !parsed.count) return null

    if (Date.now() - parsed.firstFailedAt > WHOLESALE_LOCKOUT_WINDOW_MS) {
      window.localStorage.removeItem(WHOLESALE_FAILED_ATTEMPTS_KEY)
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function writeFailedAttemptsState(state: WholesaleFailedAttemptsState | null) {
  if (typeof window === 'undefined') return

  if (!state) {
    window.localStorage.removeItem(WHOLESALE_FAILED_ATTEMPTS_KEY)
    return
  }

  window.localStorage.setItem(WHOLESALE_FAILED_ATTEMPTS_KEY, JSON.stringify(state))
}

export function hasWholesaleAccess(): boolean {
  return Boolean(readState())
}

export function grantWholesaleAccess(password: string): { ok: boolean; error?: string } {
  const normalizedPassword = password.trim()
  if (!normalizedPassword) {
    return { ok: false, error: 'Enter the wholesale password.' }
  }

  const failedState = readFailedAttemptsState()
  if (failedState && failedState.count >= WHOLESALE_MAX_FAILED_ATTEMPTS) {
    return { ok: false, error: 'Too many failed attempts. Try again in 10 minutes.' }
  }

  const expected = getConfiguredPassword()
  if (normalizedPassword !== expected) {
    const now = Date.now()
    const current = readFailedAttemptsState()
    if (!current) {
      writeFailedAttemptsState({ count: 1, firstFailedAt: now })
    } else {
      writeFailedAttemptsState({ count: current.count + 1, firstFailedAt: current.firstFailedAt })
    }

    return { ok: false, error: 'Incorrect wholesale password.' }
  }

  if (typeof window !== 'undefined') {
    const now = Date.now()
    const state: WholesaleAccessState = {
      grantedAt: now,
      expiresAt: now + WHOLESALE_TTL_MS,
    }
    window.localStorage.setItem(WHOLESALE_ACCESS_KEY, JSON.stringify(state))
    writeFailedAttemptsState(null)
  }

  return { ok: true }
}

export function clearWholesaleAccess() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(WHOLESALE_ACCESS_KEY)
  window.localStorage.removeItem(WHOLESALE_FAILED_ATTEMPTS_KEY)
}
