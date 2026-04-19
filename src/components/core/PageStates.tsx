import { SpinnerGap, WarningCircle, Question, Compass } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

interface BaseStateProps {
  title: string
  message?: string
  className?: string
}

function StateFrame({ title, message, className, icon }: BaseStateProps & { icon: ReactNode }) {
  return (
    <div className={`ods-state-frame mx-auto flex max-w-2xl flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className || ''}`}>
      {icon}
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {message ? <p className="max-w-lg text-sm text-muted-foreground">{message}</p> : null}
    </div>
  )
}

export function PageLoadingState({ title = 'Loading...', message = 'Preparing data for this page.' }: Partial<BaseStateProps>) {
  return (
    <StateFrame
      title={title}
      message={message}
      icon={<SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />}
    />
  )
}

export function PageEmptyState({ title, message, className }: BaseStateProps) {
  return (
    <StateFrame
      title={title}
      message={message}
      className={className}
      icon={<Question className="h-8 w-8 text-muted-foreground" />}
    />
  )
}

export function PageErrorState({ title, message, className }: BaseStateProps) {
  return (
    <StateFrame
      title={title}
      message={message}
      className={className}
      icon={<WarningCircle className="h-8 w-8 text-rose-500" />}
    />
  )
}

export function PageNotFoundState({ title, message, className }: BaseStateProps) {
  return (
    <StateFrame
      title={title}
      message={message}
      className={className}
      icon={<Compass className="h-8 w-8 text-muted-foreground" />}
    />
  )
}
