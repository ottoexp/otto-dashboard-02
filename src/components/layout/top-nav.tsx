import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { sidebarData } from './data/sidebar-data'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ChevronDown, Menu } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHasPermission } from '@/hooks/use-permissions'

function NavItem({ item, onClose }: { item: any; onClose?: () => void }) {
  const { hasPermission, isLoading } = item.permission
    ? useHasPermission(item.permission.resource, item.permission.action)
    : { hasPermission: true, isLoading: false }

  if (isLoading) return null
  if (!hasPermission) return null

  if (item.items) {
    return (
      <DropdownMenu key={item.title}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-1">
            {item.title}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {item.items.map((subItem: any) => (
            <DropdownMenuItem key={subItem.title} asChild>
              <Link to={subItem.url} className="cursor-pointer">
                {subItem.title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      key={item.title}
      variant="ghost"
      asChild
      disabled={item.disabled}
      onClick={onClose}
    >
      <Link to={item.url}>{item.title}</Link>
    </Button>
  )
}

function MobileNavItem({ item, onClose }: { item: any; onClose: () => void }) {
  const { hasPermission, isLoading } = item.permission
    ? useHasPermission(item.permission.resource, item.permission.action)
    : { hasPermission: true, isLoading: false }

  if (isLoading) return null
  if (!hasPermission) return null

  if (item.items) {
    return (
      <div key={item.title} className="space-y-1">
        <p className="text-sm font-semibold px-2">{item.title}</p>
        {item.items.map((subItem: any) => (
          <Button
            key={subItem.title}
            variant="ghost"
            className="w-full justify-start"
            asChild
            onClick={onClose}
          >
            <Link to={subItem.url}>{subItem.title}</Link>
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Button
      key={item.title}
      variant="ghost"
      className="w-full justify-start"
      asChild
      disabled={item.disabled}
      onClick={onClose}
    >
      <Link to={item.url}>{item.title}</Link>
    </Button>
  )
}

export function TopNav() {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Center - Navigation Menu (Desktop) */}
        {!isMobile && (
          <div className="flex items-center gap-1 flex-1">
            {sidebarData.navGroups.map((group) =>
              group.items.map((item) => (
                <NavItem key={item.title} item={item} />
              ))
            )}
          </div>
        )}

        {/* Mobile - Hamburger Menu */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-4">
                {sidebarData.navGroups.map((group) =>
                  group.items.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      item={item}
                      onClose={() => setMobileMenuOpen(false)}
                    />
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Right - Profile Only */}
        <div className="ml-auto">
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  )
}
