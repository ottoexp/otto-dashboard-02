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
    cabang: string | null
  }
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  cabang: string | null
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
  cabang: 'pusat' | 'kapuk' | 'cakung' | 'cikarang' | null
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
  cabang?: 'pusat' | 'kapuk' | 'cakung' | 'cikarang' | null
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
  cabang?: 'pusat' | 'kapuk' | 'cakung' | 'cikarang' | null
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

// Customers types
export interface Customer {
  id: string
  name: string
  phone: string
  vehicle: string
  plateNumber: string
  totalOrders: number
  lastVisit: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerPayload {
  name: string
  phone: string
  vehicle: string
  plateNumber: string
  status?: 'active' | 'inactive'
}

export interface UpdateCustomerPayload {
  name?: string
  phone?: string
  vehicle?: string
  plateNumber?: string
  status?: 'active' | 'inactive'
}

// Customers API
export async function getCustomers(): Promise<PaginatedResponse<Customer>> {
  const { data } = await api.get<PaginatedResponse<Customer>>('/customers?page=1&limit=10')
  return data
}

export async function getCustomer(id: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/customers/${id}`)
  return data
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const { data } = await api.post<Customer>('/customers', payload)
  return data
}

export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customers/${id}`, payload)
  return data
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`)
}

// Inventory types
export interface Inventory {
  id: string
  code: string
  name: string
  category: string
  stock: number
  buyPrice: number
  sellPrice: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryPayload {
  code: string
  name: string
  category: string
  stock: number
  buyPrice: number
  sellPrice: number
  status?: 'active' | 'inactive'
}

export interface UpdateInventoryPayload {
  code?: string
  name?: string
  category?: string
  stock?: number
  buyPrice?: number
  sellPrice?: number
  status?: 'active' | 'inactive'
}

// Inventory API
export async function getInventory(): Promise<Inventory[]> {
  const { data } = await api.get<{ data: Inventory[], pagination: any }>('/inventory')
  return data.data
}

export async function createInventory(payload: CreateInventoryPayload): Promise<Inventory> {
  const { data } = await api.post<Inventory>('/inventory', payload)
  return data
}

export async function deleteInventory(id: string): Promise<void> {
  await api.delete(`/inventory/${id}`)
}

// Team types
export interface Team {
  id: string
  full_name: string
  phone: string
  email: string | null
  position: string
  base_salary: number
  join_date: string | null
  address: string | null
  emergency_contact: string | null
  notes: string | null
  status: 'active' | 'inactive' | 'resigned' | 'suspended'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateTeamPayload {
  full_name: string
  phone: string
  email?: string
  position: string
  base_salary: number
  join_date?: string
  address?: string
  emergency_contact?: string
  notes?: string
  status?: 'active' | 'inactive' | 'resigned' | 'suspended'
}

export interface UpdateTeamPayload {
  full_name?: string
  phone?: string
  email?: string
  position?: string
  base_salary?: number
  join_date?: string
  address?: string
  emergency_contact?: string
  notes?: string
  status?: 'active' | 'inactive' | 'resigned' | 'suspended'
}

// Team API
export async function getTeam(): Promise<{ data: Team[], pagination: any }> {
  const { data } = await api.get<{ data: Team[], pagination: any }>('/team')
  return data
}

export async function createTeam(payload: CreateTeamPayload): Promise<Team> {
  const { data } = await api.post<Team>('/team', payload)
  return data
}

export async function updateTeam(id: string, payload: UpdateTeamPayload): Promise<Team> {
  const { data } = await api.put<Team>(`/team/${id}`, payload)
  return data
}

export async function deleteTeam(id: string): Promise<void> {
  await api.delete(`/team/${id}`)
}

// Services types
export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateServicePayload {
  name: string
  description?: string
  price: number
  duration: number
  status?: 'active' | 'inactive'
}

export interface UpdateServicePayload {
  name?: string
  description?: string
  price?: number
  duration?: number
  status?: 'active' | 'inactive'
}

// Services API
export async function getServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>('/services')
  return data
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
  const { data } = await api.post<Service>('/services', payload)
  return data
}

export async function deleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`)
}

