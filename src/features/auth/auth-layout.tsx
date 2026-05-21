import { Layers } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='min-h-svh flex justify-center pt-12 px-4'>
      <div className='flex w-full flex-col space-y-6 sm:w-[440px]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
            <Layers size={26} />
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>ATA System</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
