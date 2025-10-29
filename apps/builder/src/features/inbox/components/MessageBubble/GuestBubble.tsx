import React from 'react'
import { BubbleContainer } from './BubbleContainer'
import { AttachmentList } from '../MediaContent/AttachmentList'
import { TextContent } from '../TextContent'

interface GuestBubbleProps {
  content?: string
  attachments?: string[]
  timestamp: Date
}

export const GuestBubble: React.FC<GuestBubbleProps> = ({
  content,
  attachments,
  timestamp,
}) => {
  return (
    <BubbleContainer variant="guest">
      {attachments && attachments.length > 0 && (
        <AttachmentList attachments={attachments} />
      )}
      <TextContent
        content={content}
        timestamp={timestamp}
        bg="green.50"
        align="right"
      />
    </BubbleContainer>
  )
}
