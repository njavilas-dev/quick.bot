import { chakra, Text, VStack } from '@chakra-ui/react'
import { isDefined } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { AudioBubbleBlock } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { findUniqueVariable } from '@quickbot.io/variables/findUniqueVariableValue'
import { useBot } from '@/features/editor/providers/BotProvider'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = {
  url: NonNullable<AudioBubbleBlock['content']>['url']
  block?: AudioBubbleBlock
}

export const AudioBubbleNode = ({ url, block }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  const variable = bot ? findUniqueVariable(bot?.variables)(url) : null

  // Create a block-like object to validate variables if block is provided
  const blockForValidation = block
    ? ({ ...block, type: BubbleBlockType.AUDIO } as AudioBubbleBlock)
    : null
  const integrationValidation = useIntegrationValidation(
    blockForValidation || ({ type: BubbleBlockType.AUDIO, content: { url } } as AudioBubbleBlock),
  )
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  const content = isDefined(url) ? (
    variable ? (
      <Text>
        Play <VariableTag variableName={variable.name} />
      </Text>
    ) : (
      <chakra.audio src={url} controls maxW="calc(100% - 25px)" borderRadius="md" />
    )
  ) : (
    <Text color="text.light">{t('clickToEdit')}</Text>
  )

  return (
    <VStack w="full" align="start" spacing={1}>
      {content}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
