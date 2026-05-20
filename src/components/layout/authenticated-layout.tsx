import { Outlet } from '@tanstack/react-router'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { TopNav } from '@/components/layout/top-nav'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { SkipToMain } from '@/components/skip-to-main'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { auth } = useAuthStore()

  if (auth.layout === 'mobile') {
    return <MobileLayout>{children ?? <Outlet />}</MobileLayout>
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SkipToMain />
        <TopNav />
        <main
          className={cn(
            '@container/content',
            'min-h-[calc(100svh-4rem)]',
            'p-4'
          )}
        >
          {children ?? <Outlet />}
        </main>
      </LayoutProvider>
    </SearchProvider>
  )
}
