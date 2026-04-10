import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/core/StatusPill'
import { MOCK_TASKS } from '@/lib/mockData'
import { getDashboardSignals, type MetricCard } from '@/domains/dashboard/dashboard.adapters'
import { useAuth } from '@/domains/auth/auth.store'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'

function MetricIcon({ trend }: { trend?: MetricCard['trend'] }) {
  if (trend === 'up') return <TrendUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <TrendDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

export function DashboardPage() {
  const { user } = useAuth()
  const role = user?.role ?? 'gm'
  const signals = getDashboardSignals(role)

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        description={`Welcome back${user?.displayName ? `, ${user.displayName}` : ''}. Here's what's happening across the operation.`}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {signals.metrics.map(metric => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <MetricIcon trend={metric.trend} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals.recentLeads.map(lead => (
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
              {signals.activeDeals.map(deal => (
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
  )
}
