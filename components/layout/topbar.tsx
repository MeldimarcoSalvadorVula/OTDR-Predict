'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { Dialog } from '@base-ui/react/dialog'
import { Menu, RotateCw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFibers, useMeta } from '@/lib/api/hooks'
import { formatDate } from '@/lib/formatters'
import { NAV_ITEMS, SidebarContent, isActivePath } from './sidebar'

function usePageTitle() {
  const pathname = usePathname()
  const fiberMatch = pathname.match(/^\/fibers\/([^/]+)/)
  if (fiberMatch) return { section: 'Optical Fibers', page: decodeURIComponent(fiberMatch[1]) }
  const item = NAV_ITEMS.find((nav) => isActivePath(pathname, nav.href))
  return { section: null, page: item?.label ?? 'OTDR Predict' }
}

const ENV_STYLE = {
  simulated: { label: 'Simulated', className: 'border-risk-medium/30 bg-risk-medium/10 text-risk-medium' },
  real: { label: 'Real data', className: 'border-risk-low/30 bg-risk-low/10 text-risk-low' },
  unverified: { label: 'Unverified', className: 'border-risk-failed/30 bg-risk-failed/10 text-risk-failed' },
} as const

export function Topbar() {
  const { section, page } = usePageTitle()
  const { data: meta, error: metaError, isLoading: metaLoading } = useMeta()
  const { data: fibers } = useFibers()
  const { mutate } = useSWRConfig()
  const [refreshing, setRefreshing] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const asOf = meta?.asOf ?? fibers?.asOf ?? null
  const env = metaError ? 'unverified' : meta?.environment
  const status = metaError ? 'error' : meta ? 'ok' : 'loading'

  async function refresh() {
    if (refreshing) return
    setRefreshing(true)
    try {
      await mutate(() => true)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Trigger
          aria-label="Open navigation"
          className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="size-4" aria-hidden />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface transition-transform duration-200 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Close
              aria-label="Close navigation"
              className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-2 text-sm">
          {section && (
            <>
              <li className="hidden text-muted-foreground sm:block">{section}</li>
              <li aria-hidden className="hidden text-muted-foreground/50 sm:block">/</li>
            </>
          )}
          <li className={cn('truncate font-medium', section && 'font-mono')} aria-current="page">{page}</li>
        </ol>
      </nav>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs md:flex">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Data as of</span>
          <span className="font-medium tabular">{asOf ? formatDate(asOf) : metaLoading ? '…' : 'Unavailable'}</span>
        </div>

        {env && (
          <span className={cn('hidden rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wider sm:inline-flex', ENV_STYLE[env].className)}>
            {ENV_STYLE[env].label}
          </span>
        )}

        <span className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground" role="status">
          <span
            aria-hidden
            className={cn('size-2 rounded-full', status === 'ok' && 'bg-risk-low', status === 'error' && 'bg-risk-failed', status === 'loading' && 'animate-pulse bg-muted-foreground')}
          />
          <span className="hidden xl:inline">{status === 'ok' ? 'API online' : status === 'error' ? 'API offline' : 'Connecting'}</span>
          <span className="sr-only xl:hidden">{status === 'ok' ? 'API online' : status === 'error' ? 'API offline' : 'Connecting'}</span>
        </span>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
        >
          <RotateCw className={cn('size-3.5', refreshing && 'animate-spin')} aria-hidden />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing' : 'Refresh'}</span>
          <span className="sr-only sm:hidden">Refresh data</span>
        </button>
      </div>
    </header>
  )
}
