import { useMemo } from 'react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { getEndpointPosition } from '../helpers/getEndpointPosition'
import { getEventEndpointPosition } from '../helpers/getEventEndpointPosition'
import { BlockSource } from '@quickbot.io/schemas'
import { TEventSource } from '@quickbot.io/schemas'

export const useEndpointPosition = (source: BlockSource | TEventSource, groupId?: string) => {
  const { bot } = useBot()

  return useMemo(() => {
    if ('eventId' in source) {
      const position = getEventEndpointPosition(bot, source)
      return position
    } else {
      if (!groupId) return 'right'
      const position = getEndpointPosition(bot, source, groupId)
      return position
    }
  }, [bot, source, groupId])
}
