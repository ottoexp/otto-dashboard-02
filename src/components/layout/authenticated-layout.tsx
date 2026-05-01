import { Outlet } from '@tanstack/react-router'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { TopNav } from '@/components/layout/top-nav'
import { SkipToMain } from '@/components/skip-to-main'
import { cn } from '@/lib/utils'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SearchProvider>
      <LayoutProvider>
        <SkipToMain />
        <TopNav />
        <main
          className={cn(
            // Set content container
            '@container/content',
            // Set min height for content
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
