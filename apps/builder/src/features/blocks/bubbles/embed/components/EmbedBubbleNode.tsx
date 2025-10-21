import { useTranslate } from '@tolgee/react'
import { Stack, Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@quickbot.io/schemas'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useBot } from '@/features/editor/providers/BotProvider'

type Props = {
  block: EmbedBubbleBlock
}

export const EmbedBubbleNode = ({ block }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  if (!block.content?.url) return <Text color="text.light">{t('clickToEdit')}</Text>
  return (
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
  )
}
