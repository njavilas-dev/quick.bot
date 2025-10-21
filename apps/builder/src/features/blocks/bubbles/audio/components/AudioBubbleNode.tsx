import { chakra, Text } from '@chakra-ui/react'
import { isDefined } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { AudioBubbleBlock } from '@quickbot.io/schemas'
import { findUniqueVariable } from '@quickbot.io/variables/findUniqueVariableValue'
import { useBot } from '@/features/editor/providers/BotProvider'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'

type Props = {
  url: NonNullable<AudioBubbleBlock['content']>['url']
}

export const AudioBubbleNode = ({ url }: Props) => {
  const { bot } = useBot()
  const { t } = useTranslate()
  const variable = bot ? findUniqueVariable(bot?.variables)(url) : null
  return isDefined(url) ? (
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
}
