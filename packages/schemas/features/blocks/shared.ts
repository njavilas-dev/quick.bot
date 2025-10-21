import { z } from '../../zod'
import { WorkspaceCredential as PrismaWorkspaceCredential } from '@quickbot.io/prisma'

export const blockBaseSchema = z.object({
  id: z.string(),
  outgoingEdgeId: z.string().optional(),
})

export const optionBaseSchema = z.object({
  variableId: z.string().optional(),
})

export const credentialsBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  workspaceId: z.string(),
  name: z.string(),
  iv: z.string(),
}) satisfies z.ZodType<Omit<PrismaWorkspaceCredential, 'data' | 'type'>>
