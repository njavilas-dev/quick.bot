import React from 'react'
import { Text } from '@chakra-ui/react'
import { IntegrationValidationResult } from '@/features/graph/utils/validateIntegrationConfiguration'

type Props = {
  validation: IntegrationValidationResult
  maxLines?: number
}

export const ValidationMessage = ({ validation, maxLines = 1 }: Props) => {
  const inline = validation.errorsDetailed?.find((e) => e.code === 'inlineVarNotFound')
  const first = inline || validation.errorsDetailed?.[0]
  const message =
    first?.message ||
    validation.errors.find((e) => e.startsWith('Rendered variable not found')) ||
    validation.errors[0] ||
    undefined

  if (
    !validation.hasCredentialsError &&
    !validation.hasRequiredFieldsError &&
    !validation.hasMissingVariablesError
  )
    return null

  if (!message) return null

  return (
    <Text fontSize="xs" color="red.500" noOfLines={maxLines}>
      {message}
    </Text>
  )
}
