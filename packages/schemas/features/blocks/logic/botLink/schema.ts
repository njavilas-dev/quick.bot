import { z } from 'zod'
import { blockBaseSchema } from '../../shared'
import { LogicBlockType } from '../constants'

export const botLinkOptionsSchema = z.object({
  botId: z.string().optional(),
  groupId: z.string().optional(),
  mergeResults: z.boolean().optional(),
})

export const botLinkBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.BOT_LINK]),
    options: botLinkOptionsSchema.optional(),
  }),
)

export type BotLinkBlock = z.infer<typeof botLinkBlockSchema>
