import { useEffect, useState } from 'react'
import { ShieldCheck, LockKey, ArrowRight } from '@phosphor-icons/react'
import { useRouter } from '@/app/router'
import { useAuth } from '@/domains/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const { navigate } = useRouter()
  const { status, signInWithPassword, mode, error } = useAuth()
  const [email, setEmail] = useState('manager@outcome.local')
  const [password, setPassword] = useState('password123')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    const returnTo = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('outcome.auth.returnTo')
      : null

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('outcome.auth.returnTo')
    }

    navigate(returnTo || '/app/dashboard')
  }, [navigate, status])

  async function handleSubmit() {
    setSubmitting(true)
    setLocalError(null)

    try {
      await signInWithPassword(email, password)
    } catch (submitError) {
      setLocalError(submitError instanceof Error ? submitError.message : 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,1)_0%,rgba(3,7,18,1)_100%)] text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <section className="flex flex-col justify-between rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80">Vehicle Vault Internal Access</p>
            <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold tracking-tight text-white lg:text-6xl">
              Secure access for the internal operating system.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
              Public shoppers can browse inventory without logging in. Staff members sign in here to manage deals,
              inventory, CRM workflows, and operational surfaces.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">Protected Routes</p>
              <p className="mt-2 text-sm text-slate-400">Everything under /app is now gated behind authenticated access.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">Supabase Ready</p>
              <p className="mt-2 text-sm text-slate-400">Email/password login and persisted sessions activate automatically when env vars are present.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm font-semibold text-white">Public Stays Public</p>
              <p className="mt-2 text-sm text-slate-400">The storefront, inventory listings, and vehicle details remain openly accessible.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md border-white/10 bg-slate-950/80 text-slate-50 shadow-2xl shadow-sky-950/40">
            <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                <ShieldCheck size={26} />
              </div>
              <CardTitle className="text-2xl">Staff Login</CardTitle>
              <p className="text-sm text-slate-400">
                {mode === 'supabase'
                  ? 'Use your Supabase staff credentials.'
                  : 'Supabase is not configured yet. Use demo credentials to access the protected app locally.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="bg-slate-950/60" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="bg-slate-950/60" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <LockKey size={18} className="mt-0.5 text-sky-300" />
                  <div>
                    <p className="font-medium text-white">Runtime mode: {mode}</p>
                    <p className="mt-1">
                      {mode === 'supabase'
                        ? 'Sessions persist through Supabase auth and route protection is enforced for private pages.'
                        : 'This environment uses a safe local fallback until Supabase credentials are added.'}
                    </p>
                  </div>
                </div>
              </div>

              {(localError || error) && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {localError || error}
                </div>
              )}

              <Button onClick={() => void handleSubmit()} disabled={submitting} className="w-full gap-2">
                {submitting ? 'Signing in…' : 'Access Internal OS'}
                {!submitting && <ArrowRight size={16} />}
              </Button>

              <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-slate-300">
                Return to Public Site
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}