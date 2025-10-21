import { Stack, Text } from '@chakra-ui/react'
import { MakeComBlock } from '@quickbot.io/schemas'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  block: MakeComBlock
}

export const MakeComContent = ({ block }: Props) => {
  const integrationValidation = useIntegrationValidation(block)
  const hasValidationErrors = integrationValidation.hasRequiredFieldsError

  if (!block.options?.webhook?.url) {
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
    <Text noOfLines={1} pr="6">
      Trigger scenario
    </Text>
  )
}
