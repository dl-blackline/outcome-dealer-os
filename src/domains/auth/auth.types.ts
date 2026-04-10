import { AppRole } from '@/domains/roles/roles'
import { Permission } from '@/domains/roles/permissions'

export type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated'

export interface AuthUser {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
}

export interface SessionUser {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
  role: AppRole
}

export interface CurrentAppUser extends SessionUser {
  displayName: string
  permissions: Permission[]
}

export interface AuthState {
  status: AuthStatus
  user: CurrentAppUser | null
  error: string | null
}

export interface AuthContextValue extends AuthState {
  refreshUser: () => Promise<void>
  setRole: (role: AppRole) => void
  signOut: () => Promise<void>
}
