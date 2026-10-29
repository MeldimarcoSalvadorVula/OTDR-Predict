'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BellRing, BookOpenText, Cable, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '@/lib/api/client'
import { useMeta } from '@/lib/api/hooks'
import { BrandMark } from './brand-mark'

export const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/fibers', label: 'Optical Fibers', icon: Cable },
  { href: '/alerts', label: 'Alerts', icon: BellRing },
  { href: '/methodology', label: 'Methodology', icon: BookOpenText },
] as const

export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: meta, error } = useMeta()
  const host = API_BASE_URL.replace(/^https?:\/\//, '')

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center gap-3 border-b border-border px-4', collapsed && 'justify-center px-0')}>
        <BrandMark className="size-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold tracking-tight">OTDR Predict</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Optical Intelligence</p>
          </div>
        )}
      </div>

      <nav aria-label="Primary" className="flex-1 px-3 py-4">
        {!collapsed && <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">Workspace</p>}
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors',
                    collapsed && 'justify-center px-0',
                    active ? 'bg-elevated text-foreground' : 'text-muted-foreground hover:bg-elevated/50 hover:text-foreground',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity',
                      active ? 'opacity-100 shadow-[0_0_10px_var(--primary)]' : 'opacity-0',
                    )}
                  />
                  <Icon className={cn('size-4 shrink-0', active && 'text-primary')} aria-hidden />
                  {collapsed ? <span className="sr-only">{label}</span> : label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn('border-t border-border p-4', collapsed && 'flex justify-center px-0')}>
        {collapsed ? (
          <span
            className={cn('size-2 rounded-full', error ? 'bg-risk-failed' : meta ? 'bg-risk-low' : 'bg-muted-foreground')}
            title={error ? 'API unreachable' : meta ? 'API connected' : 'Connecting'}
          />
        ) : (
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">API</dt>
              <dd className="flex items-center gap-1.5">
                <span className={cn('size-1.5 rounded-full', error ? 'bg-risk-failed' : meta ? 'bg-risk-low' : 'bg-muted-foreground')} aria-hidden />
                {error ? 'Unreachable' : meta ? 'Connected' : 'Connecting'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Endpoint</dt>
              <dd className="truncate font-mono text-[11px]" title={API_BASE_URL}>{host}</dd>
            </div>
            {meta?.dataSource && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Data source</dt>
                <dd className="font-mono text-[11px]">{meta.dataSource}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  )
}

export function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out lg:flex',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <SidebarContent collapsed={collapsed} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-20 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-primary"
      >
        {collapsed ? <PanelLeftOpen className="size-3.5" aria-hidden /> : <PanelLeftClose className="size-3.5" aria-hidden />}
      </button>
    </aside>
  )
}
