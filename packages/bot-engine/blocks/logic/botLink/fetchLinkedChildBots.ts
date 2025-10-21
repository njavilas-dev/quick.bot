import { Block, PublicBot, Bot, BotLinkBlock } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'
import { fetchLinkedBots } from './fetchLinkedBots'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'

type Props = {
  bots: Pick<PublicBot, 'groups'>[]
  userId: string | undefined
  isPreview?: boolean
}

export const fetchLinkedChildBots =
  ({ bots, userId, isPreview }: Props) =>
  async (capturedLinkedBots: (Bot | PublicBot)[]): Promise<(Bot | PublicBot)[]> => {
    const linkedBotIds = bots
      .flatMap((bot) =>
        (
          bot.groups
            .flatMap<Block>((group) => group.blocks)
            .filter(
              (block) =>
                block.type === LogicBlockType.BOT_LINK &&
                isDefined(block.options?.botId) &&
                !capturedLinkedBots.some(
                  (bot) => ('botId' in bot ? bot.botId : bot.id) === block.options?.botId,
                ),
            ) as BotLinkBlock[]
        ).map((b) => b.options?.botId),
      )
      .filter(isDefined)
    if (linkedBotIds.length === 0) return capturedLinkedBots
    const linkedBots = await fetchLinkedBots({
      userId,
      botIds: linkedBotIds,
      isPreview,
    })

    const linkedBotsAsBot = linkedBots as unknown as (Bot | PublicBot)[]

    return fetchLinkedChildBots({
      bots: linkedBotsAsBot,
      userId,
      isPreview,
    })([...capturedLinkedBots, ...linkedBotsAsBot])
  }
