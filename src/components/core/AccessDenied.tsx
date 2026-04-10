import { ShieldWarning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface AccessDeniedProps {
  onGoHome: () => void
}

export function AccessDenied({ onGoHome }: AccessDeniedProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      <div className="rounded-full bg-destructive/10 p-6">
        <ShieldWarning className="h-12 w-12 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Your current role does not have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
      </div>
      <Button variant="outline" onClick={onGoHome}>
        Go to Dashboard
      </Button>
    </div>
  )
}
