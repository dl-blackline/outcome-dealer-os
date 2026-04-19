/**
 * Tests for AuthService.fetchAuthUser() fallback chain:
 *
 * Priority order:
 *   1. Supabase (when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are configured)
 *   2. Spark with an authenticated user
 *   3. Spark present but no user → fall back to stored demo session
 *   4. No Supabase / no Spark → use stored demo session
 *   5. No session at all → throw clean error
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '@/domains/auth/auth.service'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// Mock isSupabaseConfigured and getSupabaseBrowserClient
vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  getSupabaseBrowserClient: vi.fn(() => null),
}))

// Mock roles/permissions so we don't need the full permission table
vi.mock('@/domains/roles/roles', () => ({
  APP_ROLES: ['gm', 'owner', 'sales_rep'],
  ROLE_LABELS: { gm: 'General Manager', owner: 'Owner', sales_rep: 'Sales Rep' },
}))

vi.mock('@/domains/roles/permissions', () => ({
  ROLE_PERMISSIONS: {
    gm: ['view_executive_dashboard'],
    owner: ['view_executive_dashboard'],
    sales_rep: ['view_leads'],
  },
}))

// ---------------------------------------------------------------------------
// Helpers to control the mocked modules
// ---------------------------------------------------------------------------

import * as supabaseClient from '@/lib/supabase/client'

const mockIsSupabaseConfigured = vi.mocked(supabaseClient.isSupabaseConfigured)
const mockGetSupabaseBrowserClient = vi.mocked(supabaseClient.getSupabaseBrowserClient)

const DEMO_SESSION_KEY = 'outcome.auth.demo-session'

function setDemoSession(session: object | null) {
  if (session === null) {
    localStorage.removeItem(DEMO_SESSION_KEY)
  } else {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
  }
}

const DEMO_SESSION = {
  id: 'demo-manager',
  login: 'manager',
  email: 'manager@outcome.local',
  avatarUrl: '',
  isOwner: true,
  role: 'gm',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthService.fetchAuthUser()', () => {
  beforeEach(() => {
    localStorage.clear()
    mockIsSupabaseConfigured.mockReturnValue(false)
    mockGetSupabaseBrowserClient.mockReturnValue(null)
    // Ensure spark global is not defined by default
    if (typeof (globalThis as Record<string, unknown>).spark !== 'undefined') {
      delete (globalThis as Record<string, unknown>).spark
    }
  })

  // -------------------------------------------------------------------------
  // 1. Supabase configured
  // -------------------------------------------------------------------------
  describe('when Supabase is configured', () => {
    it('returns a user from Supabase when session is active', async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockGetSupabaseBrowserClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'supabase-user-1',
                email: 'sb@example.com',
                user_metadata: { full_name: 'Supabase User' },
                app_metadata: {},
              },
            },
            error: null,
          }),
        },
      } as never)

      const user = await AuthService.fetchAuthUser()

      expect(user.id).toBe('supabase-user-1')
      expect(user.email).toBe('sb@example.com')
      expect(user.login).toBe('Supabase User')
    })

    it('throws "No active Supabase session" when no session', async () => {
      mockIsSupabaseConfigured.mockReturnValue(true)
      mockGetSupabaseBrowserClient.mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      } as never)

      await expect(AuthService.fetchAuthUser()).rejects.toThrow('No active Supabase session')
    })
  })

  // -------------------------------------------------------------------------
  // 2. Spark available with an authenticated user
  // -------------------------------------------------------------------------
  describe('when Spark is available with an authenticated user', () => {
    it('returns the Spark user', async () => {
      ;(globalThis as Record<string, unknown>).spark = {
        user: vi.fn().mockResolvedValue({
          id: 'spark-user-1',
          login: 'sparkuser',
          email: 'spark@example.com',
          avatarUrl: 'https://example.com/avatar.png',
          isOwner: false,
        }),
      }

      const user = await AuthService.fetchAuthUser()

      expect(user.id).toBe('spark-user-1')
      expect(user.login).toBe('sparkuser')
      expect(user.email).toBe('spark@example.com')
    })
  })

  // -------------------------------------------------------------------------
  // 3. Spark available but no authenticated user — fall back to demo session
  // -------------------------------------------------------------------------
  describe('when Spark is available but has no authenticated user', () => {
    it('returns the stored demo session when available', async () => {
      ;(globalThis as Record<string, unknown>).spark = {
        user: vi.fn().mockResolvedValue(null),
      }
      setDemoSession(DEMO_SESSION)

      const user = await AuthService.fetchAuthUser()

      expect(user.id).toBe('demo-manager')
      expect(user.login).toBe('manager')
    })

    it('throws "No active demo session" when Spark returns null and no demo session exists', async () => {
      ;(globalThis as Record<string, unknown>).spark = {
        user: vi.fn().mockResolvedValue(null),
      }
      // no demo session in localStorage

      await expect(AuthService.fetchAuthUser()).rejects.toThrow('No active demo session')
    })

    it('falls back to demo session when spark.user() throws', async () => {
      ;(globalThis as Record<string, unknown>).spark = {
        user: vi.fn().mockRejectedValue(new Error('Spark unavailable')),
      }
      setDemoSession(DEMO_SESSION)

      const user = await AuthService.fetchAuthUser()

      expect(user.id).toBe('demo-manager')
    })
  })

  // -------------------------------------------------------------------------
  // 4. No Supabase, no Spark — demo session in localStorage
  // -------------------------------------------------------------------------
  describe('when there is no Supabase and no Spark (demo mode)', () => {
    it('returns the stored demo session when available', async () => {
      setDemoSession(DEMO_SESSION)

      const user = await AuthService.fetchAuthUser()

      expect(user.id).toBe('demo-manager')
      expect(user.email).toBe('manager@outcome.local')
    })

    it('throws "No active demo session" when no session exists', async () => {
      // localStorage is empty (cleared in beforeEach)
      await expect(AuthService.fetchAuthUser()).rejects.toThrow('No active demo session')
    })
  })
})

// ---------------------------------------------------------------------------
// signInWithPassword — stores a demo session for non-supabase modes
// ---------------------------------------------------------------------------
describe('AuthService.signInWithPassword()', () => {
  beforeEach(() => {
    localStorage.clear()
    mockIsSupabaseConfigured.mockReturnValue(false)
    if (typeof (globalThis as Record<string, unknown>).spark !== 'undefined') {
      delete (globalThis as Record<string, unknown>).spark
    }
  })

  it('stores a demo session so fetchAuthUser() succeeds immediately after', async () => {
    await AuthService.signInWithPassword('manager@outcome.local', 'password123', 'gm')
    const user = await AuthService.fetchAuthUser()

    expect(user.id).toBe('demo-manager')
    expect(user.login).toBe('manager')
    expect(user.email).toBe('manager@outcome.local')
  })

  it('stores a demo session in spark mode (no Spark user) so login succeeds', async () => {
    ;(globalThis as Record<string, unknown>).spark = {
      user: vi.fn().mockResolvedValue(null),
    }

    await AuthService.signInWithPassword('manager@outcome.local', 'password123', 'gm')
    const user = await AuthService.fetchAuthUser()

    expect(user.id).toBe('demo-manager')
    expect(user.login).toBe('manager')
  })
})
