import { describe, it, expect } from 'vitest'
import { hasPermission, assertPermission, PermissionError } from '@/domains/roles/policy'
import { AppRole } from '@/domains/roles/roles'
import { Permission } from '@/domains/roles/permissions'

describe('Role Policy - hasPermission', () => {
  it('should grant owner all permissions', () => {
    const owner = { role: 'owner' as AppRole }
    expect(hasPermission(owner, 'view_executive_dashboard')).toBe(true)
    expect(hasPermission(owner, 'admin_platform')).toBe(true)
    expect(hasPermission(owner, 'manage_integrations')).toBe(true)
    expect(hasPermission(owner, 'approve_trade_values')).toBe(true)
  })

  it('should grant gm all permissions except admin_platform', () => {
    const gm = { role: 'gm' as AppRole }
    expect(hasPermission(gm, 'view_executive_dashboard')).toBe(true)
    expect(hasPermission(gm, 'manage_integrations')).toBe(true)
    expect(hasPermission(gm, 'approve_trade_values')).toBe(true)
    expect(hasPermission(gm, 'admin_platform')).toBe(false)
  })

  it('should grant sales_rep view and edit leads but not assign', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    expect(hasPermission(salesRep, 'view_leads')).toBe(true)
    expect(hasPermission(salesRep, 'edit_leads')).toBe(true)
    expect(hasPermission(salesRep, 'assign_leads')).toBe(false)
  })

  it('should deny sales_rep approval permissions', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    expect(hasPermission(salesRep, 'approve_trade_values')).toBe(false)
    expect(hasPermission(salesRep, 'approve_financial_outputs')).toBe(false)
    expect(hasPermission(salesRep, 'resolve_approvals')).toBe(false)
  })

  it('should grant fi_manager credit and finance permissions', () => {
    const fiManager = { role: 'fi_manager' as AppRole }
    expect(hasPermission(fiManager, 'view_credit_apps')).toBe(true)
    expect(hasPermission(fiManager, 'edit_credit_apps')).toBe(true)
    expect(hasPermission(fiManager, 'manage_fi')).toBe(true)
    expect(hasPermission(fiManager, 'approve_financial_outputs')).toBe(true)
  })

  it('should deny fi_manager trade editing permissions', () => {
    const fiManager = { role: 'fi_manager' as AppRole }
    expect(hasPermission(fiManager, 'edit_trades')).toBe(false)
    expect(hasPermission(fiManager, 'approve_trade_values')).toBe(false)
  })

  it('should grant used_car_manager trade and recon permissions', () => {
    const ucm = { role: 'used_car_manager' as AppRole }
    expect(hasPermission(ucm, 'view_trades')).toBe(true)
    expect(hasPermission(ucm, 'edit_trades')).toBe(true)
    expect(hasPermission(ucm, 'approve_trade_values')).toBe(true)
    expect(hasPermission(ucm, 'view_recon_jobs')).toBe(true)
    expect(hasPermission(ucm, 'edit_recon_jobs')).toBe(true)
  })

  it('should grant bdc_manager lead assignment and campaign access', () => {
    const bdcManager = { role: 'bdc_manager' as AppRole }
    expect(hasPermission(bdcManager, 'view_leads')).toBe(true)
    expect(hasPermission(bdcManager, 'assign_leads')).toBe(true)
    expect(hasPermission(bdcManager, 'view_campaigns')).toBe(true)
    expect(hasPermission(bdcManager, 'edit_campaigns')).toBe(true)
  })

  it('should deny bdc_manager approval permissions', () => {
    const bdcManager = { role: 'bdc_manager' as AppRole }
    expect(hasPermission(bdcManager, 'approve_trade_values')).toBe(false)
    expect(hasPermission(bdcManager, 'resolve_approvals')).toBe(false)
  })

  it('should grant service_director service and recon oversight', () => {
    const serviceDirector = { role: 'service_director' as AppRole }
    expect(hasPermission(serviceDirector, 'view_service_events')).toBe(true)
    expect(hasPermission(serviceDirector, 'edit_service_events')).toBe(true)
    expect(hasPermission(serviceDirector, 'view_recon_jobs')).toBe(true)
    expect(hasPermission(serviceDirector, 'resolve_approvals')).toBe(true)
  })

  it('should limit service_advisor to service events only', () => {
    const serviceAdvisor = { role: 'service_advisor' as AppRole }
    expect(hasPermission(serviceAdvisor, 'view_service_events')).toBe(true)
    expect(hasPermission(serviceAdvisor, 'edit_service_events')).toBe(true)
    expect(hasPermission(serviceAdvisor, 'view_recon_jobs')).toBe(false)
    expect(hasPermission(serviceAdvisor, 'resolve_approvals')).toBe(false)
  })

  it('should grant admin platform-wide permissions', () => {
    const admin = { role: 'admin' as AppRole }
    expect(hasPermission(admin, 'admin_platform')).toBe(true)
    expect(hasPermission(admin, 'manage_integrations')).toBe(true)
    expect(hasPermission(admin, 'view_audit_logs')).toBe(true)
  })
})

