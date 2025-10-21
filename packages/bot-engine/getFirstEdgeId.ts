import { TRPCError } from '@trpc/server'
import { BotInSession } from '@quickbot.io/schemas'

export const getFirstEdgeId = ({
  bot,
  startEventId,
}: {
  bot: Pick<BotInSession, 'events' | 'groups' | 'version'>
  startEventId: string | undefined
}) => {
  if (startEventId) {
    const event = bot.events?.find((e) => e.id === startEventId)
    if (!event)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Start event doesn't exist",
      })
    return event.outgoingEdgeId
  }
  if (bot.version === '6') return bot.events?.[0].outgoingEdgeId
  return bot.groups.at(0)?.blocks.at(0)?.outgoingEdgeId
}
