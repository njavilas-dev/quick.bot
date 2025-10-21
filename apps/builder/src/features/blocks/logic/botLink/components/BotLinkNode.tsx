import { BotLinkBlock } from '@quickbot.io/schemas'
import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { byId, isNotEmpty } from '@quickbot.io/lib'
import { trpc } from '@/lib/trpc'

type Props = {
  block: BotLinkBlock
}

export const BotLinkNode = ({ block }: Props) => {
  const { bot } = useBot()

  const { data: linkedBotData } = trpc.bot.getBot.useQuery(
    {
      botId: block.options?.botId as string,
    },
    {
      enabled: isNotEmpty(block.options?.botId) && block.options?.botId !== 'current',
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const isCurrentBot =
    bot && (block.options?.botId === bot.id || block.options?.botId === 'current')
  const linkedBot = isCurrentBot ? bot : linkedBotData?.bot
  const blockTitle = linkedBot?.groups.find(byId(block.options?.groupId))?.title

  if (!block.options?.botId) return <Text color="text.light">Configure...</Text>
  return (
    <Text>
      Jump{' '}
      {blockTitle ? (
        <>
          to <Tag>{blockTitle}</Tag>
        </>
      ) : (
        <></>
      )}{' '}
      {!isCurrentBot ? (
        <>
          in <Tag colorScheme="blue">{linkedBot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  )
}
