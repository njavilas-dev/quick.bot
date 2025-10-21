import { Stack, Text } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { HttpRequestBlock } from '@quickbot.io/schemas'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  block: HttpRequestBlock
}

export const WebhookContent = ({ block: { options } }: Props) => {
  const { bot } = useBot()
  const integrationValidation = useIntegrationValidation({
    type: 'http request',
    options,
  } as HttpRequestBlock)
  const webhook = options?.webhook
  const hasValidationErrors = integrationValidation.hasRequiredFieldsError

  if (!webhook?.url) {
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

  return (
    <Stack w="full">
      <Text noOfLines={2} pr="6">
        {webhook.method} {webhook.url}
      </Text>
      {options?.responseVariableMapping
        ?.filter((mapping) => mapping.variableId)
        .map((mapping) => (
          <SetVariableLabel
            key={mapping.variableId}
            variableId={mapping.variableId as string}
            variables={bot?.variables}
          />
        ))}
    </Stack>
  )
}
