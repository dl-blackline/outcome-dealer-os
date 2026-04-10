import { describe, it, expect } from 'vitest'
import {
  getCurrentUserRole,
  getCurrentUserPermissions,
  userHasPermission,
  requirePermission,
  canAccessRoute,
  isExecutiveRole,
  isManagerRole,
} from '@/domains/auth/auth.permissions'
import { CurrentAppUser } from '@/domains/auth/auth.types'
import { ROLE_PERMISSIONS } from '@/domains/roles/permissions'

function createMockUser(role: string): CurrentAppUser {
  return {
    id: 'test-user-id',
    login: 'testuser',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    isOwner: role === 'owner',
    role: role as any,
    displayName: 'Test User',
    permissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [],
  }
}

describe('Auth Permissions - User Context', () => {
  it('should extract user role', () => {
    const user = createMockUser('sales_rep')
    expect(getCurrentUserRole(user)).toBe('sales_rep')
  })

  it('should extract user permissions', () => {
    const user = createMockUser('gm')
    const permissions = getCurrentUserPermissions(user)
    expect(permissions).toContain('view_executive_dashboard')
    expect(permissions).toContain('approve_trade_values')
  })
})

describe('Auth Permissions - Permission Checks', () => {
  it('should return true for permission user has', () => {
    const user = createMockUser('sales_manager')
    expect(userHasPermission(user, 'view_leads')).toBe(true)
    expect(userHasPermission(user, 'approve_financial_outputs')).toBe(true)
  })

  it('should return false for permission user lacks', () => {
    const user = createMockUser('sales_rep')
    expect(userHasPermission(user, 'approve_trade_values')).toBe(false)
    expect(userHasPermission(user, 'manage_integrations')).toBe(false)
  })

  it('should handle null user in requirePermission', () => {
    expect(requirePermission(null, 'view_leads')).toBe(false)
  })

  it('should check permission for valid user in requirePermission', () => {
    const user = createMockUser('bdc_manager')
    expect(requirePermission(user, 'assign_leads')).toBe(true)
    expect(requirePermission(user, 'approve_trade_values')).toBe(false)
  })
})

describe('Auth Permissions - Route Access', () => {
  it('should deny access when user is null', () => {
    expect(canAccessRoute(null)).toBe(false)
    expect(canAccessRoute(null, 'view_leads')).toBe(false)
  })

  it('should allow access when user exists and no permission required', () => {
    const user = createMockUser('sales_rep')
    expect(canAccessRoute(user)).toBe(true)
  })

  it('should check permission when required', () => {
    const user = createMockUser('fi_manager')
    expect(canAccessRoute(user, 'manage_fi')).toBe(true)
    expect(canAccessRoute(user, 'approve_trade_values')).toBe(false)
  })

  it('should handle executive-only routes', () => {
    const gm = createMockUser('gm')
    const salesRep = createMockUser('sales_rep')

    expect(canAccessRoute(gm, 'view_executive_dashboard')).toBe(true)
    expect(canAccessRoute(salesRep, 'view_executive_dashboard')).toBe(false)
  })
})

describe('Auth Permissions - Role Classification', () => {
  it('should identify executive roles', () => {
    expect(isExecutiveRole(createMockUser('owner'))).toBe(true)
    expect(isExecutiveRole(createMockUser('gm'))).toBe(true)
    expect(isExecutiveRole(createMockUser('gsm'))).toBe(true)
    expect(isExecutiveRole(createMockUser('admin'))).toBe(true)
  })

  it('should identify non-executive roles', () => {
    expect(isExecutiveRole(createMockUser('sales_rep'))).toBe(false)
    expect(isExecutiveRole(createMockUser('service_advisor'))).toBe(false)
    expect(isExecutiveRole(createMockUser('bdc_manager'))).toBe(false)
  })

  it('should identify manager roles', () => {
    expect(isManagerRole(createMockUser('owner'))).toBe(true)
    expect(isManagerRole(createMockUser('gm'))).toBe(true)
    expect(isManagerRole(createMockUser('sales_manager'))).toBe(true)
    expect(isManagerRole(createMockUser('bdc_manager'))).toBe(true)
    expect(isManagerRole(createMockUser('service_director'))).toBe(true)
  })

  it('should identify non-manager roles', () => {
    expect(isManagerRole(createMockUser('sales_rep'))).toBe(false)
    expect(isManagerRole(createMockUser('service_advisor'))).toBe(false)
  })
})

describe('Auth Permissions - Integration with Policy', () => {
  it('should delegate to policy layer for permission checks', () => {
    const ucm = createMockUser('used_car_manager')

    expect(userHasPermission(ucm, 'approve_trade_values')).toBe(true)
    expect(userHasPermission(ucm, 'edit_recon_jobs')).toBe(true)
    expect(userHasPermission(ucm, 'manage_fi')).toBe(false)
  })

  it('should match permissions defined in ROLE_PERMISSIONS', () => {
    const fiManager = createMockUser('fi_manager')
    const expectedPermissions = ROLE_PERMISSIONS['fi_manager']

    expectedPermissions.forEach((permission) => {
      expect(userHasPermission(fiManager, permission)).toBe(true)
    })
  })
})