describe('Role Policy - assertPermission', () => {
  it('should not throw for valid permission', () => {
    const gm = { role: 'gm' as AppRole }
    expect(() => assertPermission(gm, 'view_leads')).not.toThrow()
  })

  it('should throw PermissionError for missing permission', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    expect(() => assertPermission(salesRep, 'approve_trade_values')).toThrow(PermissionError)
  })

  it('should include permission and user in error', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    try {
      assertPermission(salesRep, 'approve_trade_values' as Permission)
    } catch (error) {
      expect(error).toBeInstanceOf(PermissionError)
      const permError = error as PermissionError
      expect(permError.permission).toBe('approve_trade_values')
      expect(permError.user.role).toBe('sales_rep')
      expect(permError.message).toContain('sales_rep')
      expect(permError.message).toContain('approve_trade_values')
    }
  })
})

describe('Role Policy - Separation of Duties', () => {
  it('should separate edit from approval for trades', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    const gsm = { role: 'gsm' as AppRole }

    expect(hasPermission(salesRep, 'edit_trades')).toBe(true)
    expect(hasPermission(salesRep, 'approve_trade_values')).toBe(false)

    expect(hasPermission(gsm, 'edit_trades')).toBe(true)
    expect(hasPermission(gsm, 'approve_trade_values')).toBe(true)
  })

  it('should separate edit from approval for financial outputs', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    const salesManager = { role: 'sales_manager' as AppRole }

    expect(hasPermission(salesRep, 'edit_desk_scenarios')).toBe(true)
    expect(hasPermission(salesRep, 'approve_financial_outputs')).toBe(false)

    expect(hasPermission(salesManager, 'edit_desk_scenarios')).toBe(true)
    expect(hasPermission(salesManager, 'approve_financial_outputs')).toBe(true)
  })

  it('should separate credit viewing from credit editing', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    const fiManager = { role: 'fi_manager' as AppRole }

    expect(hasPermission(salesRep, 'view_credit_apps')).toBe(true)
    expect(hasPermission(salesRep, 'edit_credit_apps')).toBe(false)

    expect(hasPermission(fiManager, 'view_credit_apps')).toBe(true)
    expect(hasPermission(fiManager, 'edit_credit_apps')).toBe(true)
  })
})

describe('Role Policy - Executive Access', () => {
  it('should grant executive dashboard to leadership roles', () => {
    const owner = { role: 'owner' as AppRole }
    const gm = { role: 'gm' as AppRole }
    const gsm = { role: 'gsm' as AppRole }
    const admin = { role: 'admin' as AppRole }

    expect(hasPermission(owner, 'view_executive_dashboard')).toBe(true)
    expect(hasPermission(gm, 'view_executive_dashboard')).toBe(true)
    expect(hasPermission(gsm, 'view_executive_dashboard')).toBe(true)
    expect(hasPermission(admin, 'view_executive_dashboard')).toBe(true)
  })

  it('should deny executive dashboard to non-leadership', () => {
    const salesRep = { role: 'sales_rep' as AppRole }
    const serviceAdvisor = { role: 'service_advisor' as AppRole }
    const bdcManager = { role: 'bdc_manager' as AppRole }

    expect(hasPermission(salesRep, 'view_executive_dashboard')).toBe(false)
    expect(hasPermission(serviceAdvisor, 'view_executive_dashboard')).toBe(false)
    expect(hasPermission(bdcManager, 'view_executive_dashboard')).toBe(false)
  })
})
