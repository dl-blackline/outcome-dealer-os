import { Bell, MagnifyingGlass, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppRole, ROLE_LABELS } from '@/domains/roles/roles'
import { AuthRuntimeMode } from '@/domains/auth'

interface TopbarProps {
  currentRole: AppRole
  userName: string
  allowRoleSwitching: boolean
  authMode: AuthRuntimeMode
  onRoleChange: (role: AppRole) => void
  onLogout: () => Promise<void>
  onCommandPaletteOpen: () => void
  onNotificationsOpen: () => void
}

export function Topbar({ currentRole, userName, allowRoleSwitching, authMode, onRoleChange, onLogout, onCommandPaletteOpen, onNotificationsOpen }: TopbarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCommandPaletteOpen}
          className="gap-2 text-muted-foreground"
        >
          <MagnifyingGlass />
          <span className="text-sm">Search</span>
          <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User />
              <span className="text-sm">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {ROLE_LABELS[currentRole]} · {authMode}
            </div>
            {allowRoleSwitching && Object.entries(ROLE_LABELS).map(([role, label]) => (
              <DropdownMenuItem
                key={role}
                onClick={() => onRoleChange(role as AppRole)}
                className={currentRole === role ? 'bg-accent' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
            {allowRoleSwitching && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => void onLogout()}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={onNotificationsOpen}>
          <Bell />
        </Button>
      </div>
    </div>
  )
}
