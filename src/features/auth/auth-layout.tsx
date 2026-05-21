import { Layers } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 py-8 sm:w-[440px] sm:p-8'>
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
