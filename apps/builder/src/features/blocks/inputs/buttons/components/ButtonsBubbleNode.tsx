import { BlockIndices, ChoiceInputBlock } from '@quickbot.io/schemas'
import React from 'react'
import { Stack, Tag, Text, Wrap } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { ItemNodesList } from '@/features/graph/components/nodes/item/ItemNodesList'
import { useTranslate } from '@tolgee/react'
import { useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'

type Props = {
  block: ChoiceInputBlock
  indices: BlockIndices
}

export const ButtonsBubbleNode = ({ block, indices }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  const dynamicVariableName = bot?.variables.find(
    (variable) => variable.id === block.options?.dynamicVariableId,
  )?.name
  const variableTag = useVariableTag(block.options?.variableId)
  // Ensure the block carries the correct type enum for validation
  const blockForValidation = { ...block, type: InputBlockType.CHOICE } as ChoiceInputBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'currentcolor', 'red.600')

  return (
    <Stack w="full" spacing={1}>
      {block.options?.dynamicVariableId ? (
        <Wrap spacing={1}>
          <Text color={color}>{t('blocks.inputs.button.variables.display.label')}</Text>
          <Tag variant="orange">{dynamicVariableName ?? 'Variable not found'}</Tag>
          <Text>{t('blocks.inputs.button.variables.buttons.label')}</Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </Stack>
  )
}
