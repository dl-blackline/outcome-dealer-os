import controlCenterMockup from '../../01_control_center.png'
import leadsCommandCenterMockup from '../../02_leads_command_center.png'
import inventoryCommandMockup from '../../03_inventory_command.png'
import customer360Mockup from '../../04_customer_360.png'
import dealDeskMockup from '../../05_deal_desk.png'
import financeCenterMockup from '../../06_finance_center.png'
import calendarExecutionMockup from '../../07_calendar_execution.png'
import analyticsReportsMockup from '../../08_analytics_reports.png'
import aiCopilotMockup from '../../09_ai_copilot.png'
import settingsAdminMockup from '../../10_settings_admin.png'
import sleekInventoryMockup from '../../01_site_mockups/sleek_car_dealership_inventory_page_design.png'
import sleekPerformanceHomeMockup from '../../01_site_mockups/sleek_performance_car_dealership_homepage_mockup.png'
import fastApprovalsNightMockup from '../../01_site_mockups/fast_easy_car_approvals_at_night.png'
import powerfulBrandingMockup from '../../01_site_mockups/powerful_branding_for_a_premium_car_dealership.png'
import sleekMuscleUiMockup from '../../01_site_mockups/sleek_muscle_car_dealer_website_ui.png'

export interface MockupReference {
  image: string
  chip: string
  title: string
  subtitle: string
}

export const MOCKUP_REFERENCES = {
  controlCenter: {
    image: controlCenterMockup,
    chip: '01 Reference',
    title: 'Control Center Blueprint',
    subtitle: 'Executive command layout with high-priority action density and real-time oversight.',
  },
  leadsCommandCenter: {
    image: leadsCommandCenterMockup,
    chip: '02 Reference',
    title: 'Leads Command Center',
    subtitle: 'Pipeline-first orchestration with clear ownership, urgency cues, and throughput visibility.',
  },
  inventoryCommand: {
    image: inventoryCommandMockup,
    chip: '03 Reference',
    title: 'Inventory Command Grid',
    subtitle: 'Frontline-to-recon command surface focused on turn rate, aging pressure, and merchandising velocity.',
  },
  customer360: {
    image: customer360Mockup,
    chip: '04 Reference',
    title: 'Customer 360 Profile',
    subtitle: 'Relationship intelligence with household economics, deal lineage, and lifecycle context.',
  },
  dealDesk: {
    image: dealDeskMockup,
    chip: '05 Reference',
    title: 'Deal Desk Orchestration',
    subtitle: 'Desk progression, approvals, and funding signals in a single high-clarity transaction flow.',
  },
  financeCenter: {
    image: financeCenterMockup,
    chip: '06 Reference',
    title: 'Finance Center Layout',
    subtitle: 'Lender fit, structure quality, and exception handling aligned for fast decisioning.',
  },
  calendarExecution: {
    image: calendarExecutionMockup,
    chip: '07 Reference',
    title: 'Calendar Execution Flow',
    subtitle: 'Time-sequenced operations view with event cadence and delivery-critical timing.',
  },
  analyticsReports: {
    image: analyticsReportsMockup,
    chip: '08 Reference',
    title: 'Analytics Reports Studio',
    subtitle: 'KPI command panel for trend visibility, conversion diagnostics, and decision support.',
  },
  aiCopilot: {
    image: aiCopilotMockup,
    chip: '09 Reference',
    title: 'AI Copilot Console',
    subtitle: 'Assistant-native operations layer for diagnostics, recommendations, and guided remediation.',
  },
  settingsAdmin: {
    image: settingsAdminMockup,
    chip: '10 Reference',
    title: 'Settings Admin Control',
    subtitle: 'Governance-first configuration workspace for roles, permissions, and system hardening.',
  },
} as const

export const BUYER_MOCKUP_REFERENCES = {
  performanceHome: {
    image: sleekPerformanceHomeMockup,
    chip: 'Buyer Reference A',
    title: 'Performance Home Experience',
    subtitle: 'Premium hero storytelling with high-contrast dealership presentation.',
  },
  inventory: {
    image: sleekInventoryMockup,
    chip: 'Buyer Reference B',
    title: 'Inventory Showroom Grid',
    subtitle: 'Inventory-first browsing with conversion-focused merchandising.',
  },
  approvals: {
    image: fastApprovalsNightMockup,
    chip: 'Buyer Reference C',
    title: 'Fast Approval Journey',
    subtitle: 'Night-mode financing flow built for speed and confidence.',
  },
  branding: {
    image: powerfulBrandingMockup,
    chip: 'Buyer Reference D',
    title: 'Premium Dealer Identity',
    subtitle: 'Brand-rich visual language for trust and value positioning.',
  },
  muscleUi: {
    image: sleekMuscleUiMockup,
    chip: 'Buyer Reference E',
    title: 'Performance UI System',
    subtitle: 'Sharp, muscular interface style across buyer funnel surfaces.',
  },
} as const
