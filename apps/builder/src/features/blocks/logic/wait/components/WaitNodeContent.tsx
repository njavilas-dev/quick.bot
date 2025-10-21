import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'
import { Wrap } from '@chakra-ui/react'
import { WaitBlock } from '@quickbot.io/schemas'
import React from 'react'

type Props = {
  options: WaitBlock['options']
}

export const WaitNodeContent = ({ options: { secondsToWaitFor = '' } = {} }: Props) => {
   const isIntegerString = /^\d+$/.test(secondsToWaitFor)

  const waitText = isIntegerString
    ? `Wait for ${secondsToWaitFor}s`
    : `Wait for: ${secondsToWaitFor}`
  return (
    <Wrap>
      <PlateText text={secondsToWaitFor ? waitText : 'Configure...'} />
    </Wrap>
  )
}
