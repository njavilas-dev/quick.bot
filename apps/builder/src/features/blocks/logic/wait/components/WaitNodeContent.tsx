import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'
import { Wrap, VStack } from '@chakra-ui/react'
import { WaitBlock } from '@quickbot.io/schemas'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import React from 'react'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = {
  options: WaitBlock['options']
}

export const WaitNodeContent = ({ options: { secondsToWaitFor = '' } = {} }: Props) => {
  const isIntegerString = /^\d+$/.test(secondsToWaitFor)

  // Create a block-like object to validate variables
  const blockForValidation = {
    type: LogicBlockType.WAIT,
    options: { secondsToWaitFor },
  } as WaitBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  const waitText = isIntegerString
    ? `Wait for ${secondsToWaitFor}s`
    : `Wait for: ${secondsToWaitFor}`

  return (
    <VStack w="full" align="start" spacing={1}>
      <Wrap>
        <PlateText text={secondsToWaitFor ? waitText : 'Configure...'} />
      </Wrap>
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
