import { AuthUser, SessionUser, CurrentAppUser } from './auth.types'
import { AppRole, ROLE_LABELS } from '@/domains/roles/roles'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'

export class AuthService {
  static async fetchAuthUser(): Promise<AuthUser> {
    try {
      const userInfo = await spark.user()
      return {
        id: userInfo.id,
        login: userInfo.login,
        email: userInfo.email,
        avatarUrl: userInfo.avatarUrl,
        isOwner: userInfo.isOwner,
      }
    } catch (error) {
      throw new Error(`Failed to fetch authenticated user: ${error}`)
    }
  }

  static async loadSessionUser(role: AppRole): Promise<SessionUser> {
    const authUser = await this.fetchAuthUser()
    return {
      ...authUser,
      role,
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
}

export function getUserRoleLabel(role: AppRole): string {
  return ROLE_LABELS[role]
}

export function getUserDisplayName(login: string, email: string): string {
  return login || email.split('@')[0]
}
