import prisma from '@quickbot.io/lib/prisma'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { parseGroups } from '@quickbot.io/schemas/features/bot/group'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { Block } from '@quickbot.io/schemas'
import { isWebhookBlock } from '@quickbot.io/schemas/helpers'
import { byId } from '@quickbot.io/lib'

export const listWebhookBlocks = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/bots/{botId}/webhookBlocks',
      protect: true,
      summary: 'List webhook blocks',
      description: 'Returns a list of all the webhook blocks that you can subscribe to.',
      tags: ['Webhook'],
    },
  })
  .input(
    z.object({
      botId: z.string(),
    }),
  )
  .output(
    z.object({
      webhookBlocks: z.array(
        z.object({
          id: z.string(),
          type: z.enum([
            IntegrationBlockType.WEBHOOK,
            IntegrationBlockType.ZAPIER,
            IntegrationBlockType.MAKE_COM,
            IntegrationBlockType.PABBLY_CONNECT,
          ]),
          label: z.string(),
          url: z.string().optional(),
        }),
      ),
    }),
  )
  .query(async ({ input: { botId }, ctx: { user } }) => {
    const bot = await prisma.bot.findFirst({
      where: canReadBots(botId, user),
      select: {
        version: true,
        groups: true,
        webhooks: true,
      },
    })
    if (!bot) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    const groups = parseGroups(bot.groups, {
      botVersion: bot.version,
    })

    const webhookBlocks = groups.reduce<
      {
        id: string
        label: string
        url: string | undefined
        type:
        | IntegrationBlockType.WEBHOOK
        | IntegrationBlockType.ZAPIER
        | IntegrationBlockType.MAKE_COM
        | IntegrationBlockType.PABBLY_CONNECT
      }[]
    >((webhookBlocks, group) => {
      const blocks = (group.blocks as Block[]).filter(isWebhookBlock)
      return [
        ...webhookBlocks,
        ...blocks.map((block) => ({
          id: block.id,
          type: block.type,
          label: `${group.title} > ${block.id}`,
          url:
            'webhookId' in block && !block.options?.webhook
              ? bot?.webhooks.find(byId(block.webhookId))?.url ?? undefined
              : block.options?.webhook?.url,
        })),
      ]
    }, [])

    return { webhookBlocks }
  })
