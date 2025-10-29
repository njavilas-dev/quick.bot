import { VStack, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { RatingInputBlock } from '@quickbot.io/schemas'
import { defaultRatingInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/rating/constants'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useEffectiveVariableId, useVariableTag } from '@/hooks/useVariableTag'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import { useValidationColor } from '@/features/graph/hooks/useValidationColor'

type Props = {
  variableId?: string
  block: RatingInputBlock
}

export const RatingInputBubbleNode = ({ variableId, block }: Props) => {
  const { t } = useTranslate()
  useBot()
  const effectiveVariableId = useEffectiveVariableId(variableId, block.options?.variableId)
  const variableTag = useVariableTag(effectiveVariableId)
  const integrationValidation = useIntegrationValidation(block)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError
  const color = useValidationColor(integrationValidation, 'text.light', 'red.600')

  return (
    <VStack w="full" align="start" spacing={1}>
      <Text color={color} noOfLines={1} pr="6">
        {t('blocks.inputs.rating.from.label')}{' '}
        {block.options?.buttonType === 'Icons'
          ? 1
          : block.options?.startsAt ?? defaultRatingInputOptions.startsAt}{' '}
        {t('blocks.inputs.rating.to.label')}{' '}
        {block.options?.length ?? defaultRatingInputOptions.length}
      </Text>
      {variableTag}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
