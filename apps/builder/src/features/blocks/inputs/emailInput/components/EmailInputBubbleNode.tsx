import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { EmailInputBlock } from '@quickbot.io/schemas'
import { defaultEmailInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/email/constants'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  options: EmailInputBlock['options']
}

export const EmailInputBubbleNode = ({ options: { variableId, labels } = {} }: Props) => {
  const variableTag = useVariableTag(variableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color="text.light">
        {labels?.placeholder ?? defaultEmailInputOptions.labels.placeholder}
      </Text>
      {variableTag}
    </VStack>
  )
}
