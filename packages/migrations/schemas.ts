import { z } from '@quickbot.io/schemas/zod'
import {
  edgeSchema,
  groupV5Schema,
  settingsSchema,
  themeSchema,
  variableSchema,
} from '@quickbot.io/schemas'
import { BotPublic as PrismaPublicBot } from '@quickbot.io/prisma'
import { preprocessBot } from '@quickbot.io/schemas/features/bot/helpers/preprocessBot'

const publicBotSchemaV5 = z.preprocess(
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
