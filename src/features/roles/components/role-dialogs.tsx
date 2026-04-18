import { useRoleContext } from './role-provider'
import { RoleActionDialog } from './role-action-dialog'

export function RoleDialogs() {
  const { open, setOpen, currentRole } = useRoleContext()

  return (
    <>
      <RoleActionDialog
        key='role-add'
        open={open === 'add'}
        onOpenChange={() => setOpen(null)}
      />
      <RoleActionDialog
        key='role-edit'
        currentRole={currentRole || undefined}
        open={open === 'edit'}
        onOpenChange={() => setOpen(null)}
      />
    </>
  )
}
