import React from 'react'
import { Wrap, VStack } from '@chakra-ui/react'
import { RedirectBlock } from '@quickbot.io/schemas'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = { url: NonNullable<RedirectBlock['options']>['url'] }

export const RedirectNodeContent = ({ url }: Props) => {
  // Create a block-like object to validate variables
  const blockForValidation = {
    type: LogicBlockType.REDIRECT,
    options: { url },
  } as RedirectBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  return (
    <VStack w="full" align="start" spacing={1}>
      <Wrap>
        <PlateText text={url ? `Redirect to ${url}` : 'Configure...'} />
      </Wrap>
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
