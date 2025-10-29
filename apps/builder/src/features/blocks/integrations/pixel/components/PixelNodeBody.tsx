import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { PixelBlock } from '@quickbot.io/schemas'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  options: PixelBlock['options']
}

export const PixelNodeBody = ({ options }: Props) => {
  const integrationValidation = useIntegrationValidation({ type: 'Pixel', options } as PixelBlock)
  const hasValidationErrors =
    integrationValidation.hasRequiredFieldsError || integrationValidation.hasMissingVariablesError

  return (
    <Stack>
      <Text
        color={
          options?.eventType || options?.pixelId
            ? 'currentcolor'
            : hasValidationErrors
            ? 'red.600'
            : 'text.light'
        }
        noOfLines={1}
      >
        {options?.eventType
          ? `Track "${options.eventType}"`
          : options?.pixelId
          ? 'Init Pixel'
          : 'Configure...'}
      </Text>
      {hasValidationErrors && (
        <Text fontSize="xs" color="red.500" noOfLines={1}>
          {integrationValidation.errors[0]}
        </Text>
      )}
    </Stack>
  )
}
