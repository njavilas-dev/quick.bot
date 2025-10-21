import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  variableId?: string
}
export const DateInputBubbleNode = ({ variableId }: Props) => {
  const variableTag = useVariableTag(variableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color="text.light">Pick a date</Text>
      {variableTag}
    </VStack>
  )
}
