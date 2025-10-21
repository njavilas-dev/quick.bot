import { Stack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { PaymentInputBlock } from '@quickbot.io/schemas'
import { defaultPaymentInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/payment/constants'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'

type Props = {
  block: PaymentInputBlock
}

export const PaymentBubbleNode = ({ block }: Props) => {
  const { t } = useTranslate()
  const integrationValidation = useIntegrationValidation(block)
  const hasValidationErrors =
    integrationValidation.hasCredentialsError || integrationValidation.hasRequiredFieldsError

  if (!block.options?.amount || !block.options?.credentialsId) {
    return (
      <Stack>
        <Text color={hasValidationErrors ? 'red.600' : 'text.light'} noOfLines={1}>
          {t('blocks.inputs.payment.placeholder.label')}
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
      {t('blocks.inputs.payment.collect.label')} {block.options.amount}{' '}
      {block.options.currency ?? defaultPaymentInputOptions.currency}
    </Text>
  )
}
