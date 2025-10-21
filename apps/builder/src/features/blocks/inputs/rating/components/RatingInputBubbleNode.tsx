import { VStack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { RatingInputBlock } from '@quickbot.io/schemas'
import { defaultRatingInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/rating/constants'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useEffectiveVariableId, useVariableTag } from '@/hooks/useVariableTag'

type Props = {
  variableId?: string
  block: RatingInputBlock
}

export const RatingInputBubbleNode = ({ variableId, block }: Props) => {
  const { t } = useTranslate()
  useBot()
  const effectiveVariableId = useEffectiveVariableId(variableId, block.options?.variableId)
  const variableTag = useVariableTag(effectiveVariableId)

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color="text.light" noOfLines={1} pr="6">
        {t('blocks.inputs.rating.from.label')}{' '}
        {block.options?.buttonType === 'Icons'
          ? 1
          : block.options?.startsAt ?? defaultRatingInputOptions.startsAt}{' '}
        {t('blocks.inputs.rating.to.label')}{' '}
        {block.options?.length ?? defaultRatingInputOptions.length}
      </Text>
      {variableTag}
    </VStack>
  )
}
