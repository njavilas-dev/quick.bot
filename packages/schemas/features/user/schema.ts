import {
  User as PrismaUser,
  UserApiToken as PrismaUserApiToken,
  ChangeRequest as PrismaChangeRequest,
  ChangeRequestStatus,
  ChangeRequestType,
  TypeConfirmation,
} from '@quickbot.io/prisma'
import { z } from '../../zod'

const displayedInAppNotificationsSchema = z.record(z.boolean())

export const userSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActivityAt: z.date(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  company: z.string().nullable(),
  onboardingCategories: z.array(z.string()),
  referral: z.string().nullable(),
  preferredAppAppearance: z.string().nullable(),
  displayedInAppNotifications: displayedInAppNotificationsSchema.nullable(),
}) satisfies z.ZodType<PrismaUser>

export const userApiTokenSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  token: z.string(),
  name: z.string(),
  userId: z.string(),
}) satisfies z.ZodType<Omit<PrismaUserApiToken, 'user'>>

export const changeRequestSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  type: z.nativeEnum(ChangeRequestType),
  status: z.nativeEnum(ChangeRequestStatus),
  typeConfirmation: z.nativeEnum(TypeConfirmation),
  token: z.string(),
  expiresAt: z.date(),
  confirmedAt: z.date().nullable(),
  newValue: z.string(),
  oldValue: z.string(),
}) satisfies z.ZodType<Omit<PrismaChangeRequest, 'user'>>

// Esquema específico para cambios de email (compatibilidad)
export const emailChangeRequestSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  type: z.literal('EMAIL'),
  status: z.nativeEnum(ChangeRequestStatus),
  typeConfirmation: z.nativeEnum(TypeConfirmation),
  token: z.string(),
  expiresAt: z.date(),
  confirmedAt: z.date().nullable(),
  newValue: z.string().email(), // newEmail
  oldValue: z.string().email(), // currentEmail
}) satisfies z.ZodType<Omit<PrismaChangeRequest, 'user'>>

// Esquema específico para cambios de contraseña (compatibilidad)
export const passwordChangeRequestSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  type: z.literal('PASSWORD'),
  status: z.nativeEnum(ChangeRequestStatus),
  typeConfirmation: z.nativeEnum(TypeConfirmation),
  token: z.string(),
  expiresAt: z.date(),
  confirmedAt: z.date().nullable(),
  newValue: z.string(), // newPassword (encriptado)
  oldValue: z.string(), // oldPassword (encriptado)
}) satisfies z.ZodType<Omit<PrismaChangeRequest, 'user'>>

export type User = z.infer<typeof userSchema>
export type UserApiToken = z.infer<typeof userApiTokenSchema>
export type ChangeRequest = z.infer<typeof changeRequestSchema>
export type EmailChangeRequest = z.infer<typeof emailChangeRequestSchema>
export type PasswordChangeRequest = z.infer<typeof passwordChangeRequestSchema>
