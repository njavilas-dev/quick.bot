import { z } from '../zod'
import {
  Workspace as WorkspacePrisma,
  WorkspaceMember as MemberInWorkspacePrisma,
  WorkspaceRole,
  User as UserPrisma,
  WorkspaceInvitation as WorkspaceInvitationPrisma,
} from '@quickbot.io/prisma'
import { PlanWithoutChatTiers, planSchemaWithoutChatTiers } from './billing'

export const workspaceMemberSchema = z.object({
  workspaceId: z.string(),
  user: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable(),
  }),
  role: z.nativeEnum(WorkspaceRole),
  userId: z.string(),
}) satisfies z.ZodType<
  Omit<MemberInWorkspacePrisma, 'createdAt' | 'updatedAt'> & {
    user: Pick<UserPrisma, 'name' | 'email' | 'image'>
  }
>

export const workspaceInvitationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string(),
  type: z.nativeEnum(WorkspaceRole),
}) satisfies z.ZodType<Omit<WorkspaceInvitationPrisma, 'workspaceId' | 'userId'>>

export const workspaceSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  icon: z.string().nullable(),
  billingPlan: planSchemaWithoutChatTiers,
  billingPlanId: z.string(),
  stripeId: z.string().nullable(),
  billingEmail: z.string().email().nullable(),
  billingCompany: z.string().nullable(),
  billingVatType: z.string().nullable(),
  billingVatValue: z.string().nullable(),
  additionalChatsIndex: z.number(),
  additionalStorageIndex: z.number(),
  chatsLimitFirstEmailSentAt: z.date().nullable(),
  chatsLimitSecondEmailSentAt: z.date().nullable(),
  storageLimitFirstEmailSentAt: z.date().nullable(),
  storageLimitSecondEmailSentAt: z.date().nullable(),
  isQuarantined: z.boolean(),
  isSuspended: z.boolean(),
  isPastDue: z.boolean(),
  isVerified: z.boolean().nullable(),
}) satisfies z.ZodType<WorkspacePrisma & { billingPlan: PlanWithoutChatTiers }>

export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>
export type WorkspaceInvitation = z.infer<typeof workspaceInvitationSchema>
