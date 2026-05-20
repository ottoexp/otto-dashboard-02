import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  ClipboardList,
  GitBranch,
  CalendarCheck,
  Package2,
  User,
  Users,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  color: string
}

const MENU: NavItem[] = [
  { title: 'Order',      url: '/operational/spk',         icon: ClipboardList, color: 'bg-blue-500' },
  { title: 'Flow',       url: '/operational/scheduling',  icon: GitBranch,     color: 'bg-purple-500' },
  { title: 'Attendance', url: '/controller/attendance',   icon: CalendarCheck, color: 'bg-green-500' },
  { title: 'Customer',   url: '/operational/customer',    icon: User,          color: 'bg-orange-500' },
  { title: 'Inventory',  url: '/operational/inventory',   icon: Package2,      color: 'bg-yellow-500' },
  { title: 'Personnel',  url: '/operational/people',      icon: Users,         color: 'bg-pink-500' },
  { title: 'Admin',      url: '/controller/admin',        icon: Settings,      color: 'bg-gray-500' },
]

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const isHome = window.location.pathname === '/'

  if (isHome) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        {/* Header */}
        <div className='bg-white border-b px-4 py-3 flex items-center justify-between'>
          <div>
            <p className='text-xl font-bold'>Sofa</p>
            <p className='text-sm text-gray-500'>{auth.user?.name || ''} · {auth.user?.cabang || ''}</p>
          </div>
          <button
            onClick={() => { auth.reset(); navigate({ to: '/sign-in' }) }}
            className='flex items-center gap-1 text-gray-500 text-sm'
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>

        {/* Grid menu */}
        <div className='flex-1 p-4'>
          <div className='grid grid-cols-2 gap-4'>
            {MENU.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.url}
                  onClick={() => navigate({ to: item.url })}
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

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header with back button */}
      <div className='bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10'>
        <button
          onClick={() => navigate({ to: '/' })}
          className='text-blue-500 font-semibold text-base'
        >
          ← Menu
        </button>
      </div>
      {/* Content */}
      <div className='flex-1 p-4 text-base'>
        {children}
      </div>
    </div>
  )
}
