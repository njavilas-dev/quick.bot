import { useState } from 'react'
import { Stack, Tab, TabList, Tabs, TabPanels, TabPanel } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ButtonUploadMedia, InputTextWithVariables } from '@/components/inputs'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { FormControl, Switch } from '@urbiport/ui'
import { AudioBubbleBlock } from '@quickbot.io/schemas'
import { defaultAudioBubbleContent } from '@quickbot.io/schemas/features/blocks/bubbles/audio/constants'

type Props = {
  uploadFileProps: FilePathUploadProps
  content: AudioBubbleBlock['content']
  onContentChange: (content: AudioBubbleBlock['content']) => void
}

export const AudioBubbleForm = ({ uploadFileProps, content, onContentChange }: Props) => {
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useState<'link' | 'upload'>('link')

  const updateUrl = (url: string) => onContentChange({ ...content, url })

  const updateAutoPlay = (isAutoplayEnabled: boolean) =>
    onContentChange({ ...content, isAutoplayEnabled })

  return (
    <Stack spacing={6}>
      <Tabs
        isFitted
        colorScheme="green"
        defaultIndex={currentTab === 'upload' ? 0 : 1}
        onChange={(index) => setCurrentTab(index === 0 ? 'upload' : 'link')}
      >
        <TabList mb={4}>
          <Tab>{t('editor.blocks.bubbles.audio.settings.upload.label')}</Tab>
          <Tab>{t('editor.blocks.bubbles.audio.settings.embedLink.label')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormControl>
              <ButtonUploadMedia
                fileType="audio"
                filePathProps={uploadFileProps}
                onFileUploaded={updateUrl}
                colorScheme="blue"
              >
                {t('editor.blocks.bubbles.audio.settings.chooseFile.label')}
              </ButtonUploadMedia>
            </FormControl>
          </TabPanel>
          <TabPanel>
            <FormControl helperText={t('editor.blocks.bubbles.audio.settings.worksWith.text')}>
              <InputTextWithVariables
                withVariableButton={true}
                placeholder={t('editor.blocks.bubbles.audio.settings.worksWith.placeholder')}
                defaultValue={content?.url ?? ''}
                onChange={updateUrl}
              />
            </FormControl>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <FormControl direction="row" label={t('editor.blocks.bubbles.audio.settings.autoplay.label')}>
        <Switch
          defaultValue={content?.isAutoplayEnabled ?? defaultAudioBubbleContent.isAutoplayEnabled}
          onChange={updateAutoPlay}
        />
      </FormControl>
    </Stack>
  )
}
