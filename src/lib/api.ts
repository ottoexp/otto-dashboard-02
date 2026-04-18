import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const { auth } = useAuthStore.getState()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function refreshToken(token: string): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken: token,
  })
  return data
}

export async function logout(token: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken: token })
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

// User types matching backend API
export interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string | null
  status: 'active' | 'inactive' | 'invited' | 'suspended'
  role: 'superadmin' | 'admin' | 'cashier' | 'manager'
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CreateUserPayload {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  password: string
  status?: 'active' | 'inactive' | 'invited' | 'suspended'
  role?: 'superadmin' | 'admin' | 'cashier' | 'manager'
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phoneNumber?: string
  password?: string
  status?: 'active' | 'inactive' | 'invited' | 'suspended'
  role?: 'superadmin' | 'admin' | 'cashier' | 'manager'
}

export interface GetUsersParams {
  page?: number
  pageSize?: number
  status?: string[]
  role?: string[]
  username?: string
  search?: string
}

// Users API
export async function getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
  const { data } = await api.get<PaginatedResponse<User>>('/users', { params })
  return data
}

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`)
  return data
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

export async function toggleUserStatus(id: string): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}/toggle-status`)
  return data
}

export async function setUserStatus(id: string, status: 'active' | 'inactive' | 'invited' | 'suspended'): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}/status`, { status })
  return data
}

// Role types
export interface Role {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  createdAt: string
}

export interface CreateRolePayload {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRolePayload {
  name?: string
  description?: string
  permissionIds?: string[]
}

// Roles API
export async function getRoles(): Promise<Role[]> {
  const { data } = await api.get<Role[]>('/roles')
  return data
}

export async function getRole(id: string): Promise<Role & { permissions: Permission[] }> {
  const { data } = await api.get<Role & { permissions: Permission[] }>(`/roles/${id}`)
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await api.post<Role>('/roles', payload)
  return data
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<Role> {
  const { data } = await api.put<Role>(`/roles/${id}`, payload)
  return data
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`)
}

export async function getPermissions(): Promise<Permission[]> {
  const { data } = await api.get<Permission[]>('/roles/permissions')
  return data
}
