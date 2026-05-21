import { UserAuthForm } from './components/user-auth-form'
import { Layers } from 'lucide-react'

export function SignIn2() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-background px-4'>
      <div className='w-full max-w-sm space-y-6'>
        {/* Logo + Title */}
        <div className='flex flex-col items-center gap-2'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
            <Layers size={26} />
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>ATA System</h1>
        </div>

        {/* Form */}
        <UserAuthForm />
      </div>
    </div>
  )
}
