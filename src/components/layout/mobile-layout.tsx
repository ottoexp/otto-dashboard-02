import { TopNav } from '@/components/layout/top-nav'

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <TopNav />
      <main className='flex-1 p-4 text-base'>
        {children}
      </main>
    </div>
  )
}
