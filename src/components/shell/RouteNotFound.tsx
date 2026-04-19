import { Compass, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface RouteNotFoundProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction: () => void
}

export function RouteNotFound({
  title = 'Page Not Found',
  message = 'The page you requested is unavailable or the link is outdated.',
  actionLabel = 'Go Back',
  onAction,
}: RouteNotFoundProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 rounded-3xl border border-white/15 bg-black/25 px-6 py-14 text-center">
      <Compass size={44} className="text-slate-400" weight="duotone" />
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="max-w-lg text-sm text-slate-300">{message}</p>
      <Button
        variant="outline"
        onClick={onAction}
        className="vault-btn-muted rounded-full px-6 text-xs uppercase tracking-[0.14em]"
      >
        <ArrowLeft size={14} className="mr-1.5" />
        {actionLabel}
      </Button>
    </div>
  )
}