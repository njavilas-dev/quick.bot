import { useTranslate } from '@tolgee/react'
import { Stack, Text, VStack } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = {
  block: EmbedBubbleBlock
}

export const EmbedBubbleNode = ({ block }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()

  // Create a block-like object to validate variables
  const blockForValidation = { ...block, type: BubbleBlockType.EMBED } as EmbedBubbleBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  if (!block.content?.url) {
    return (
      <VStack w="full" align="start" spacing={1}>
        <Text color="text.light">{t('clickToEdit')}</Text>
        {hasValidationErrors &&
          (() => {
            const inline = integrationValidation.errors.find((e) =>
              e.startsWith('Rendered variable not found'),
            )
            const message =
              inline ?? integrationValidation.errors[0] ?? 'Selected variable not found'
            return (
              <Text fontSize="xs" color="red.500" noOfLines={1}>
                {message}
              </Text>
            )
          })()}
      </VStack>
    )
  }

  return (
    <VStack w="full" align="start" spacing={1}>
      <Stack>
        <Text>{t('editor.blocks.bubbles.embed.node.show.text')}</Text>
        {bot &&
          block.content.waitForEvent?.isEnabled &&
          block.content.waitForEvent.saveDataInVariableId && (
            <SetVariableLabel
              variables={bot.variables}
              variableId={block.content.waitForEvent.saveDataInVariableId}
            />
          )}
      </Stack>
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