// Transactions types
export interface Transaction {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  description: string
  total: number
  date: string
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionPayload {
  customerId: string
  description: string
  total: number
  status?: 'pending' | 'paid' | 'cancelled'
}

export interface UpdateTransactionPayload {
  customerId?: string
  description?: string
  total?: number
  status?: 'pending' | 'paid' | 'cancelled'
}

// Transactions API
export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>('/transactions')
  return data
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const { data } = await api.post<Transaction>('/transactions', payload)
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`)
}

// Service Inventory types
export interface ServiceWithInventory {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  status: 'active' | 'inactive'
  inventoryItems?: ServiceInventoryItemWithDetails[]
  totalInventoryCost?: number
  createdAt: string
  updatedAt: string
}

export interface ServiceInventoryItemWithDetails {
  id: string
  serviceId: string
  inventoryId: string
  inventoryName: string
  inventoryCode: string
  stock: number
  cost: number
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface StockAlertWithDetails {
  id: string
  inventoryId: string
  inventoryName: string
  inventoryCode: string
  currentStock: number
  minStock: number
  alertThreshold: number
  isActive: boolean
  lastAlerted: string | null
  createdAt: string
  updatedAt: string
}

// Service Inventory API
export async function getServicesWithInventory(): Promise<ServiceWithInventory[]> {
  const { data } = await api.get<ServiceWithInventory[]>('/service-inventory/services-with-inventory')
  return data
}

export async function addServiceInventoryItem(serviceId: string, inventoryId: string, quantity: number): Promise<ServiceInventoryItemWithDetails> {
  const { data } = await api.post<ServiceInventoryItemWithDetails>(`/service-inventory/services/${serviceId}/inventory`, {
    inventoryId,
    quantity
  })
  return data
}

export async function updateServiceInventoryItem(id: string, quantity: number): Promise<ServiceInventoryItemWithDetails> {
  const { data } = await api.put<ServiceInventoryItemWithDetails>(`/service-inventory/service-inventory/${id}`, {
    quantity
  })
  return data
}

export async function removeServiceInventoryItem(id: string): Promise<void> {
  await api.delete(`/service-inventory/service-inventory/${id}`)
}

export async function getStockAlerts(): Promise<StockAlertWithDetails[]> {
  const { data } = await api.get<StockAlertWithDetails[]>('/service-inventory/stock-alerts')
  return data
}

export async function updateInventory(id: string, payload: UpdateInventoryPayload): Promise<Inventory> {
  const { data } = await api.put<Inventory>(`/inventory/${id}`, payload)
  return data
}

// Attendance types
export interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'present' | 'absent' | 'late' | 'half-day'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAttendancePayload {
  employeeId: string
  employeeName: string
  date: string
  checkIn?: string
  checkOut?: string
  status: 'present' | 'absent' | 'late' | 'half-day'
  notes?: string
}

export interface UpdateAttendancePayload {
  employeeId?: string
  employeeName?: string
  date?: string
  checkIn?: string
  checkOut?: string
  status?: 'present' | 'absent' | 'late' | 'half-day'
  notes?: string
}

// Attendance API
export async function getAttendance(): Promise<Attendance[]> {
  const { data } = await api.get<Attendance[]>('/attendance')
  return data
}

export async function createAttendance(payload: CreateAttendancePayload): Promise<Attendance> {
  const { data } = await api.post<Attendance>('/attendance', payload)
  return data
}

export async function updateAttendance(id: string, payload: UpdateAttendancePayload): Promise<Attendance> {
  const { data } = await api.put<Attendance>(`/attendance/${id}`, payload)
  return data
}

export async function deleteAttendance(id: string): Promise<void> {
  await api.delete(`/attendance/${id}`)
}

// Cash types
export interface Cash {
  id: string
  transactionType: 'in' | 'out'
  category: string
  amount: number
  description: string
  date: string
  reference: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateCashPayload {
  transactionType: 'in' | 'out'
  category: string
  amount: number
  description: string
  date: string
  reference?: string
  status?: 'active' | 'inactive'
}

export interface UpdateCashPayload {
  transactionType?: 'in' | 'out'
  category?: string
  amount?: number
  description?: string
  date?: string
  reference?: string
  status?: 'active' | 'inactive'
}

// Cash API
export async function getCash(): Promise<Cash[]> {
  const { data } = await api.get<Cash[]>('/cash')
  return data
}

export async function createCash(payload: CreateCashPayload): Promise<Cash> {
  const { data } = await api.post<Cash>('/cash', payload)
  return data
}

export async function updateCash(id: string, payload: UpdateCashPayload): Promise<Cash> {
  const { data } = await api.put<Cash>(`/cash/${id}`, payload)
  return data
}

export async function deleteCash(id: string): Promise<void> {
  await api.delete(`/cash/${id}`)
}

// Bank types
export interface Bank {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  balance: number
  currency: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateBankPayload {
  bankName: string
  accountNumber: string
  accountName: string
  balance: number
  currency: string
  status?: 'active' | 'inactive'
}

export interface UpdateBankPayload {
  bankName?: string
  accountNumber?: string
  accountName?: string
  balance?: number
  currency?: string
  status?: 'active' | 'inactive'
}

// Bank API
export async function getBank(): Promise<Bank[]> {
  const { data } = await api.get<Bank[]>('/bank')
  return data
}

export async function createBank(payload: CreateBankPayload): Promise<Bank> {
  const { data } = await api.post<Bank>('/bank', payload)
  return data
}

export async function updateBank(id: string, payload: UpdateBankPayload): Promise<Bank> {
  const { data } = await api.put<Bank>(`/bank/${id}`, payload)
  return data
}

export async function deleteBank(id: string): Promise<void> {
  await api.delete(`/bank/${id}`)
}

// Ledger types
export interface Ledger {
  id: string
  accountCode: string
  accountName: string
  debit: number
  credit: number
  balance: number
  description: string
  date: string
  reference: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateLedgerPayload {
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description: string
  date: string
  reference?: string
  status?: 'active' | 'inactive'
}

export interface UpdateLedgerPayload {
  accountCode?: string
  accountName?: string
  debit?: number
  credit?: number
  description?: string
  date?: string
  reference?: string
  status?: 'active' | 'inactive'
}

// Ledger API
export async function getLedger(): Promise<Ledger[]> {
  const { data } = await api.get<Ledger[]>('/ledger')
  return data
}

export async function createLedger(payload: CreateLedgerPayload): Promise<Ledger> {
  const { data } = await api.post<Ledger>('/ledger', payload)
  return data
}

export async function updateLedger(id: string, payload: UpdateLedgerPayload): Promise<Ledger> {
  const { data } = await api.put<Ledger>(`/ledger/${id}`, payload)
  return data
}

export async function deleteLedger(id: string): Promise<void> {
  await api.delete(`/ledger/${id}`)
}

// Tax types
export interface Tax {
  id: string
  taxName: string
  taxCode: string
  rate: number
  description: string | null
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateTaxPayload {
  taxName: string
  taxCode: string
  rate: number
  description?: string
  status?: 'active' | 'inactive'
}

export interface UpdateTaxPayload {
  taxName?: string
  taxCode?: string
  rate?: number
  description?: string
  status?: 'active' | 'inactive'
}

// Tax API
export async function getTax(): Promise<Tax[]> {
  const { data } = await api.get<Tax[]>('/tax')
  return data
}

export async function createTax(payload: CreateTaxPayload): Promise<Tax> {
  const { data } = await api.post<Tax>('/tax', payload)
  return data
}

export async function updateTax(id: string, payload: UpdateTaxPayload): Promise<Tax> {
  const { data } = await api.put<Tax>(`/tax/${id}`, payload)
  return data
}

export async function deleteTax(id: string): Promise<void> {
  await api.delete(`/tax/${id}`)
}

// Admin types
export interface Admin {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateAdminPayload {
  name: string
  email: string
  role: string
  permissions: string[]
  status?: 'active' | 'inactive'
}

export interface UpdateAdminPayload {
  name?: string
  email?: string
  role?: string
  permissions?: string[]
  status?: 'active' | 'inactive'
}

// Admin API
export async function getAdmin(): Promise<Admin[]> {
  const { data } = await api.get<Admin[]>('/admin')
  return data
}

export async function createAdmin(payload: CreateAdminPayload): Promise<Admin> {
  const { data } = await api.post<Admin>('/admin', payload)
  return data
}

export async function updateAdmin(id: string, payload: UpdateAdminPayload): Promise<Admin> {
  const { data } = await api.put<Admin>(`/admin/${id}`, payload)
  return data
}

export async function deleteAdmin(id: string): Promise<void> {
  await api.delete(`/admin/${id}`)
}

// People types
export interface People {
  id: string
  fullName: string
  phone: string
  email: string | null
  role: string
  department: string
  joinDate: string
  status: 'active' | 'inactive' | 'resigned'
  createdAt: string
  updatedAt: string
}

export interface CreatePeoplePayload {
  fullName: string
  phone: string
  email?: string
  role: string
  department: string
  joinDate: string
  status?: 'active' | 'inactive' | 'resigned'
}

export interface UpdatePeoplePayload {
  fullName?: string
  phone?: string
  email?: string
  role?: string
  department?: string
  joinDate?: string
  status?: 'active' | 'inactive' | 'resigned'
}

// People API
export async function getPeople(): Promise<People[]> {
  const { data } = await api.get<{ data: People[]; pagination: any }>('/operational/people')
  return data.data
}

export async function createPeople(payload: CreatePeoplePayload): Promise<People> {
  const { data } = await api.post<People>('/operational/people', payload)
  return data
}

export async function updatePeople(id: string, payload: UpdatePeoplePayload): Promise<People> {
  const { data } = await api.put<People>(`/operational/people/${id}`, payload)
  return data
}

export async function deletePeople(id: string): Promise<void> {
  await api.delete(`/operational/people/${id}`)
}

// Scheduling types
export interface Scheduling {
  id: string
  employeeId: string
  employeeName: string
  shiftType: 'morning' | 'afternoon' | 'night'
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSchedulingPayload {
  employeeId: string
  employeeName: string
  shiftType: 'morning' | 'afternoon' | 'night'
  date: string
  startTime: string
  endTime: string
  status?: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export interface UpdateSchedulingPayload {
  employeeId?: string
  employeeName?: string
  shiftType?: 'morning' | 'afternoon' | 'night'
  date?: string
  startTime?: string
  endTime?: string
  status?: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

// Scheduling API
export async function getScheduling(): Promise<Scheduling[]> {
  const { data } = await api.get<Scheduling[]>('/scheduling')
  return data
}

export async function createScheduling(payload: CreateSchedulingPayload): Promise<Scheduling> {
  const { data } = await api.post<Scheduling>('/scheduling', payload)
  return data
}

export async function updateScheduling(id: string, payload: UpdateSchedulingPayload): Promise<Scheduling> {
  const { data } = await api.put<Scheduling>(`/scheduling/${id}`, payload)
  return data
}

export async function deleteScheduling(id: string): Promise<void> {
  await api.delete(`/scheduling/${id}`)
}
