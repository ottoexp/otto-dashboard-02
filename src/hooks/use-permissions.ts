import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  createdAt: string
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get<Permission[]>('/roles/permissions')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useHasPermission(resource: string, action: string) {
  const { data: permissions, isLoading } = usePermissions()

  return {
    hasPermission: permissions?.some(
      (p) => p.resource === resource && p.action === action
    ) ?? false,
    isLoading,
  }
}

export function useHasAnyPermission(resource: string, actions: string[]) {
  const { data: permissions, isLoading } = usePermissions()

  return {
    hasPermission: permissions?.some(
      (p) => p.resource === resource && actions.includes(p.action)
    ) ?? false,
    isLoading,
  }
}
