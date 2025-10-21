import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { GoogleAnalyticsBlock } from '@quickbot.io/schemas'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  block: GoogleAnalyticsBlock
}

export const GoogleAnalyticsNodeBody = ({ block }: Props) => {
  const integrationValidation = useIntegrationValidation(block)
  const hasValidationErrors = integrationValidation.hasCredentialsError
  const action = block.options?.action

  return (
    <Stack>
      <Text
        color={action ? 'currentcolor' : hasValidationErrors ? 'red.600' : 'text.light'}
        noOfLines={1}
      >
        {action ? `Track "${action}"` : 'Configure...'}
      </Text>
      {hasValidationErrors && (
        <Text fontSize="xs" color="red.500" noOfLines={1}>
          {integrationValidation.errors[0]}
        </Text>
      )}
    </Stack>
  )
}
