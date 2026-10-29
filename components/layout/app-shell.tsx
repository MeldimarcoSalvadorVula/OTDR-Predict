'use client'

import { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DesktopSidebar } from './sidebar'
import { Topbar } from './topbar'
import { EnvironmentBanner } from './environment-banner'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delay={150}>
      <div className="flex min-h-dvh">
        <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main id="main" className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
            <EnvironmentBanner />
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
