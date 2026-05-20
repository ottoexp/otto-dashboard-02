import { ProfileDropdown } from '@/components/profile-dropdown'

export function TopNav() {
  return (
    <nav className='border-b bg-background'>
      <div className='flex h-14 items-center px-4'>
        <div className='ml-auto'>
          <ProfileDropdown />
        </div>
      </div>
    </nav>
  )
}
