import React, { useState } from 'react'
import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { InputTextWithVariables } from '@/components/inputs'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { isDefined, isNotEmpty } from '@quickbot.io/lib'
import { ImageBubbleBlock } from '@quickbot.io/schemas'
import { defaultImageBubbleContent } from '@quickbot.io/schemas/features/blocks/bubbles/image/constants'
import { FormControl } from '@urbiport/ui'

type Props = {
  uploadFileProps: FilePathUploadProps
  block: ImageBubbleBlock
  onContentChange: (content: ImageBubbleBlock['content']) => void
}

export const ImageBubbleForm = ({ uploadFileProps, block, onContentChange }: Props) => {
  const { t } = useTranslate()
  const [showClickLinkInput, setShowClickLinkInput] = useState(
    isNotEmpty(block.content?.clickLink?.url),
  )

  const updateImage = (url: string) => {
    onContentChange({ ...block.content, url })
  }

  const updateClickLinkUrl = (url: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content?.clickLink, url },
    })
  }

  const updateClickLinkAltText = (alt: string) => {
    onContentChange({
      ...block.content,
      clickLink: { ...block.content?.clickLink, alt },
    })
  }

  const toggleClickLink = () => {
    if (isDefined(block.content?.clickLink) && showClickLinkInput) {
      onContentChange({ ...block.content, clickLink: undefined })
    }
    setShowClickLinkInput(!showClickLinkInput)
  }

  return (
    <Stack spacing={6}>
      <ImageUploadContent
        uploadFileProps={uploadFileProps}
        defaultValue={block.content?.url}
        onChange={updateImage}
      />
      <SwitchWithRelatedSettings
        direction="row"
        label={t('editor.blocks.bubbles.image.switchWithLabel.onClick.label')}
        defaultValue={showClickLinkInput}
        onChange={toggleClickLink}
      >
        <FormControl>
          <InputTextWithVariables
            withVariableButton={true}
            autoFocus
            placeholder="https://example.com"
            onChange={updateClickLinkUrl}
            defaultValue={block.content?.clickLink?.url}
          />
        </FormControl>
        <FormControl>
          <InputTextWithVariables
            withVariableButton={true}
            placeholder={t('editor.blocks.bubbles.image.switchWithLabel.onClick.placeholder')}
            onChange={updateClickLinkAltText}
            defaultValue={block.content?.clickLink?.alt ?? defaultImageBubbleContent.clickLink.alt}
          />
        </FormControl>
      </SwitchWithRelatedSettings>
    </Stack>
  )
}
