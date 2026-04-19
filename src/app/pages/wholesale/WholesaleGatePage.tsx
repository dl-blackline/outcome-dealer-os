import { useState } from 'react'
import { ShieldCheck, LockKey, WarningCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { grantWholesaleAccess } from '@/domains/wholesale/wholesaleAccess'

interface WholesaleGatePageProps {
  onAccessGranted: () => void
}

export function WholesaleGatePage({ onAccessGranted }: WholesaleGatePageProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleUnlock() {
    setSubmitting(true)
    setError(null)

    const result = grantWholesaleAccess(password)
    if (!result.ok) {
      setError(result.error || 'Unable to grant wholesale access.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onAccessGranted()
  }

  return (
    <div className="ods-buyer-page mx-auto flex max-w-2xl items-center px-3 pb-24 pt-8 sm:px-4 lg:px-6">
      <Card className="vault-panel vault-edge w-full rounded-3xl border-white/20 bg-black/35">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-blue-200/30 bg-blue-300/15">
            <ShieldCheck size={28} className="text-blue-100" />
          </div>
          <CardTitle className="text-2xl text-white">Wholesale Access Inventory</CardTitle>
          <p className="text-sm text-slate-300">
            Enter the wholesale password to unlock dealer pricing and protected unit visibility.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.13em] text-slate-400">Wholesale Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              className="h-11 border-white/20 bg-white/5 text-slate-100 placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUnlock()
              }}
            />
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-200">
              <WarningCircle size={16} />
              {error}
            </div>
          ) : null}

          <Button
            onClick={handleUnlock}
            disabled={submitting || password.trim().length === 0}
            className="vault-btn w-full gap-2 rounded-full text-xs uppercase tracking-[0.14em]"
          >
            <LockKey size={16} />
            {submitting ? 'Unlocking...' : 'Unlock Wholesale View'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
