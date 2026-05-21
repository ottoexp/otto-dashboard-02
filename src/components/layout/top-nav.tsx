import { useEffect, useState } from 'react'
import { ProfileDropdown } from '@/components/profile-dropdown'

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const day = now.toLocaleDateString('id-ID', { weekday: 'short' })
  const date = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className='text-sm text-muted-foreground'>
      <span>{day}, {date} </span>
      <span className='font-medium text-foreground'>{time}</span>
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
