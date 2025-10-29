import React from 'react'
import type { MediaType } from '../../types/message.types'
import { ImageContent } from './ImageContent'
import { VideoContent } from './VideoContent'
import { AudioContent } from './AudioContent'

interface MediaContentProps {
  url: string
  type: MediaType
  alt?: string
}

export const MediaContent: React.FC<MediaContentProps> = ({ url, type, alt }) => {
  if (!type || !url) return null

  switch (type) {
    case 'image':
      return <ImageContent url={url} alt={alt} />
    case 'video':
      return <VideoContent url={url} />
    case 'audio':
      return <AudioContent url={url} />
    default:
      return null
  }
}

export { ImageContent, VideoContent, AudioContent }
