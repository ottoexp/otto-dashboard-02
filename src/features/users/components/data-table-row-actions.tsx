import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Power, PowerOff, Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'
import { useToggleUserStatusMutation } from '../data/users-query'
import { useHasPermission } from '@/hooks/use-permissions'

type DataTableRowActionsProps = {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const toggleStatus = useToggleUserStatusMutation()
  const { hasPermission: canUpdate } = useHasPermission('users', 'update')
  const { hasPermission: canDelete } = useHasPermission('users', 'delete')
  const user = row.original
  const isActive = user.status === 'active'

  const handleToggleStatus = async () => {
    try {
      const updatedUser = await toggleStatus.mutateAsync(user.id)
      toast.success(
        `User ${updatedUser.username} is now ${updatedUser.status}`
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {canUpdate && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original)
                  setOpen('edit')
                }}
              >
                Edit
                <DropdownMenuShortcut>
                  <UserPen size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleStatus}
                disabled={toggleStatus.isPending}
              >
                {isActive ? 'Deactivate' : 'Activate'}
                <DropdownMenuShortcut>
                  {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              {canDelete && <DropdownMenuSeparator />}
            </>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('delete')
              }}
              className='text-red-500!'
            >
              Delete
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
