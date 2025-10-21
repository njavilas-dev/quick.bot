import { VStack, Text } from '@chakra-ui/react'
import { FileInputBlock } from '@quickbot.io/schemas'
import { defaultFileInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/file/constants'
import { useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  options: FileInputBlock['options']
}

export const FileInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text noOfLines={1} pr="6">
        {options?.labels?.button ?? defaultFileInputOptions.labels.button}
      </Text>
      {variableTag}
    </VStack>
  )
}
