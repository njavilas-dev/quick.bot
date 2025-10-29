import React from 'react'
import { BubbleBox } from '../MessageBubble/BubbleContainer'

interface ImageContentProps {
  url: string
  alt?: string
  maxW?: string
  maxH?: string
}

export const ImageContent: React.FC<ImageContentProps> = ({
  url,
  alt = 'Image',
  maxW = '100%',
  maxH = '400px',
}) => {
  return (
    <BubbleBox
      as="img"
      src={url}
      alt={alt}
      maxW={maxW}
      maxH={maxH}
      objectFit="cover"
      cursor="pointer"
      onClick={() => window.open(url, '_blank')}
    />
  )
}
