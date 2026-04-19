import { AuthUser, SessionUser, CurrentAppUser, AuthRuntimeMode } from './auth.types'
import { APP_ROLES, AppRole, ROLE_LABELS } from '@/domains/roles/roles'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'

const DEMO_SESSION_KEY = 'outcome.auth.demo-session'

function isAppRole(value: string | undefined): value is AppRole {
  return Boolean(value && APP_ROLES.includes(value as AppRole))
}

function getStoredDemoSession(): SessionUser | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

function storeDemoSession(sessionUser: SessionUser | null) {
  if (typeof window === 'undefined') return

  if (!sessionUser) {
    window.localStorage.removeItem(DEMO_SESSION_KEY)
    return
  }

  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sessionUser))
}

async function safeGetSparkUser(): Promise<AuthUser | null> {
  if (typeof spark === 'undefined') return null

  try {
    const userInfo = await spark.user()
    if (!userInfo) return null
    return {
      id: userInfo.id,
      login: userInfo.login,
      email: userInfo.email,
      avatarUrl: userInfo.avatarUrl,
      isOwner: userInfo.isOwner,
    }
  } catch {
    return null
  }
}

export class AuthService {
  /**
   * Resolve the active runtime mode in priority order:
   *   1. supabase  — when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set
   *   2. spark     — when the Spark global is present (may or may not have an active user)
   *   3. demo      — local-only fallback using localStorage
   */
  static getRuntimeMode(): AuthRuntimeMode {
    if (isSupabaseConfigured()) return 'supabase'
    if (typeof spark !== 'undefined') return 'spark'
    return 'demo'
  }

  static allowRoleSwitching(mode: AuthRuntimeMode): boolean {
    return mode !== 'supabase'
  }

  static async fetchAuthUser(): Promise<AuthUser> {
    const mode = this.getRuntimeMode()

    // Fallback order is intentional for reliability:
    // Supabase session -> Spark session -> locally stored demo session.
    if (mode === 'supabase') {
      const client = getSupabaseBrowserClient()
      const { data, error } = await client!.auth.getUser()

      if (error || !data?.user) {
        throw new Error('No active Supabase session')
      }

      return {
        id: data.user.id,
        login: String(data.user.user_metadata?.full_name || data.user.email || 'staff'),
        email: data.user.email || '',
        avatarUrl: String(data.user.user_metadata?.avatar_url || ''),
        isOwner: false,
      }
    }

    // --- 2. Spark auth (with graceful demo-session fallback) ---
    // Spark may be present but have no authenticated user (e.g. local dev preview).
    // In that case we fall through to the stored demo session rather than crashing.
    if (mode === 'spark') {
      const sparkUser = await safeGetSparkUser()
      if (sparkUser) return sparkUser

      const demoSession = getStoredDemoSession()
      if (demoSession) {
        return {
          id: demoSession.id,
          login: demoSession.login,
          email: demoSession.email,
          avatarUrl: demoSession.avatarUrl,
          isOwner: demoSession.isOwner,
        }
      }
      throw new Error('No active demo session')
    }

    // --- 3. Demo / local session ---
    const demoSession = getStoredDemoSession()
    if (!demoSession) {
      throw new Error('No active demo session')
    }

    return {
      id: demoSession.id,
      login: demoSession.login,
      email: demoSession.email,
      avatarUrl: demoSession.avatarUrl,
      isOwner: demoSession.isOwner,
    }
  }

  static async loadSessionUser(role: AppRole): Promise<SessionUser> {
    const authUser = await this.fetchAuthUser()

    if (this.getRuntimeMode() === 'supabase') {
      const client = getSupabaseBrowserClient()
      const { data } = await client!.auth.getUser()
      const metadataRole = String(data?.user?.app_metadata?.role || data?.user?.user_metadata?.role || '')

      return {
        ...authUser,
        role: isAppRole(metadataRole) ? metadataRole : role,
      }
    }

    const demoSession = getStoredDemoSession()

    return {
      ...authUser,
      role: demoSession?.role || role,
    }
  }

  static buildCurrentAppUser(sessionUser: SessionUser): CurrentAppUser {
    const permissions = ROLE_PERMISSIONS[sessionUser.role]
    const displayName = sessionUser.login || sessionUser.email.split('@')[0]

    return {
      ...sessionUser,
      displayName,
      permissions,
    }
  }

  static async resolveCurrentUser(role: AppRole): Promise<CurrentAppUser> {
    const sessionUser = await this.loadSessionUser(role)
    return this.buildCurrentAppUser(sessionUser)
  }

  static async signInWithPassword(email: string, password: string, role: AppRole): Promise<void> {
    if (this.getRuntimeMode() === 'supabase') {
      const client = getSupabaseBrowserClient()
      const { error } = await client!.auth.signInWithPassword({ email, password })
      if (error) throw error
      return
    }

    const login = email.split('@')[0] || 'demo-user'
    storeDemoSession({
      id: `demo-${login}`,
      login,
      email,
      avatarUrl: '',
      isOwner: true,
      role,
    })
  }

  static async signOut(): Promise<void> {
    if (this.getRuntimeMode() === 'supabase') {
      const client = getSupabaseBrowserClient()
      await client!.auth.signOut()
      return
    }

    storeDemoSession(null)
  }

  static subscribeToAuthChanges(onChange: () => void): () => void {
    if (this.getRuntimeMode() !== 'supabase') return () => undefined

    const client = getSupabaseBrowserClient()
    const subscription = client!.auth.onAuthStateChange(() => {
      onChange()
    })

    return () => {
      subscription.data.subscription.unsubscribe()
    }
  }
}

export function getUserRoleLabel(role: AppRole): string {
  return ROLE_LABELS[role]
}

export function getUserDisplayName(login: string, email: string): string {
  return login || email.split('@')[0]
}
