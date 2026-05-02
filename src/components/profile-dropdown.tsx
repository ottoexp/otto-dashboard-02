import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useTheme } from '@/context/theme-provider'
import { Check, Moon, Sun, Monitor, Palette, Users, CreditCard, Settings, Building } from 'lucide-react'
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
              <AvatarImage src='/avatars/01.png' alt='@shadcn' />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'SN'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>{user?.name || 'User'}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {user?.email || 'user@example.com'}
              </p>
              {user?.cabang && (
                <p className='text-xs leading-none text-muted-foreground'>
                  {user.cabang.charAt(0).toUpperCase() + user.cabang.slice(1)}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Admin Section */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/users'>
                <Users className='mr-2 h-4 w-4' />
                Users
                <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/users/roles'>
                <CreditCard className='mr-2 h-4 w-4' />
                Roles
                <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Settings Section */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                <Settings className='mr-2 h-4 w-4' />
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            
            {/* Theme Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className='mr-2 h-4 w-4' />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className='mr-2 h-4 w-4' />
                  Light
                  <Check
                    size={14}
                    className={cn('ml-auto', theme !== 'light' && 'hidden')}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className='mr-2 h-4 w-4' />
                  Dark
                  <Check
                    size={14}
                    className={cn('ml-auto', theme !== 'dark' && 'hidden')}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className='mr-2 h-4 w-4' />
                  System
                  <Check
                    size={14}
                    className={cn('ml-auto', theme !== 'system' && 'hidden')}
                  />
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuItem asChild>
              <Link to='/settings'>
                <Building className='mr-2 h-4 w-4' />
                Team
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            Sign out
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
