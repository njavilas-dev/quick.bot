import { InputNumberWithVariables } from '@/components/inputs'
import { Stack } from '@chakra-ui/react'
import { PreviewMessageParams } from '@urbiport/nextjs'
import { useState } from 'react'
import { isDefined } from '@quickbot.io/lib'
import { Switch, FormControl, InputText } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'

type Props = {
  defaultAvatar: string
  onChange: (newPreviewMessage?: PreviewMessageParams) => void
}

export const PreviewMessageSettings = ({ defaultAvatar, onChange }: Props) => {
  const { t } = useTranslate()
  const [isPreviewMessageEnabled, setIsPreviewMessageEnabled] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<PreviewMessageParams>()
  const [autoShowDelay, setAutoShowDelay] = useState(10)

  const [isAutoShowEnabled, setIsAutoShowEnabled] = useState(false)

  const updatePreviewMessage = (previewMessage: PreviewMessageParams) => {
    setPreviewMessage(previewMessage)
    onChange(previewMessage)
  }

  const updateAutoShowDelay = (autoShowDelay?: number) => {
    setAutoShowDelay(autoShowDelay ?? 0)
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? '',
      autoShowDelay,
    })
  }

  const updateAvatarUrl = (avatarUrl: string) => {
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? '',
      avatarUrl,
    })
  }

  const updateMessage = (message: string) => {
    updatePreviewMessage({ ...previewMessage, message })
  }

  const updatePreviewMessageCheck = (isChecked: boolean) => {
    setIsPreviewMessageEnabled(isChecked)
    const newPreviewMessage = {
      autoShowDelay: isAutoShowEnabled ? autoShowDelay : undefined,
      message: previewMessage?.message ?? 'I have a question for you!',
      avatarUrl: previewMessage?.avatarUrl ?? defaultAvatar,
    }
    if (isChecked) setPreviewMessage(newPreviewMessage)
    onChange(isChecked ? newPreviewMessage : undefined)
  }

  const updateAutoShowDelayCheck = (isChecked: boolean) => {
    setIsAutoShowEnabled(isChecked)
    updatePreviewMessage({
      ...previewMessage,
      message: previewMessage?.message ?? '',

      autoShowDelay: isChecked ? autoShowDelay : undefined,
    })
  }

  const handleShadowDelay = (val?: number) => isDefined(val) && updateAutoShowDelay(val)

  return (
    <Stack spacing={4}>
      <FormControl direction="row" label="Preview message">
        <Switch defaultValue={isPreviewMessageEnabled} onChange={updatePreviewMessageCheck} />
      </FormControl>
      {isPreviewMessageEnabled && (
        <Stack pl="4" spacing={4}>
          <FormControl label="Avatar URL">
            <InputText
              onChange={updateAvatarUrl}
              defaultValue={previewMessage?.avatarUrl}
              placeholder={'Paste image link (.png, .jpg)'}
            />
          </FormControl>
          <FormControl label="Message">
            <InputText onChange={updateMessage} defaultValue={previewMessage?.message} />
          </FormControl>
          <FormControl direction="row" label={t('publish.popup.settings.autoShow.label')}>
            <Switch defaultValue={isAutoShowEnabled} onChange={updateAutoShowDelayCheck} />
          </FormControl>
          {isAutoShowEnabled && (
            <>
              <FormControl label={t('publish.popup.settings.autoShow.after')}>
                <InputNumberWithVariables
                  suffix={t('publish.popup.settings.autoShow.seconds')}
                  size="sm"
                  w="70px"
                  defaultValue={autoShowDelay}
                  onChange={handleShadowDelay}
                />
              </FormControl>
            </>
          )}
        </Stack>
      )}
    </Stack>
  )
}
