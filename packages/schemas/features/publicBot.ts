import { BotPublic as PrismaPublicBot } from '@quickbot.io/prisma'
import { variableSchema, themeSchema, settingsSchema, groupV5Schema, groupV6Schema } from './bot'
import { z } from '../zod'
import { preprocessBot } from './bot/helpers/preprocessBot'
import { edgeSchema } from './bot'
import { startEventSchema } from './events'

export const publicBotSchemaV5 = z.preprocess(
  preprocessBot,
  z.object({
    id: z.string(),
    version: z.enum(['3', '4', '5']),
    createdAt: z.date(),
    updatedAt: z.date(),
    botId: z.string(),
    groups: z.array(groupV5Schema),
    events: z.null().openapi({
      type: 'array',
    }),
    edges: z.array(edgeSchema),
    variables: z.array(variableSchema),
    theme: themeSchema,
    settings: settingsSchema,
  }),
) satisfies z.ZodType<Partial<PrismaPublicBot>, z.ZodTypeDef, unknown>
export type PublicBotV5 = z.infer<typeof publicBotSchemaV5>

export const publicBotSchemaV6 = publicBotSchemaV5._def.schema.extend({
  version: z.literal('6'),
  groups: z.array(groupV6Schema),
  events: z.tuple([startEventSchema]),
})
export type PublicBotV6 = z.infer<typeof publicBotSchemaV6>

export const publicBotSchema = z.preprocess(
  preprocessBot,
  z.discriminatedUnion('version', [
    publicBotSchemaV6.openapi({
      ref: 'publicBotV6',
      title: 'Public Bot V6',
    }),
    publicBotSchemaV5._def.schema.openapi({
      ref: 'publicBotV5',
      title: 'Public Bot V5',
    }),
  ]),
)
export type PublicBot = z.infer<typeof publicBotSchema>
