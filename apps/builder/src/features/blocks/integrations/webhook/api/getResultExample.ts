import prisma from '@quickbot.io/lib/prisma'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Bot } from '@quickbot.io/schemas'
import { z } from 'zod'
import { fetchLinkedBots } from '@/features/blocks/logic/botLink/helpers/fetchLinkedBots'
import { parseSampleResult } from '@quickbot.io/bot-engine/blocks/integrations/webhook/parseSampleResult'
import { getBlockById } from '@quickbot.io/schemas/helpers'

export const getResultExample = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/webhookBlocks/{blockId}/getResultExample',
      protect: true,
      summary: 'Get result example',
      description:
        'Returns "fake" result for webhook block to help you anticipate how the webhook will behave.',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
      blockId: z.string(),
    }),
  )
  .output(
    z.object({
      resultExample: z.record(z.any()).describe('Can contain any fields.'),
    }),
  )
  .query(async ({ input: { botId, blockId }, ctx: { user } }) => {
    const bot = (await prisma.bot.findFirst({
      where: canReadBots(botId, user),
      select: {
        groups: true,
        edges: true,
        variables: true,
        events: true,
      },
    })) as Pick<Bot, 'groups' | 'edges' | 'variables' | 'events'> | null

    if (!bot) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    const { group } = getBlockById(blockId, bot.groups)

    if (!group) throw new TRPCError({ code: 'NOT_FOUND', message: 'Block not found' })

    const linkedBots = await fetchLinkedBots(bot, user)

    return {
      resultExample: await parseSampleResult(
        bot,
        linkedBots,
        user.email ?? undefined,
      )(group.id, bot.variables),
    }
  })
