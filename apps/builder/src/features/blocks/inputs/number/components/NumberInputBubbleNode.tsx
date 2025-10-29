import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { NumberInputBlock } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultNumberInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/number/constants'
import { useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'

type Props = {
  options: NumberInputBlock['options']
}

export const NumberInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)
  const blockForValidation = {
    type: InputBlockType.NUMBER,
    options,
  } as NumberInputBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'text.light', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color={color}>
        {options?.labels?.placeholder ?? defaultNumberInputOptions.labels.placeholder}
      </Text>
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
