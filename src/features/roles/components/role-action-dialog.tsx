import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Role } from '@/lib/api'
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  usePermissionsQuery,
} from '../data/roles-query'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()),
})

type RoleForm = z.infer<typeof formSchema>

type RoleActionDialogProps = {
  currentRole?: Role
  open: boolean
  onOpenChange: () => void
}

export function RoleActionDialog({
  currentRole,
  open,
  onOpenChange,
}: RoleActionDialogProps) {
  const isEdit = !!currentRole
  const createRole = useCreateRoleMutation()
  const updateRole = useUpdateRoleMutation()
  const { data: permissions, isLoading: permissionsLoading } = usePermissionsQuery()

  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentRole?.name || '',
      description: currentRole?.description || '',
      permissionIds: [],
    },
  })

  // Reset form when dialog opens with current role data
  React.useEffect(() => {
    if (open && currentRole) {
      form.reset({
        name: currentRole.name,
        description: currentRole?.description || '',
        permissionIds: [], // Will be populated from role data
      })
    }
  }, [open, currentRole, form])

  const onSubmit = async (values: RoleForm) => {
    try {
      if (isEdit && currentRole) {
        await updateRole.mutateAsync({
          id: currentRole.id,
          payload: {
            name: values.name,
            description: values.description,
            permissionIds: values.permissionIds,
          },
        })
        toast.success('Role updated successfully')
      } else {
        await createRole.mutateAsync({
          name: values.name,
          description: values.description,
          permissionIds: values.permissionIds,
        })
        toast.success('Role created successfully')
      }
      form.reset()
      onOpenChange()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      toast.error(message)
    }
  }

  const isPending = createRole.isPending || updateRole.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the role details and permissions.'
              : 'Create a new role with specific permissions.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Manager' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe the role...'
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='permissionIds'
              render={() => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  {permissionsLoading ? (
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Loading permissions...
                    </div>
                  ) : (
                    <div className='space-y-2 max-h-60 overflow-y-auto border rounded-md p-4'>
                      {permissions?.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name='permissionIds'
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission.id}
                                className='flex flex-row items-start space-x-3 space-y-0'
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, permission.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== permission.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                  <FormLabel className='text-sm font-normal'>
                                    {permission.name}
                                  </FormLabel>
                                  {permission.description && (
                                    <p className='text-xs text-muted-foreground'>
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onOpenChange}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
