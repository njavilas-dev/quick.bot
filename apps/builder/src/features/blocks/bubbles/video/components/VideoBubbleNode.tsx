import { useTranslate } from '@tolgee/react'
import { Box, Text } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@quickbot.io/schemas'
import {
  VideoBubbleContentType,
  embedBaseUrls,
} from '@quickbot.io/schemas/features/blocks/bubbles/video/constants'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { findUniqueVariable } from '@quickbot.io/variables/findUniqueVariableValue'
import { useBot } from '@/features/editor/providers/BotProvider'

type Props = {
  block: VideoBubbleBlock
}

export const VideoBubbleNode = ({ block }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  if (!block.content?.url || !block.content.type)
    return <Text color="text.light">{t('clickToEdit')}</Text>
  const variable = bot ? findUniqueVariable(bot?.variables)(block.content?.url) : null
  switch (block.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <Box w="full" h={variable ? undefined : ' 120px'} pos="relative">
          {variable ? (
            <Text>
              Display <VariableTag variableName={variable.name} />
            </Text>
          ) : (
            <video
              key={block.content.url}
              controls={block.content?.areControlsDisplayed}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: '0',
                top: '0',
                borderRadius: 'sm',
              }}
            >
              <source src={block.content.url} />
            </video>
          )}
        </Box>
      )
    case VideoBubbleContentType.GUMLET:
    case VideoBubbleContentType.VIMEO:
    case VideoBubbleContentType.YOUTUBE: {
      const baseUrl = embedBaseUrls[block.content.type]
      return (
        <Box w="full" h="120px" pos="relative">
          <iframe
            src={`${baseUrl}/${block.content.id}`}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: '0',
              top: '0',
              borderRadius: 'sm',
              pointerEvents: 'none',
            }}
          />
        </Box>
      )
    }
    case VideoBubbleContentType.TIKTOK: {
      return (
        <Box w="full" h="300px" pos="relative">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${block.content.id}`}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: '0',
              top: '0',
              borderRadius: 'sm',
              pointerEvents: 'none',
            }}
          />
        </Box>
      )
    }
  }
}
