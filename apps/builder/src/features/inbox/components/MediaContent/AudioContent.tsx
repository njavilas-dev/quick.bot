import React from 'react'
import { Box } from '@chakra-ui/react'
import { BubbleBox } from '../MessageBubble/BubbleContainer'

interface AudioContentProps {
  url: string
}

export const AudioContent: React.FC<AudioContentProps> = ({ url }) => {
  return (
    <BubbleBox
      display="flex"
      position="relative"
      alignItems="flex-start"
      maxW="full"
      overflow="hidden"
    >
      <Box
        as="audio"
        src={url}
        controls
        sx={{ outline: 'none', height: 'revert' }}
      />
    </BubbleBox>
  )
}
