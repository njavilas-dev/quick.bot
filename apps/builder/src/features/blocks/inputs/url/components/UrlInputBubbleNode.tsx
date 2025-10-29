import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { UrlInputBlock } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultUrlInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/url/constants'
import { useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'

type Props = {
  options: UrlInputBlock['options']
}

export const UrlInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)
  const blockForValidation = { type: InputBlockType.URL, options } as UrlInputBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'text.light', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color={color}>
        {options?.labels?.placeholder ?? defaultUrlInputOptions.labels.placeholder}
      </Text>
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
