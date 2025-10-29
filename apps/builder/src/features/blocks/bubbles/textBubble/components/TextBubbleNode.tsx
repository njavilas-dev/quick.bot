import { VStack } from '@chakra-ui/react'
import { TextBubbleBlock } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import React, { useMemo } from 'react'
import { PlateBlock } from './plate/PlateBlock'
import { useIntegrationValidation } from '@/features/graph/hooks/useIntegrationValidation'
import { ValidationMessage } from '@/features/graph/components/nodes/block/ValidationMessage'
import type { TElement, TText } from '@urbiport/ui'

type Props = {
  block: TextBubbleBlock
}

// Generate stable key for rich text elements
const getRichTextElementKey = (element: TElement | TText, idx: number): string => {
  if ('text' in element && typeof element.text === 'string') {
    // For text nodes, create a stable key based on content
    return `richtext-${idx}-${element.text.slice(0, 30)}`
  }
  if ('type' in element && element.type) {
    // For element nodes, use type and index
    return `richtext-${element.type}-${idx}`
  }
  return `richtext-${idx}`
}

export const TextBubbleNode = ({ block }: Props) => {
  const isEmpty = (block.content?.richText?.length ?? 0) === 0

  // Memoize the block validation object to prevent unnecessary recalculations
  const blockForValidation = useMemo(
    () => ({ ...block, type: BubbleBlockType.TEXT } as TextBubbleBlock),
    [block]
  )

  const integrationValidation = useIntegrationValidation(blockForValidation)
  const hasValidationErrors = integrationValidation.hasMissingVariablesError

  // Memoize the rich text rendering to avoid unnecessary re-renders
  const richTextElements = useMemo(() => {
    return block.content?.richText?.map((element, idx) => (
      <PlateBlock key={getRichTextElementKey(element, idx)} element={element} />
    ))
  }, [block.content?.richText])

  return (
    <VStack
      opacity={isEmpty ? '0.5' : '1'}
      className="slate-html-container"
      style={{ gap: '0rem', alignItems: 'baseline' }}
    >
      {richTextElements}
      {hasValidationErrors && <ValidationMessage validation={integrationValidation} />}
    </VStack>
  )
}
