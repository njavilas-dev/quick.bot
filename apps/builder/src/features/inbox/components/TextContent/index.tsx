import React from 'react'
import { Text } from '@chakra-ui/react'
import { MessageTimestamp } from './MessageTimestamp'
import { BubbleBox } from '../MessageBubble/BubbleContainer'
import { useBubbleVariant } from '../MessageBubble/BubbleContext'

interface TextContentProps {
  content?: string
  timestamp: Date
  bg?: string
  color?: string
  align?: 'left' | 'right'
}

export const TextContent: React.FC<TextContentProps> = ({
  content,
  timestamp,
  bg = 'divider.lighter',
  color = 'inherit',
  align = 'left',
}) => {
  const variant = useBubbleVariant()
  const isHost = variant === 'host'

  if (!content) return null

  return (
    <BubbleBox
      bg={bg}
      color={color}
      borderBottomLeftRadius={isHost ? 0 : 'lg'}
      borderBottomRightRadius={isHost ? 'lg' : 0}
      py={3}
      px={5}
    >
      <Text
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        sx={{
          '& p': { margin: 0 },
          '& a': { color: 'blue.500', textDecoration: 'underline' },
        }}
      >
        {content}
      </Text>
      <MessageTimestamp
        date={timestamp}
        align={align}
      />
    </BubbleBox>
  )
}

export { MessageTimestamp }
