import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Role } from '@/lib/api'

type RoleDialogType = 'add' | 'edit' | 'delete'

type RoleContextType = {
  open: RoleDialogType | null
  setOpen: (str: RoleDialogType | null) => void
  currentRole: Role | null
  setCurrentRole: React.Dispatch<React.SetStateAction<Role | null>>
}

const RoleContext = React.createContext<RoleContextType | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RoleDialogType>(null)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)

  return (
    <RoleContext value={{ open, setOpen, currentRole, setCurrentRole }}>
      {children}
    </RoleContext>
  )
}

export const useRoleContext = () => {
  const context = React.useContext(RoleContext)
  if (!context) {
    throw new Error('useRoleContext must be used within <RoleProvider>')
  }
  return context
}
