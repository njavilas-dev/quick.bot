import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'
import { DateInputBlock } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'

type Props = {
  options?: DateInputBlock['options']
}
export const DateInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)
  const blockForValidation = {
    type: InputBlockType.DATE,
    options,
  } as DateInputBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'text.light', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color={color}>Pick a date</Text>
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
