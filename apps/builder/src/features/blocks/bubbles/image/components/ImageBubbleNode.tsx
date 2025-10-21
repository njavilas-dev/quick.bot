import { useTranslate } from '@tolgee/react'
import { Box, Text, Image } from '@chakra-ui/react'
import { ImageBubbleBlock } from '@quickbot.io/schemas'
import { useBot } from '@/features/editor/providers/BotProvider'
import { findUniqueVariable } from '@quickbot.io/variables/findUniqueVariableValue'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'

type Props = {
  block: ImageBubbleBlock
}

export const ImageBubbleNode = ({ block }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  const variable = bot ? findUniqueVariable(bot?.variables)(block.content?.url) : null
  return !block.content?.url ? (
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
}
