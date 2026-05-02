import { Outlet } from '@tanstack/react-router'
import { Monitor, Bell, Palette, Wrench, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLocation } from '@tanstack/react-router'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  },
  {
    title: 'Display',
    href: '/settings/display',
    icon: <Monitor size={18} />,
  },
]

export function Settings() {
  const location = useLocation()

  return (
    <>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
          Settings
        </h1>
        <p className='text-muted-foreground'>
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className='my-4 lg:my-6' />
      <div className='flex flex-col space-y-2 lg:space-y-0'>
        <nav className='flex gap-2 overflow-x-auto pb-2'>
          {sidebarNavItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'default' : 'ghost'}
              size='sm'
              asChild
            >
              <a href={item.href} className='flex items-center gap-2'>
                {item.icon}
                {item.title}
              </a>
            </Button>
          ))}
        </nav>
        <div className='flex w-full p-1'>
          <Outlet />
        </div>
      </div>
    </>
  )
}
