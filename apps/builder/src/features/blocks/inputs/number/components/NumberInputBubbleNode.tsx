import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { NumberInputBlock } from '@quickbot.io/schemas'
import { defaultNumberInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/number/constants'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  options: NumberInputBlock['options']
}

export const NumberInputBubbleNode = ({ options: { variableId, labels } = {} }: Props) => {
  const variableTag = useVariableTag(variableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color="text.light">
        {labels?.placeholder ?? defaultNumberInputOptions.labels.placeholder}
      </Text>
      {variableTag}
    </VStack>
  )
}
