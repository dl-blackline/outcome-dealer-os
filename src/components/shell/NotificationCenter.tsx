import { Bell } from '@phosphor-icons/react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell />
            Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          No new notifications
        </div>
      </SheetContent>
    </Sheet>
  )
}
