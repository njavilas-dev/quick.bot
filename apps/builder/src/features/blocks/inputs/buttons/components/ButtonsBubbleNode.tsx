import { BlockIndices, ChoiceInputBlock } from '@quickbot.io/schemas'
import React from 'react'
import { Stack, Tag, Text, Wrap } from '@chakra-ui/react'
import { useBot } from '@/features/editor/providers/BotProvider'
import { ItemNodesList } from '@/features/graph/components/nodes/item/ItemNodesList'
import { useTranslate } from '@tolgee/react'
import { useVariableTag } from '@/hooks/useVariableTag'

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

  return (
    <Stack w="full" spacing={1}>
      {block.options?.dynamicVariableId ? (
        <Wrap spacing={1}>
          <Text>{t('blocks.inputs.button.variables.display.label')}</Text>
          <Tag variant="orange">{dynamicVariableName}</Tag>
          <Text>{t('blocks.inputs.button.variables.buttons.label')}</Text>
        </Wrap>
      ) : (
        <ItemNodesList block={block} indices={indices} />
      )}
      {variableTag}
    </Stack>
  )
}
