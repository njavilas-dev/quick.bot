import { VStack, Text } from '@chakra-ui/react'
import { FileInputBlock } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultFileInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/file/constants'
import { useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'

type Props = {
  options: FileInputBlock['options']
}

export const FileInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)
  const integrationValidation = useIntegrationValidation({
    type: InputBlockType.FILE,
    options,
  } as FileInputBlock)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'currentcolor', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text noOfLines={1} pr="6" color={color}>
        {options?.labels?.button ?? defaultFileInputOptions.labels.button}
      </Text>
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
