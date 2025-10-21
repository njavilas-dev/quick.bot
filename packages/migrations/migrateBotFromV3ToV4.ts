import { Webhook as WebhookFromDb } from '@quickbot.io/prisma'
import { BlockV5, BotV5, HttpRequest } from '@quickbot.io/schemas'
import { isWebhookBlock } from '@quickbot.io/schemas/helpers'
import { isDefined } from '@quickbot.io/lib/utils'
import prisma from '@quickbot.io/lib/prisma'
import {
  HttpMethod,
  defaultWebhookAttributes,
} from '@quickbot.io/schemas/features/blocks/integrations/webhook/constants'

import { PublicBotV5 } from './schemas'

export const migrateBotFromV3ToV4 = async (
  bot: BotV5 | PublicBotV5,
): Promise<Omit<BotV5 | PublicBotV5, 'version'> & { version: '4' }> => {
  if (bot.version === '4') return bot as Omit<BotV5, 'version'> & { version: '4' }
  const webhookBlocks = bot.groups.flatMap((group) => group.blocks).filter(isWebhookBlock)
  const webhooks = await prisma.webhook.findMany({
    where: {
      id: {
        in: webhookBlocks
          .map((block) => ('webhookId' in block ? block.webhookId : undefined))
          .filter(isDefined),
      },
    },
  })
  return {
    ...bot,
    version: '4',
    groups: bot.groups.map((group) => ({
      ...group,
      blocks: group.blocks.map(migrateWebhookBlock(webhooks)),
    })),
  }
}

const migrateWebhookBlock =
  (webhooks: WebhookFromDb[]) =>
  (block: BlockV5): BlockV5 => {
    if (!isWebhookBlock(block)) return block
    const webhook = webhooks.find((webhook) => webhook.id === block.webhookId)
    return {
      ...block,
      webhookId: undefined,
      options: {
        ...block.options,
        webhook: webhook
          ? {
              id: webhook.id,
              url: webhook.url ?? undefined,
              method: (webhook.method as HttpRequest['method']) ?? HttpMethod.POST,
              headers: (webhook.headers as HttpRequest['headers']) ?? [],
              queryParams: (webhook.queryParams as HttpRequest['headers']) ?? [],
              body: webhook.body ?? undefined,
            }
          : {
              ...defaultWebhookAttributes,
              id: 'webhookId' in block ? block.webhookId ?? '' : '',
            },
      },
    }
  }
