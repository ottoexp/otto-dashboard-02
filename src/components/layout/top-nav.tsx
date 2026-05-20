import { useEffect, useState } from 'react'
import { ProfileDropdown } from '@/components/profile-dropdown'

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const date = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className='text-sm text-muted-foreground leading-tight'>
      <span className='font-medium text-foreground'>{time}</span>
      <span className='ml-2 hidden sm:inline'>{date}</span>
    </div>
  )
}

export function TopNav() {
  return (
    <nav className='border-b bg-background'>
      <div className='flex h-14 items-center px-4 gap-3'>
        <ProfileDropdown />
        <Clock />
      </div>
    </nav>
  )
}
