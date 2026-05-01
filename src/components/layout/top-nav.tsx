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
import { TeamSwitcherSimple } from './team-switcher-simple'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ChevronDown, Menu } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export function TopNav() {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Left - Logo & Team Switcher */}
        <div className="flex items-center gap-4">
          <TeamSwitcherSimple teams={sidebarData.teams} />
        </div>

        {/* Center - Navigation Menu (Desktop) */}
        {!isMobile && (
          <div className="flex items-center gap-1 flex-1">
            {sidebarData.navGroups.map((group) =>
              group.items.map((item) => {
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
                        {item.items.map((subItem) => (
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
                  >
                    <Link to={item.url}>{item.title}</Link>
                  </Button>
                )
              })
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
                  group.items.map((item) => {
                    if (item.items) {
                      return (
                        <div key={item.title} className="space-y-1">
                          <p className="text-sm font-semibold px-2">{item.title}</p>
                          {item.items.map((subItem) => (
                            <Button
                              key={subItem.title}
                              variant="ghost"
                              className="w-full justify-start"
                              asChild
                              onClick={() => setMobileMenuOpen(false)}
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
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={item.url}>{item.title}</Link>
                      </Button>
                    )
                  })
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Right - Theme, Settings, Profile */}
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  )
}
