import React from 'react'
import { BubbleBox } from '../MessageBubble/BubbleContainer'
import { getVideoEmbedUrl } from '../../utils/videoEmbedUtils'

interface VideoContentProps {
  url: string
}

export const VideoContent: React.FC<VideoContentProps> = ({ url }) => {
  const embedUrl = getVideoEmbedUrl(url)

  return (
    <BubbleBox
      position="relative"
      w="full"
      maxW="512px"
      overflow="hidden"
      bg="white"
    >
      {embedUrl ? (
        <BubbleBox
          as="iframe"
          src={embedUrl}
          w="full"
          h="auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{ aspectRatio: '16/9', border: 'none' }}
        />
      ) : (
        <BubbleBox
          as="video"
          src={url}
          controls
          w="full"
          p="4"
          sx={{ aspectRatio: '16/9', objectFit: 'contain' }}
        />
      )}
    </BubbleBox>
  )
}
