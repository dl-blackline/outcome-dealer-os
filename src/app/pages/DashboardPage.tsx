import { SectionHeader } from '@/components/core/SectionHeader'
import { ReferenceHero } from '@/components/core/ReferenceHero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/core/StatusPill'
import { useLeads } from '@/domains/leads/lead.hooks'
import { useDeals } from '@/domains/deals/deal.hooks'
import { useApprovals } from '@/domains/approvals/approval.hooks'
import { useInventory } from '@/domains/inventory/inventory.hooks'
import { useTasks } from '@/domains/tasks/task.hooks'
import { useWorkstationCards } from '@/domains/workstation/workstation.hooks'
import { TrendUp, CheckCircle, Clock, Warning, SpinnerGap, Kanban, UserPlus, FileText, CurrencyDollar } from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { MOCKUP_REFERENCES } from '@/app/mockupReferences'

export function DashboardPage() {
  const leads = useLeads()
  const deals = useDeals()
  const approvals = useApprovals()
  const inventory = useInventory()
  const tasks = useTasks()
  const workstationCards = useWorkstationCards()
  const { navigate } = useRouter()

  if (leads.loading || deals.loading || approvals.loading || inventory.loading || tasks.loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const pendingApprovals = approvals.data.filter(a => a.status === 'pending').length
  const agingInventory = inventory.data.filter(i => i.status === 'aging').length
  const openCards = workstationCards.data.filter(c => c.columnId !== 'done').length
  const inboxCards = workstationCards.data.filter(c => c.columnId === 'inbox').length

  return (
    <div className="space-y-10 pb-8">
      <SectionHeader
        title="Dashboard"
        description={`Welcome back. Here's what's happening across the operation.`}
      />

      <ReferenceHero reference={MOCKUP_REFERENCES.controlCenter} />

      <section className="rounded-2xl border border-white/15 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.4)]">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-blue-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Lead Throughput</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{leads.data.length}</p>
            <p className="text-xs text-slate-400">{leads.data.filter((l) => l.status === 'qualified').length} qualified</p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Active Deals</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{deals.data.length}</p>
            <p className="text-xs text-slate-400">{deals.data.filter((d) => d.status === 'funded').length} funded this period</p>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Approvals Queue</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{pendingApprovals}</p>
            <p className="text-xs text-slate-400">Manager intervention required</p>
          </div>
          <div className="rounded-xl border border-rose-300/20 bg-slate-900/80 p-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Aging Exposure</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{agingInventory}</p>
            <p className="text-xs text-slate-400">Units above healthy turn window</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr_0.95fr]">
          <Card className="border-white/15 bg-slate-950/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-[0.12em] text-slate-100">Command Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => navigate('/app/records/leads/new')} className="justify-start gap-2 bg-blue-600 hover:bg-blue-500">
                <UserPlus className="h-4 w-4" /> Create Lead
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/records/credit-applications/new')} className="justify-start gap-2 border-slate-600 text-slate-200 hover:bg-slate-800">
                <FileText className="h-4 w-4" /> Credit App
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/records/deals/new')} className="justify-start gap-2 border-slate-600 text-slate-200 hover:bg-slate-800">
                <CurrencyDollar className="h-4 w-4" /> Desk Deal
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/workstation')} className="justify-start gap-2 border-slate-600 text-slate-200 hover:bg-slate-800">
                <Kanban className="h-4 w-4" /> Workstation
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-slate-950/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-[0.12em] text-slate-100">Live Operations Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                <span className="text-slate-300">Inbox cards</span>
                <span className="font-semibold text-slate-100">{inboxCards}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                <span className="text-slate-300">Open workstation cards</span>
                <span className="font-semibold text-slate-100">{openCards}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                <span className="text-slate-300">Tasks due today</span>
                <span className="font-semibold text-slate-100">{tasks.data.filter((t) => t.status !== 'completed').length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-slate-950/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-[0.12em] text-slate-100">Alert Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                {pendingApprovals} pending approvals require managerial sign-off.
              </div>
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                {agingInventory} inventory units are over aging threshold.
              </div>
              <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-100">
                {leads.data.filter((l) => l.status === 'new').length} new leads are waiting for first contact.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/app/records/leads/new')} className="gap-2">
              <UserPlus className="h-4 w-4" /> New Lead
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/records/credit-applications/new')} className="gap-2">
              <FileText className="h-4 w-4" /> New Credit App
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/records/deals/new')} className="gap-2">
              <CurrencyDollar className="h-4 w-4" /> New Deal
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => navigate('/app/records/leads')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.data.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.data.filter(l => l.status === 'qualified').length} qualified
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => navigate('/app/records/deals')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals in Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.data.length}</div>
            <p className="text-xs text-muted-foreground">
              {deals.data.filter(d => d.status === 'funded').length} funded this period
            </p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${pendingApprovals > 0 ? 'border-yellow-500/30' : ''}`} onClick={() => navigate('/app/ops/approvals')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires manager action
            </p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${agingInventory > 0 ? 'border-red-500/30' : ''}`} onClick={() => navigate('/app/records/inventory')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aging Inventory</CardTitle>
            <Warning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agingInventory}</div>
            <p className="text-xs text-muted-foreground">
              60+ days in stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workstation summary */}
      <Card className="cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => navigate('/app/workstation')}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Kanban className="h-5 w-5" /> Workstation</CardTitle>
          <StatusPill variant={inboxCards > 0 ? 'warning' : 'success'} dot={false}>{openCards} open</StatusPill>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <div><span className="text-muted-foreground">Inbox: </span><span className="font-semibold">{inboxCards}</span></div>
            <div><span className="text-muted-foreground">Today: </span><span className="font-semibold">{workstationCards.data.filter(c => c.columnId === 'today').length}</span></div>
            <div><span className="text-muted-foreground">In Progress: </span><span className="font-semibold">{workstationCards.data.filter(c => c.columnId === 'in_progress').length}</span></div>
            <div><span className="text-muted-foreground">Waiting: </span><span className="font-semibold">{workstationCards.data.filter(c => c.columnId === 'waiting').length}</span></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No leads yet. New leads will appear here.</p>
            ) : (
              <div className="space-y-4">
                {leads.data.map(lead => (
                  <div key={lead.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 cursor-pointer hover:bg-accent/20 rounded px-2 -mx-2 transition-colors" onClick={() => navigate(`/app/records/leads/${lead.id}`)}>
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No deals yet. Convert a lead to start a deal.</p>
            ) : (
              <div className="space-y-4">
                {deals.data.map(deal => (
                  <div key={deal.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 cursor-pointer hover:bg-accent/20 rounded px-2 -mx-2 transition-colors" onClick={() => navigate(`/app/records/deals/${deal.id}`)}>
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
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.data.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No tasks yet. Tasks assigned to you will appear here.</p>
          ) : (
            <div className="space-y-3">
              {tasks.data.map(task => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
