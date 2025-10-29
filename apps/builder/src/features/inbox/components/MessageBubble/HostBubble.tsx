import React from 'react'
import { BubbleContainer } from './BubbleContainer'
import { MediaContent } from '../MediaContent'
import { TextContent } from '../TextContent'
import { extractMediaUrl, detectMediaType } from '../../helpers/blockContentExtractor'

interface HostBubbleProps {
  content?: string
  blockType?: string
  timestamp: Date
}

export const HostBubble: React.FC<HostBubbleProps> = ({
  content,
  blockType,
  timestamp,
}) => {
  const mediaUrl = extractMediaUrl(content)
  const mediaType = detectMediaType(content, blockType)

  return (
    <BubbleContainer variant="host">
      {mediaType && mediaUrl ? (
        <MediaContent url={mediaUrl} type={mediaType} alt="Bot media" />
      ) : (
        <TextContent
          content={content}
          timestamp={timestamp}
          bg="divider.lighter"
          align="left"
        />
      )}
    </BubbleContainer>
  )
}
