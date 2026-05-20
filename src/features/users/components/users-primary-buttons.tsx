import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'
import { useHasPermission } from '@/hooks/use-permissions'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const { hasPermission: canCreate } = useHasPermission('users', 'create')

  if (!canCreate) return null

  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <UserPlus size={16} />
      <span>Add</span>
    </Button>
  )
}
