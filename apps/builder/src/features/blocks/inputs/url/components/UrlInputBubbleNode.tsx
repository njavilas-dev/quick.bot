import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { UrlInputBlock } from '@quickbot.io/schemas'
import { defaultUrlInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/url/constants'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  options: UrlInputBlock['options']
}

export const UrlInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color="text.light">
        {options?.labels?.placeholder ?? defaultUrlInputOptions.labels.placeholder}
      </Text>
      {variableTag}
    </VStack>
  )
}
