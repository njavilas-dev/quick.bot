import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { byId, isDefined } from '@quickbot.io/lib'
import { JumpBlock } from '@quickbot.io/schemas/features/blocks/logic/jump'

type Props = {
  options: JumpBlock['options']
}

export const JumpNodeBody = ({ options }: Props) => {
  const { bot } = useBot()
  const selectedGroup = bot?.groups.find(byId(options?.groupId))
  const blockIndex = selectedGroup?.blocks.findIndex(byId(options?.blockId))
  if (!selectedGroup) return <Text color="text.light">Configure...</Text>
  return (
    <Text>
      Jump to <Tag colorScheme="blue">{selectedGroup.title}</Tag>{' '}
      {isDefined(blockIndex) && blockIndex >= 0 ? (
        <>
          at block <Tag colorScheme="blue">{blockIndex + 1}</Tag>
        </>
      ) : null}
    </Text>
  )
}
