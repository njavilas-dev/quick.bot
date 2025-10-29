import React from 'react'
import { Text, VStack } from '@chakra-ui/react'
import { ScriptBlock } from '@quickbot.io/schemas'
import { defaultScriptOptions } from '@quickbot.io/schemas/features/blocks/logic/script/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = {
  options: ScriptBlock['options']
}

export const ScriptNodeContent = ({ options: { name, content } = {} }: Props) => {
  const blockForValidation = {
    type: LogicBlockType.SCRIPT,
    options: { name, content },
  } as ScriptBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const color = useValidationColor(integrationValidation, 'text.light', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color={content ? 'currentcolor' : color} noOfLines={1}>
        {content ? `Run ${name ?? defaultScriptOptions.name}` : 'Configure...'}
      </Text>
      <ValidationMessage validation={integrationValidation} />
    </VStack>
  )
}
