import { AudioBubbleForm } from '@/features/blocks/bubbles/audio/components/AudioBubbleForm'
import { EmbedBubbleForm } from '@/features/blocks/bubbles/embed/components/EmbedBubbleForm'
import { ImageBubbleForm } from '@/features/blocks/bubbles/image/components/ImageBubbleForm'
import { VideoBubbleForm } from '@/features/blocks/bubbles/video/components/VideoBubbleForm'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { Portal, PopoverContent, PopoverArrow, PopoverBody } from '@chakra-ui/react'
import { BubbleBlock, BubbleBlockContent, TextBubbleBlock } from '@quickbot.io/schemas'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { useRef } from 'react'

type Props = {
  uploadFileProps: FilePathUploadProps
  block: Exclude<BubbleBlock, TextBubbleBlock>
  onContentChange: (content: BubbleBlockContent) => void
}

export const MediaBubblePopoverContent = (props: Props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <Portal>
      <PopoverContent
        onMouseDown={handleMouseDown}
        w={props.block.type === BubbleBlockType.IMAGE ? '500px' : '400px'}
      >
        <PopoverArrow />
        <PopoverBody ref={ref}>
          <MediaBubbleContent {...props} />
        </PopoverBody>
      </PopoverContent>
    </Portal>
  )
}

const MediaBubbleContent = ({ uploadFileProps, block, onContentChange }: Props) => {
  switch (block.type) {
    case BubbleBlockType.IMAGE: {
      return (
        <ImageBubbleForm
          uploadFileProps={uploadFileProps}
          block={block}
          onContentChange={onContentChange}
        />
      )
    }
    case BubbleBlockType.VIDEO: {
      return <VideoBubbleForm content={block.content} onSubmit={onContentChange} />
    }
    case BubbleBlockType.EMBED: {
      return <EmbedBubbleForm content={block.content} onSubmit={onContentChange} />
    }
    case BubbleBlockType.AUDIO: {
      return (
        <AudioBubbleForm
          content={block.content}
          uploadFileProps={uploadFileProps}
          onContentChange={onContentChange}
        />
      )
    }
  }
}
