import { FileX } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface RecordNotFoundProps {
  entityType: string
  onGoBack: () => void
}

export function RecordNotFound({ entityType, onGoBack }: RecordNotFoundProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24">
      <div className="rounded-full bg-muted p-6">
        <FileX className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{entityType} Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The {entityType.toLowerCase()} you're looking for doesn't exist or may have been removed.
        </p>
      </div>
      <Button variant="outline" onClick={onGoBack}>
        Go Back
      </Button>
    </div>
  )
}
