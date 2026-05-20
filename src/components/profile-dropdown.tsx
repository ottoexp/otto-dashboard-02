import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore().auth

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-52' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium'>{user?.name || 'User'}</p>
              <p className='text-xs text-muted-foreground'>{user?.cabang ? user.cabang.charAt(0).toUpperCase() + user.cabang.slice(1) : ''}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Setting submenu */}
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
              {/* Theme inside Setting */}
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
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Main navigation */}
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
