'use client'

import { RotateCw, WifiOff, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_BASE_URL, ApiError } from '@/lib/api/client'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-elevated/70', className)} aria-hidden />
}

export function SignalLoader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="relative h-px w-40 overflow-hidden bg-border">
        <div className="animate-signal absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-1 max-w-sm text-pretty text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

export function ErrorState({ error, onRetry, title, compact }: { error: unknown; onRetry?: () => void; title?: string; compact?: boolean }) {
  const isNetwork = error instanceof ApiError && error.status === null
  const isNotFound = error instanceof ApiError && error.status === 404
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'

  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center gap-3 text-center', compact ? 'px-4 py-8' : 'px-6 py-14')}>
      <div className="flex size-10 items-center justify-center rounded-full border border-risk-failed/30 bg-risk-failed/10 text-risk-failed">
        <WifiOff className="size-4" aria-hidden />
      </div>
      <div className="max-w-md">
        <p className="text-sm font-medium">{title ?? (isNotFound ? 'Resource not found' : isNetwork ? 'API unreachable' : 'Request failed')}</p>
        <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">{message}</p>
        {isNetwork && (
          <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
            Confirm the backend is running at <code className="font-mono text-foreground">{API_BASE_URL}</code> and that CORS allows this origin.
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-elevated px-3 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
        >
          <RotateCw className="size-3.5" aria-hidden />
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground">
        <Inbox className="size-4" aria-hidden />
      </div>
      <div className="max-w-md">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export const FIRST_LOAD_HINT =
  'The first request can take a few seconds while the backend builds its database and computes risk across the fiber dataset.'
