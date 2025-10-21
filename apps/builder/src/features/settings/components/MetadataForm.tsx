import React from 'react'
import { Settings } from '@quickbot.io/schemas'
import { Stack } from '@chakra-ui/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { env } from '@quickbot.io/env'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { InputTextWithVariables, TextareaWithVariables } from '@/components/inputs'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { Control } from '@urbiport/ui'

type Props = {
  workspaceId: string
  botId: string
  botName: string
  metadata: Settings['metadata']
  onMetadataChange: (metadata: Settings['metadata']) => void
}

export const MetadataForm = ({
  workspaceId,
  botId,
  botName,
  metadata,
  onMetadataChange,
}: Props) => {
  const { t } = useTranslate()

  const handleTitleChange = (title: string) => onMetadataChange({ ...metadata, title })
  const handleDescriptionChange = (description: string) =>
    onMetadataChange({ ...metadata, description })
  const handleFavIconSubmit = (favIconUrl: string) => onMetadataChange({ ...metadata, favIconUrl })
  const handleImageSubmit = (imageUrl: string) => onMetadataChange({ ...metadata, imageUrl })
  const handleGoogleTagManagerIdChange = (googleTagManagerId: string) =>
    onMetadataChange({ ...metadata, googleTagManagerId })
  const handleHeadCodeChange = (customHeadCode: string) =>
    onMetadataChange({ ...metadata, customHeadCode })

  const favIconUrl =
    metadata?.favIconUrl ?? defaultSettings.metadata.favIconUrl(env.NEXT_PUBLIC_VIEWER_URL[0])

  const imageUrl =
    metadata?.imageUrl ?? defaultSettings.metadata.imageUrl(env.NEXT_PUBLIC_VIEWER_URL[0])

  return (
    <Stack spacing={3}>
      <Control label={t('settings.metadataForm.favicon')} pill={favIconUrl}>
        <ImageUploadContent
          uploadFileProps={{
            workspaceId,
            botId: botId,
            fileName: 'favIcon',
          }}
          defaultValue={favIconUrl}
          onChange={handleFavIconSubmit}
          imageSize="thumb"
        />
      </Control>

      <Control label={t('settings.metadataForm.preview')} pill={imageUrl}>
        <ImageUploadContent
          uploadFileProps={{
            workspaceId,
            botId: botId,
            fileName: 'ogImage',
          }}
          defaultValue={imageUrl}
          onChange={handleImageSubmit}
        />
      </Control>

      <Control label={t('settings.metadataForm.title')}>
        <FormControl label={t('settings.metadataForm.metadataTitle')}>
          <InputTextWithVariables
            withVariableButton={false}
            defaultValue={metadata?.title ?? botName}
            onChange={handleTitleChange}
          />
        </FormControl>
      </Control>

      <Control label={t('settings.metadataForm.description')}>
        <FormControl label={t('settings.metadataForm.description')}>
          <TextareaWithVariables
            withVariableButton={false}
            defaultValue={metadata?.description ?? defaultSettings.metadata.description}
            onChange={handleDescriptionChange}
          />
        </FormControl>
      </Control>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <Control label={t('settings.metadataForm.googleTagManager')}>
          <FormControl
            label={t('settings.metadataForm.googleTagManager')}
            moreInfoTooltip={t('settings.metadataForm.googleTagManagerTooltip')}
          >
            <InputTextWithVariables
              withVariableButton={false}
              defaultValue={metadata?.googleTagManagerId}
              placeholder="GTM-XXXXXX"
              onChange={handleGoogleTagManagerIdChange}
              usePortal={false}
            />
          </FormControl>
        </Control>
      )}
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl
          label={t('settings.metadataForm.customHeadCode')}
          moreInfoTooltip={t('settings.metadataForm.customHeadCodeTooltip')}
        >
          <CodeEditorWithVariables
            id="head"
            lang="html"
            defaultValue={metadata?.customHeadCode}
            onChange={handleHeadCodeChange}
          />
        </FormControl>
      )}
    </Stack>
  )
}
