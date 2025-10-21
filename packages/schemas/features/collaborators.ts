import { CollaborationType, BotCollaborator as PrismaBotCollaborator } from '@quickbot.io/prisma'
import { z } from '../zod'

export const collaboratorSchema = z.object({
  type: z.nativeEnum(CollaborationType),
  userId: z.string(),
  botId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable(),
  }),
}) satisfies z.ZodType<PrismaBotCollaborator>

export type BotCollaborator = z.infer<typeof collaboratorSchema>
