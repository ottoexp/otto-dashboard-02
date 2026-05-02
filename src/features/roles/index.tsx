
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useRolesQuery, useDeleteRoleMutation } from './data/roles-query'
import { RoleDialogs } from './components/role-dialogs'
import { RoleProvider, useRoleContext } from './components/role-provider'
import { Loader2 } from 'lucide-react'
import type { Role } from '@/lib/api'

function RolesContent() {
  const { data: roles, isLoading, error } = useRolesQuery()
  const deleteRole = useDeleteRoleMutation()
  const { setOpen, setCurrentRole } = useRoleContext()

  const handleEdit = (role: Role) => {
    setCurrentRole(role)
    setOpen('edit')
  }

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      toast.error('Cannot delete system roles')
      return
    }
    
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        await deleteRole.mutateAsync(role.id)
        toast.success('Role deleted successfully')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete role'
        toast.error(message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-destructive'>Error loading roles: {error.message}</p>
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
          <p className='text-muted-foreground'>
            Manage user roles and their permissions.
          </p>
        </div>
        <Button onClick={() => setOpen('add')}>
          <Plus className='mr-2 h-4 w-4' />
          Add Role
        </Button>
      </div>

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.length ? (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      <Shield className='h-4 w-4 text-muted-foreground' />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant='secondary'>System</Badge>
                    ) : (
                      <Badge variant='outline'>Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleEdit(role)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDelete(role)}
                          disabled={deleteRole.isPending}
                        >
                          <Trash2 className='h-4 w-4 text-destructive' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RoleDialogs />
    </>
  )
}

export function Roles() {
  return (
    <RoleProvider>
      <RolesContent />
      <RoleDialogs />
    </RoleProvider>
  )
}
