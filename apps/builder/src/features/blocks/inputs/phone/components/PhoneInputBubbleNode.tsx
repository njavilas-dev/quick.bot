import React from 'react'
import { VStack, Text } from '@chakra-ui/react'
import { PhoneNumberInputBlock } from '@quickbot.io/schemas'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { defaultPhoneInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/phone/constants'
import { useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'

type Props = {
  options: PhoneNumberInputBlock['options']
}

export const PhoneInputBubbleNode = ({ options }: Props) => {
  const variableTag = useVariableTag(options?.variableId)
  const blockForValidation = {
    type: InputBlockType.PHONE,
    options,
  } as PhoneNumberInputBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'text.light', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color={color}>
        {options?.labels?.placeholder ?? defaultPhoneInputOptions.labels.placeholder}
      </Text>
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
