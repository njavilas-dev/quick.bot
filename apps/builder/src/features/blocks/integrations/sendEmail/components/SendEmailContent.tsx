import { Stack, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { SendEmailBlock } from '@quickbot.io/schemas'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  block: SendEmailBlock
}

export const SendEmailContent = ({ block }: Props) => {
  const integrationValidation = useIntegrationValidation(block)
  const hasValidationErrors = integrationValidation.hasRequiredFieldsError

  if ((block.options?.recipients?.length ?? 0) === 0) {
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
    <Wrap noOfLines={2} pr="6">
      <WrapItem>
        <Text>Send email to</Text>
      </WrapItem>
      {block.options?.recipients?.map((to) => (
        <WrapItem key={to}>
          <Tag>{to}</Tag>
        </WrapItem>
      ))}
    </Wrap>
  )
}
