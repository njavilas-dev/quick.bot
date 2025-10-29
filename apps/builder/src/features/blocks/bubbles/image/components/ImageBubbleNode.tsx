import { useTranslate } from '@tolgee/react'
import { Box, Text, Image, VStack } from '@chakra-ui/react'
import { ImageBubbleBlock } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { useBot } from '@/features/editor/providers/BotProvider'
import { findUniqueVariable } from '@quickbot.io/variables/findUniqueVariableValue'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'

type Props = {
  block: ImageBubbleBlock
}

export const ImageBubbleNode = ({ block }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  const variable = bot ? findUniqueVariable(bot?.variables)(block.content?.url) : null

  // Create a block-like object to validate variables
  const blockForValidation = { ...block, type: BubbleBlockType.IMAGE } as ImageBubbleBlock
  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  const content = !block.content?.url ? (
    <Text color="text.light">{t('clickToEdit')}</Text>
  ) : variable ? (
    <Text>
      Display <VariableTag variableName={variable.name} />
    </Text>
  ) : (
    <Box w="full">
      <Image
        pointerEvents="none"
        src={block.content?.url}
        alt="Group image"
        borderRadius="md"
        objectFit="cover"
      />
    </Box>
  )

  return (
    <VStack w="full" align="start" spacing={1}>
      {content}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
