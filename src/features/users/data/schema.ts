import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
  z.literal('non_apps'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
  z.null(),
  z.undefined(),
]).optional()

const userCabangSchema = z.union([
  z.literal('pusat'),
  z.literal('kapuk'),
  z.literal('cakung'),
  z.literal('cikarang'),
  z.null(),
])

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  status: userStatusSchema,
  role: userRoleSchema,
  roleName: z.string().nullable().optional(),
  legacyRole: z.string().nullable().optional(),
  cabang: userCabangSchema,
  position: z.string().nullable().optional(),
  baseSalary: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof userSchema>
