import prisma from '@quickbot.io/lib/prisma'
import { canReadBots } from '@quickbot.io/db-rules/canReadBots'
import { User } from '@quickbot.io/prisma'
import { Block, PublicBot, Bot } from '@quickbot.io/schemas'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'

export const fetchLinkedBots = async (
  bot: Pick<PublicBot, 'groups'>,
  user?: User,
): Promise<(Bot | PublicBot)[]> => {
  const linkedBotIds = bot.groups
    .flatMap<Block>((group) => group.blocks)
    .reduce<string[]>((botIds, block) => {
      if (block.type !== LogicBlockType.BOT_LINK) return botIds
      const botId = block.options?.botId
      if (!botId) return botIds
      return botIds.includes(botId) ? botIds : [...botIds, botId]
    }, [])
  if (linkedBotIds.length === 0) return []
  const bots = (await ('botId' in bot
    ? prisma.botPublic.findMany({
      where: { id: { in: linkedBotIds } },
    })
    : prisma.bot.findMany({
      where: user
        ? {
          AND: [{ id: { in: linkedBotIds } }, canReadBots(linkedBotIds, user as User)],
        }
        : { id: { in: linkedBotIds } },
    }))) as (Bot | PublicBot)[]
  return bots
}
