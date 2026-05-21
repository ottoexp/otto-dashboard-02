import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  ClipboardList, GitBranch, Settings,
  LogOut, Users, Package2, User,
  Settings2, Palette, ChevronLeft, Camera,
  type LucideIcon,
} from 'lucide-react'

const MOBILE_PHOTO_KEY = 'otto_mobile_photo'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])
  return now
}

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
  const [photo, setPhoto] = useState<string>(() => localStorage.getItem(MOBILE_PHOTO_KEY) || '')
  const now = useClock()
  const fileRef = useRef<HTMLInputElement>(null)
  const isHome = location.pathname === '/'

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      localStorage.setItem(MOBILE_PHOTO_KEY, url)
      setPhoto(url)
    }
    reader.readAsDataURL(file)
  }

  if (!isHome) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='bg-white border-b px-4 py-3 sticky top-0 z-10 flex items-center gap-3'>
          <button
            onClick={() => history.back()}
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
      <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handlePhotoChange} />
      {/* Header */}
      <div className='bg-white border-b px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {showSetting && (
            <button onClick={() => setShowSetting(false)} className='text-blue-500'>
              <ChevronLeft size={22} />
            </button>
          )}
          {/* Avatar photo */}
          <button onClick={() => fileRef.current?.click()} className='relative shrink-0'>
            {photo ? (
              <img src={photo} className='h-11 w-11 rounded-full object-cover border-2 border-gray-200' alt='foto' />
            ) : (
              <div className='h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-400'>
                <Camera size={18} />
              </div>
            )}
          </button>
          {/* Name & cabang */}
          <div>
            <p className='text-base font-bold leading-tight'>{auth.user?.name || '—'}</p>
            <p className='text-xs text-gray-500 capitalize'>{auth.user?.cabang || ''}</p>
          </div>
        </div>
        {/* Clock */}
        <div className='text-right'>
          <p className='text-base font-bold leading-tight'>
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className='text-xs text-gray-500'>
            {now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
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
