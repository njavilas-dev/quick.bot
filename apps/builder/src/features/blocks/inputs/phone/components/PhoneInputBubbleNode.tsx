import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { PhoneNumberInputBlock } from '@quickbot.io/schemas'
import { defaultPhoneInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/phone/constants'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  options: PhoneNumberInputBlock['options']
}

export const PhoneInputBubbleNode = ({ options: { variableId, labels } = {} }: Props) => {
  const variableTag = useVariableTag(variableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color="text.light">
        {labels?.placeholder ?? defaultPhoneInputOptions.labels.placeholder}
      </Text>
      {variableTag}
    </VStack>
  )
}
