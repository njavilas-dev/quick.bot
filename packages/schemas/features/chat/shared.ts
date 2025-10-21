import { z } from '../../zod'
import { publicBotSchemaV5, publicBotSchemaV6 } from '../publicBot'
import { preprocessBot } from '../bot/helpers/preprocessBot'

const botInSessionStatePick = {
  version: true,
  id: true,
  groups: true,
  events: true,
  edges: true,
  variables: true,
} as const

export const botInSessionStateSchema = z.preprocess(
  preprocessBot,
  z.discriminatedUnion('version', [
    publicBotSchemaV5._def.schema.pick(botInSessionStatePick),
    publicBotSchemaV6.pick(botInSessionStatePick),
  ]),
)

export type BotInSession = z.infer<typeof botInSessionStateSchema>

export const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
})
