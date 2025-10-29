import React from 'react'
import type { Message } from '../../types/message.types'
import { HostBubble } from './HostBubble'
import { GuestBubble } from './GuestBubble'

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isHost = message.type === 'bot'

  if (isHost) {
    return (
      <HostBubble
        content={message.content}
        blockType={message.blockType}
        timestamp={message.timestamp}
      />
    )
  }

  return (
    <GuestBubble
      content={message.content}
      attachments={message.attachedFileUrls}
      timestamp={message.timestamp}
    />
  )
}

export { HostBubble } from './HostBubble'
export { GuestBubble } from './GuestBubble'
export { BubbleContainer, BubbleBox } from './BubbleContainer'
