import { Text, TextProps } from '@chakra-ui/react'
import React from 'react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { byId } from '@quickbot.io/lib'
import { VariableTag } from './VariableTag'

type Props = {
  variableId: string
} & TextProps

export const WithVariableContent = ({ variableId, ...props }: Props) => {
  const { bot } = useBot()
  const variableName = bot?.variables.find(byId(variableId))?.name

  return (
    <Text w="calc(100% - 25px)" {...props}>
      Collect <VariableTag variableName={variableName ?? ''} />
    </Text>
  )
}
