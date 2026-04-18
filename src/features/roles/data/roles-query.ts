import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  type CreateRolePayload,
  type UpdateRolePayload,
} from '@/lib/api'

export const rolesKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesKeys.all, 'list'] as const,
  details: () => [...rolesKeys.all, 'detail'] as const,
  detail: (id: string) => [...rolesKeys.details(), id] as const,
  permissions: () => [...rolesKeys.all, 'permissions'] as const,
}

export function useRolesQuery() {
  return useQuery({
    queryKey: rolesKeys.lists(),
    queryFn: () => getRoles(),
  })
}

export function useRoleQuery(id: string) {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => getRole(id),
    enabled: !!id,
  })
}

export function usePermissionsQuery() {
  return useQuery({
    queryKey: rolesKeys.permissions(),
    queryFn: () => getPermissions(),
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(variables.id) })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() })
    },
  })
}
