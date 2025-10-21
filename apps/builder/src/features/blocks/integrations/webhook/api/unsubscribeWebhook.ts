import prisma from '@quickbot.io/lib/prisma'
import { canWriteBots } from '@quickbot.io/db-rules/canWriteBots'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Block, HttpRequestBlock, parseGroups } from '@quickbot.io/schemas'
import { byId } from '@quickbot.io/lib'
import { isWebhookBlock } from '@quickbot.io/schemas/helpers'
import { z } from 'zod'

export const unsubscribeWebhook = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/bots/{botId}/webhookBlocks/{blockId}/unsubscribe',
      protect: true,
      summary: 'Unsubscribe from webhook block',
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
      id: z.string(),
      url: z.string().nullable(),
    }),
  )
  .query(async ({ input: { botId, blockId }, ctx: { user } }) => {
    const bot = await prisma.bot.findFirst({
      where: canWriteBots(botId, user),
      select: {
        version: true,
        groups: true,
      },
    })

    if (!bot) throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' })

    const groups = parseGroups(bot.groups, {
      botVersion: bot.version,
    })

    const webhookBlock = groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId)) as HttpRequestBlock | null

    if (!webhookBlock || !isWebhookBlock(webhookBlock))
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Webhook block not found',
      })

    if (webhookBlock.options?.webhook || bot.version === '6') {
      const updatedGroups = groups.map((group) =>
        group.blocks.some((b) => b.id === webhookBlock.id)
          ? {
            ...group,
            blocks: group.blocks.map((block) =>
              block.id !== webhookBlock.id
                ? block
                : {
                  ...block,
                  options: {
                    ...webhookBlock.options,
                    webhook: {
                      ...webhookBlock.options?.webhook,
                      url: undefined,
                    },
                  },
                },
            ),
          }
          : group,
      )
      await prisma.bot.updateMany({
        where: { id: botId },
        data: {
          groups: updatedGroups,
        },
      })
    } else {
      if ('webhookId' in webhookBlock)
        await prisma.webhook.update({
          where: { id: webhookBlock.webhookId },
          data: { url: null },
        })
      else
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook block not found',
        })
    }

    return {
      id: blockId,
      url: null,
    }
  })
