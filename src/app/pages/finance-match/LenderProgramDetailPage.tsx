import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Buildings,
  ArrowLeft,
  SpinnerGap,
  Envelope,
  Phone,
  IdentificationBadge,
} from '@phosphor-icons/react'
import { useLenders, useLenderPrograms } from '@/domains/finance-match/finance-match.hooks'
import { useRouter } from '@/app/router'

export function LenderProgramDetailPage() {
  const { navigate, currentPath } = useRouter()
  const lenderId = currentPath.split('/').pop() ?? ''
  const { lenders, loading: lendersLoading } = useLenders()
  const { programs, loading: programsLoading } = useLenderPrograms(lenderId)

  const lender = lenders.find((l) => l.id === lenderId)
  const loading = lendersLoading || programsLoading

  if (loading && !lender) {
    return (
      <div className="ods-page flex items-center gap-2 text-muted-foreground">
        <SpinnerGap className="h-5 w-5 animate-spin" /> Loading…
      </div>
    )
  }

  if (!lender) {
    return (
      <div className="ods-page space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance/program-library')} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-muted-foreground">Lender not found.</div>
      </div>
    )
  }

  return (
    <div className="ods-page space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance/program-library')} className="gap-1.5 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Button>
      </div>

      {/* Lender Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Buildings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{lender.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{lender.lenderType.replace('_', ' ')}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={lender.isActive
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'}
        >
          {lender.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Lender Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {lender.phone && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Phone className="h-3.5 w-3.5" /> Phone
            </div>
            <div className="text-sm font-medium">{lender.phone}</div>
          </Card>
        )}
        {lender.website && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Envelope className="h-3.5 w-3.5" /> Website
            </div>
            <div className="text-sm font-medium truncate">{lender.website}</div>
          </Card>
        )}
        {lender.portalUrl && (
          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <IdentificationBadge className="h-3.5 w-3.5" /> Dealer Portal
            </div>
            <div className="text-sm font-medium truncate">{lender.portalUrl}</div>
          </Card>
        )}
      </div>

      <Separator />

      {/* Programs */}
      <div>
        <h2 className="text-base font-semibold mb-3">Programs</h2>
        {programsLoading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <SpinnerGap className="h-4 w-4 animate-spin" /> Loading programs…
          </div>
        ) : programs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No programs found for this lender.
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => (
              <Card key={program.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm">{program.programName}</CardTitle>
                    <Badge
                      variant="outline"
                      className={program.isActive
                        ? 'text-xs bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'text-xs bg-gray-100 text-gray-600 border-gray-200'}
                    >
                      {program.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {program.description && (
                    <p className="text-xs text-muted-foreground">{program.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {program.programCode && (
                      <div><span className="font-medium">Code:</span> {program.programCode}</div>
                    )}
                    {program.targetTier && (
                      <div><span className="font-medium">Target Tier:</span> {program.targetTier}</div>
                    )}
                    <div><span className="font-medium">Created:</span> {new Date(program.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

