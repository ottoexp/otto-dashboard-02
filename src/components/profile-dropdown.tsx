import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useTheme } from '@/context/theme-provider'
import {
  Check, Moon, Sun, Monitor, Palette,
  Users, Package2, User, Settings,
  ClipboardList, GitBranch, CalendarCheck,
  ImagePlus, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const MENU_PHOTO_KEY = 'otto_menu_photo'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore().auth
  const fileRef = useRef<HTMLInputElement>(null)

  const savedPhoto = localStorage.getItem(MENU_PHOTO_KEY) || ''

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem(MENU_PHOTO_KEY, reader.result as string)
      window.dispatchEvent(new Event('menu-photo-changed'))
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handlePhotoChange} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='flex items-center gap-1.5 px-2 h-9'>
            {savedPhoto && (
              <Avatar className='h-6 w-6'>
                <AvatarImage src={savedPhoto} />
                <AvatarFallback>{user?.name?.slice(0, 1) || 'U'}</AvatarFallback>
              </Avatar>
            )}
            <div className='text-left leading-tight'>
              <p className='text-sm font-semibold'>{user?.name || 'Menu'}</p>
              {user?.cabang && (
                <p className='text-xs text-muted-foreground capitalize'>{user.cabang}</p>
              )}
            </div>
            <ChevronDown size={14} className='text-muted-foreground ml-0.5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-52' align='start' forceMount>
          {/* Setting sejajar Order/Flow — 1 spasi indent via pl */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings className='mr-2 h-4 w-4' />
              Setting
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className='w-48'>
              <DropdownMenuItem asChild>
                <Link to='/operational/people'>
                  <Users className='mr-2 h-4 w-4' />
                  Personnel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/operational/inventory'>
                  <Package2 className='mr-2 h-4 w-4' />
                  Inventory
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/operational/customer'>
                  <User className='mr-2 h-4 w-4' />
                  Customer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/controller/admin'>
                  <Settings className='mr-2 h-4 w-4' />
                  Admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Theme */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className='mr-2 h-4 w-4' />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className='mr-2 h-4 w-4' />
                    Light
                    <Check size={13} className={cn('ml-auto', theme !== 'light' && 'hidden')} />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className='mr-2 h-4 w-4' />
                    Dark
                    <Check size={13} className={cn('ml-auto', theme !== 'dark' && 'hidden')} />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className='mr-2 h-4 w-4' />
                    System
                    <Check size={13} className={cn('ml-auto', theme !== 'system' && 'hidden')} />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                    <ImagePlus className='mr-2 h-4 w-4' />
                    Ganti Foto Menu
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem asChild>
            <Link to='/operational/spk'>
              <ClipboardList className='mr-2 h-4 w-4' />
              Order
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/operational/scheduling'>
              <GitBranch className='mr-2 h-4 w-4' />
              Flow
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to='/controller/attendance'>
              <CalendarCheck className='mr-2 h-4 w-4' />
              Attendance
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
