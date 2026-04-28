import { Bell, MagnifyingGlass, Lightning, CaretDown, ChatCircle } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppRole, ROLE_LABELS } from '@/domains/roles/roles'
import { AuthRuntimeMode } from '@/domains/auth'
import { ThemeMode } from '@/domains/theme'

interface TopbarProps {
  currentRole: AppRole
  userName: string
  allowRoleSwitching: boolean
  authMode: AuthRuntimeMode
  onRoleChange: (role: AppRole) => void
  onLogout: () => Promise<void>
  onCommandPaletteOpen: () => void
  onNotificationsOpen: () => void
  theme: ThemeMode
  onThemeToggle: () => void
}

export function Topbar({ currentRole, userName, allowRoleSwitching, authMode, onRoleChange, onLogout, onCommandPaletteOpen, onNotificationsOpen }: TopbarProps) {
  return (
    <div
      className="flex h-16 items-center gap-4 px-5 shrink-0 relative"
      style={{
        background: 'linear-gradient(180deg, #0D0F14 0%, #0A0C10 100%)',
        borderBottom: '1px solid rgba(192,195,199,0.07)',
        boxShadow: '0 1px 0 rgba(227,27,55,0.25), 0 4px 24px rgba(0,0,0,0.7)',
      }}
    >
      {/* National Red accent line at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #E31B37 20%, rgba(227,27,55,0.6) 50%, #1E3A8A 80%, transparent 100%)' }}
      />

      {/* Global search */}
      <button
        onClick={onCommandPaletteOpen}
        className="flex flex-1 max-w-xl items-center gap-3 rounded-md px-4 py-2 text-sm transition-all"
        style={{
          background: '#060709',
          border: '1px solid rgba(192,195,199,0.09)',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(227,27,55,0.45)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(192,195,199,0.10)')}
      >
        <MagnifyingGlass className="h-4 w-4 text-white/30 shrink-0" />
        <span className="text-white/30 text-[0.82rem] flex-1 text-left">Search leads, inventory, deals, customers…</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-[0.65rem] text-white/20 font-mono border border-white/10 rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[0.78rem] font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #E31B37 0%, #c0152d 100%)',
                boxShadow: '0 0 12px rgba(227,27,55,0.3)',
              }}
            >
              <Lightning className="h-3.5 w-3.5 text-white/80" weight="fill" />
              Quick Actions
              <CaretDown className="h-3 w-3 text-white/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52" style={{ background: '#1B1E23', border: '1px solid rgba(192,195,199,0.10)' }}>
            <DropdownMenuItem className="text-sm text-white/80 hover:bg-white/5">New Lead</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-white/80 hover:bg-white/5">New Deal</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-white/80 hover:bg-white/5">New Credit App</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/8" />
            <DropdownMenuItem className="text-sm text-white/80 hover:bg-white/5">Schedule Appointment</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-white/80 hover:bg-white/5">Add Inventory Unit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <button
          onClick={onNotificationsOpen}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white/80 transition-colors hover:bg-white/5"
        >
          <ChatCircle className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-blue-700 shadow-[0_0_6px_rgba(30,58,138,0.8)]" />
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsOpen}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white/80 transition-colors hover:bg-white/5"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-600 shadow-[0_0_6px_rgba(227,27,55,0.8)]" />
        </button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-white/70 hover:text-white/90 transition-colors hover:bg-white/5">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #E31B37, #c0152d)' }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[0.78rem] font-semibold text-white/85 leading-tight">{userName}</div>
                <div className="text-[0.65rem] text-white/40 leading-tight capitalize">{ROLE_LABELS[currentRole]}</div>
              </div>
              <CaretDown className="h-3 w-3 text-white/30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ background: '#1B1E23', border: '1px solid rgba(192,195,199,0.10)' }}>
            <div className="px-3 py-2 text-xs text-white/40">
              {ROLE_LABELS[currentRole]} · {authMode}
            </div>
            <DropdownMenuSeparator className="bg-white/8" />
            {allowRoleSwitching && Object.entries(ROLE_LABELS).map(([role, label]) => (
              <DropdownMenuItem
                key={role}
                onClick={() => onRoleChange(role as AppRole)}
                className={`text-sm text-white/70 hover:bg-white/5 ${currentRole === role ? 'text-red-400' : ''}`}
              >
                {label}
              </DropdownMenuItem>
            ))}
            {allowRoleSwitching && <DropdownMenuSeparator className="bg-white/8" />}
            <DropdownMenuItem onClick={() => void onLogout()} className="text-sm text-white/70 hover:bg-white/5">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

