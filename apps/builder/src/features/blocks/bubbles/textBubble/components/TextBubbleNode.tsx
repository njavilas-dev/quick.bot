import { VStack } from '@chakra-ui/react'
import { TextBubbleBlock } from '@quickbot.io/schemas'
import React from 'react'
import { PlateBlock } from './plate/PlateBlock'

type Props = {
  block: TextBubbleBlock
}

export const TextBubbleNode = ({ block }: Props) => {
  const isEmpty = (block.content?.richText?.length ?? 0) === 0
  return (
    <VStack opacity={isEmpty ? '0.5' : '1'} className="slate-html-container" style={{ gap: '0rem', alignItems: 'baseline' }}>
      {block.content?.richText?.map((element, idx) => (
        <PlateBlock key={idx} element={element} />
      ))}
    </VStack>
  )
}
