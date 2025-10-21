import { CollaborationType, BotInvitation as PrismaBotInvitation } from '@quickbot.io/prisma'
import { z } from '../zod'

export const invitationSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string().email(),
  botId: z.string(),
  type: z.nativeEnum(CollaborationType),
}) satisfies z.ZodType<PrismaBotInvitation>

export type BotInvitation = z.infer<typeof invitationSchema>
