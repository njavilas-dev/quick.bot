import { Stack, Text } from '@chakra-ui/react'
import { ChatwootBlock } from '@quickbot.io/schemas'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  block: ChatwootBlock
}

export const ChatwootNodeBody = ({ block }: Props) => {
  const integrationValidation = useIntegrationValidation(block)
  const hasValidationErrors = integrationValidation.hasCredentialsError

  if (block.options?.task === 'Close widget') {
    return <Text>Close Chatwoot</Text>
  }

  if ((block.options?.websiteToken?.length ?? 0) === 0) {
    return (
      <Stack>
        <Text color={hasValidationErrors ? 'red.600' : 'text.light'} noOfLines={1}>
          Configure...
        </Text>
        {hasValidationErrors && (
          <Text fontSize="xs" color="red.500" noOfLines={1}>
            {integrationValidation.errors[0]}
          </Text>
        )}
      </Stack>
    )
  }

  return <Text>Open Chatwoot</Text>
}
