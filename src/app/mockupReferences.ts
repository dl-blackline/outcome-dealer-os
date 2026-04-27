export interface MockupReference {
  chip: string
  title: string
  subtitle: string
}

export const MOCKUP_REFERENCES = {
  controlCenter: {
    chip: '01 Reference',
    title: 'Control Center Blueprint',
    subtitle: 'Executive command layout with high-priority action density and real-time oversight.',
  },
  leadsCommandCenter: {
    chip: '02 Reference',
    title: 'Leads Command Center',
    subtitle: 'Pipeline-first orchestration with clear ownership, urgency cues, and throughput visibility.',
  },
  inventoryCommand: {
    chip: '03 Reference',
    title: 'Inventory Command Grid',
    subtitle: 'Frontline-to-recon command surface focused on turn rate, aging pressure, and merchandising velocity.',
  },
  customer360: {
    chip: '04 Reference',
    title: 'Customer 360 Profile',
    subtitle: 'Relationship intelligence with household economics, deal lineage, and lifecycle context.',
  },
  dealDesk: {
    chip: '05 Reference',
    title: 'Deal Desk Orchestration',
    subtitle: 'Desk progression, approvals, and funding signals in a single high-clarity transaction flow.',
  },
  financeCenter: {
    chip: '06 Reference',
    title: 'Finance Center Layout',
    subtitle: 'Lender fit, structure quality, and exception handling aligned for fast decisioning.',
  },
  calendarExecution: {
    chip: '07 Reference',
    title: 'Calendar Execution Flow',
    subtitle: 'Time-sequenced operations view with event cadence and delivery-critical timing.',
  },
  analyticsReports: {
    chip: '08 Reference',
    title: 'Analytics Reports Studio',
    subtitle: 'KPI command panel for trend visibility, conversion diagnostics, and decision support.',
  },
  aiCopilot: {
    chip: '09 Reference',
    title: 'AI Copilot Console',
    subtitle: 'Assistant-native operations layer for diagnostics, recommendations, and guided remediation.',
  },
  settingsAdmin: {
    chip: '10 Reference',
    title: 'Settings Admin Control',
    subtitle: 'Governance-first configuration workspace for roles, permissions, and system hardening.',
  },
} as const

export const BUYER_MOCKUP_REFERENCES = {
  performanceHome: {
    chip: 'Buyer Reference A',
    title: 'Performance Home Experience',
    subtitle: 'Premium hero storytelling with high-contrast dealership presentation.',
  },
  inventory: {
    chip: 'Buyer Reference B',
    title: 'Inventory Showroom Grid',
    subtitle: 'Inventory-first browsing with conversion-focused merchandising.',
  },
  approvals: {
    chip: 'Buyer Reference C',
    title: 'Fast Approval Journey',
    subtitle: 'Night-mode financing flow built for speed and confidence.',
  },
  branding: {
    chip: 'Buyer Reference D',
    title: 'Premium Dealer Identity',
    subtitle: 'Brand-rich visual language for trust and value positioning.',
  },
  muscleUi: {
    chip: 'Buyer Reference E',
    title: 'Performance UI System',
    subtitle: 'Sharp, muscular interface style across buyer funnel surfaces.',
  },
} as const
