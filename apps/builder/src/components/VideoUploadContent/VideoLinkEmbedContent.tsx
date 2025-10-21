import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { VideoBubbleBlock } from '@quickbot.io/schemas'
import { InputTextWithVariables } from '@/components/inputs'
import { defaultVideoBubbleContent } from '@quickbot.io/schemas/features/blocks/bubbles/video/constants'
import { Switch } from '@urbiport/ui'
import { FormControl } from '@urbiport/ui'

export const VideoLinkEmbedContent = ({
  content,
  updateUrl,
  onSubmit,
}: {
  content?: VideoBubbleBlock['content']
  updateUrl: (url: string) => void
  onSubmit: (content: VideoBubbleBlock['content']) => void
}) => {
  const { t } = useTranslate()

  const updateAspectRatio = (aspectRatio?: string) => {
    return onSubmit({
      ...content,
      aspectRatio,
    })
  }

  const updateMaxWidth = (maxWidth?: string) => {
    return onSubmit({
      ...content,
      maxWidth,
    })
  }

  const updateAutoPlay = (isAutoplayEnabled: boolean) => {
    return onSubmit({ ...content, isAutoplayEnabled })
  }

  const updateControlsDisplay = (areControlsDisplayed: boolean) => {
    if (areControlsDisplayed === false) {
      onSubmit({
        ...content,
        isAutoplayEnabled: true,
        areControlsDisplayed,
      })
    }
    onSubmit({ ...content, areControlsDisplayed })
  }

  return (
    <Stack spacing={4}>
      <FormControl helperText={t('video.urlInput.helperText')}>
        <InputTextWithVariables
          withVariableButton={true}
          placeholder={t('video.urlInput.placeholder')}
          defaultValue={content?.url ?? ''}
          onChange={updateUrl}
        />
      </FormControl>
      {content?.url && (
        <>
          <FormControl
            direction="row"
            label={t('video.aspectRatioInput.label')}
            moreInfoTooltip={t('video.aspectRatioInput.moreInfoTooltip')}
          >
            <InputTextWithVariables
              withVariableButton={true}
              defaultValue={content?.aspectRatio ?? defaultVideoBubbleContent.aspectRatio}
              onChange={updateAspectRatio}
            />
          </FormControl>
          <FormControl
            label={t('video.maxWidthInput.label')}
            moreInfoTooltip={t('video.maxWidthInput.moreInfoTooltip')}
          >
            <InputTextWithVariables
              withVariableButton={true}
              defaultValue={content?.maxWidth ?? defaultVideoBubbleContent.maxWidth}
              onChange={updateMaxWidth}
            />
          </FormControl>
        </>
      )}
      {content?.url && content?.type === 'url' && (
        <>
          <FormControl label={t('editor.blocks.bubbles.audio.settings.controls.label')}>
            <Switch
              defaultValue={
                content?.areControlsDisplayed ?? defaultVideoBubbleContent.areControlsDisplayed
              }
              onChange={updateControlsDisplay}
            />
          </FormControl>
          <FormControl
            direction="row"
            label={t('editor.blocks.bubbles.audio.settings.autoplay.label')}
          >
            <Switch
              defaultValue={
                content?.isAutoplayEnabled ?? defaultVideoBubbleContent.isAutoplayEnabled
              }
              isDisabled={content?.areControlsDisplayed === false}
              onChange={() => updateAutoPlay(!content.isAutoplayEnabled)}
            />
          </FormControl>
        </>
      )}
    </Stack>
  )
}
