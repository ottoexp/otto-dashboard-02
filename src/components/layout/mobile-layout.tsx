import { useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  ClipboardList, GitBranch, Settings,
  LogOut, Users, Package2, User,
  Settings2, Palette, ChevronLeft,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  title: string
  url?: string
  icon: LucideIcon
  color: string
  action?: () => void
}

const SETTING_ITEMS: NavItem[] = [
  { title: 'Personnel', url: '/operational/people',    icon: Users,     color: 'bg-pink-500' },
  { title: 'Inventory', url: '/operational/inventory', icon: Package2,  color: 'bg-yellow-500' },
  { title: 'Customer',  url: '/operational/customer',  icon: User,      color: 'bg-orange-500' },
  { title: 'Admin',     url: '/controller/admin',       icon: Settings2, color: 'bg-gray-600' },
  { title: 'Theme',     url: '/settings',               icon: Palette,   color: 'bg-indigo-500' },
]

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()
  const [showSetting, setShowSetting] = useState(false)
  const isHome = location.pathname === '/'

  if (!isHome) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='bg-white border-b px-4 py-3 sticky top-0 z-10 flex items-center gap-3'>
          <button
            onClick={() => navigate({ to: '/' })}
            className='text-blue-500 font-semibold text-base'
          >
            ← Menu
          </button>
        </div>
        <div className='flex-1 p-4 text-base'>
          {children}
        </div>
      </div>
    )
  }

  const mainItems: NavItem[] = [
    {
      title: 'Setting',
      icon: Settings,
      color: 'bg-slate-600',
      action: () => setShowSetting(true),
    },
    { title: 'Order', url: '/operational/spk',        icon: ClipboardList, color: 'bg-blue-500' },
    { title: 'Flow',  url: '/operational/scheduling',  icon: GitBranch,     color: 'bg-purple-500' },
    { title: 'Admin', url: '/controller/admin',         icon: Settings2,     color: 'bg-gray-500' },
  ]

  const items = showSetting ? SETTING_ITEMS : mainItems

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header */}
      <div className='bg-white border-b px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {showSetting && (
            <button onClick={() => setShowSetting(false)} className='text-blue-500 mr-1'>
              <ChevronLeft size={22} />
            </button>
          )}
          <div>
            <p className='text-lg font-bold'>{showSetting ? 'Setting' : 'Menu'}</p>
            <p className='text-xs text-gray-500'>{auth.user?.name} · {auth.user?.cabang}</p>
          </div>
        </div>
        <button
          onClick={() => { auth.reset(); navigate({ to: '/sign-in' }) }}
          className='flex items-center gap-1 text-gray-500 text-sm'
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>

      {/* Grid */}
      <div className='flex-1 p-4'>
        <div className='grid grid-cols-2 gap-4'>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.title}
                onClick={() => {
                  if (item.action) { item.action(); return }
                  if (item.url) navigate({ to: item.url })
                }}
                className={`${item.color} rounded-2xl p-6 flex flex-col items-center gap-3 text-white shadow-md active:scale-95 transition-transform`}
              >
                <Icon size={40} strokeWidth={1.5} />
                <span className='text-xl font-bold'>{item.title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
