import { useState } from 'react'
import { AppRole } from '@/domains/roles/roles'
import { AppSidebar } from '@/components/shell/AppSidebar'
import { Topbar } from '@/components/shell/Topbar'
import { CommandPalette } from '@/components/shell/CommandPalette'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/core/StatusPill'
import { MOCK_LEADS, MOCK_DEALS, MOCK_INVENTORY, MOCK_APPROVALS, MOCK_TASKS } from '@/lib/mockData'
import { TrendUp, CheckCircle, Clock, Warning } from '@phosphor-icons/react'

function App() {
  const [currentRole, setCurrentRole] = useState<AppRole>('gm')
  const [currentPath, setCurrentPath] = useState('/app/dashboard')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const handleNavigation = (href: string) => {
    setCurrentPath(href)
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar currentPath={currentPath} currentRole={currentRole} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-8">
          {currentPath === '/app/dashboard' && (
            <div className="space-y-8">
              <SectionHeader
                title="Dashboard"
                description={`Welcome back. Here's what's happening across the operation.`}
              />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                    <TrendUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{MOCK_LEADS.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deals in Progress</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{MOCK_DEALS.length}</div>
                    <p className="text-xs text-muted-foreground">
                      1 funded this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {MOCK_APPROVALS.filter(a => a.status === 'pending').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requires manager action
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aging Inventory</CardTitle>
                    <Warning className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {MOCK_INVENTORY.filter(i => i.status === 'aging').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      60+ days in stock
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {MOCK_LEADS.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                          <div>
                            <p className="font-medium">{lead.customerName}</p>
                            <p className="text-sm text-muted-foreground">{lead.source} • Score: {lead.score}</p>
                          </div>
                          <StatusPill variant={
                            lead.status === 'converted' ? 'success' :
                            lead.status === 'qualified' ? 'info' :
                            lead.status === 'contacted' ? 'warning' : 'neutral'
                          }>
                            {lead.status}
                          </StatusPill>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Deals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {MOCK_DEALS.map(deal => (
                        <div key={deal.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                          <div>
                            <p className="font-medium">{deal.customerName}</p>
                            <p className="text-sm text-muted-foreground">{deal.vehicleDescription}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${deal.amount.toLocaleString()}</p>
                            <StatusPill variant={
                              deal.status === 'funded' ? 'success' :
                              deal.status === 'signed' ? 'info' :
                              deal.status === 'quoted' ? 'warning' : 'neutral'
                            }>
                              {deal.status}
                            </StatusPill>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MOCK_TASKS.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={task.status === 'completed'} readOnly className="h-4 w-4" />
                          <div>
                            <p className={task.status === 'completed' ? 'line-through text-muted-foreground' : 'font-medium'}>
                              {task.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due: {task.dueDate} • {task.assignedTo}
                            </p>
                          </div>
                        </div>
                        <StatusPill variant={
                          task.priority === 'high' ? 'danger' :
                          task.priority === 'medium' ? 'warning' : 'neutral'
                        }>
                          {task.priority}
                        </StatusPill>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentPath.startsWith('/app/records') && (
            <div className="space-y-6">
              <SectionHeader
                title="Records"
                description="Manage households, leads, deals, and inventory"
              />
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  Record detail views coming soon. This would display the specific record type based on the URL.
                </CardContent>
              </Card>
            </div>
          )}

          {currentPath.startsWith('/app/ops') && (
            <div className="space-y-6">
              <SectionHeader
                title="Operations"
                description="Events, approvals, and audit logs"
              />
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  Operations views coming soon. This would show events, approval queues, and audit logs.
                </CardContent>
              </Card>
            </div>
          )}

          {currentPath.startsWith('/app/settings') && (
            <div className="space-y-6">
              <SectionHeader
                title="Settings"
                description="Configure roles, integrations, and system preferences"
              />
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  Settings pages coming soon. This would allow configuration of the system.
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  )
}

export default App
