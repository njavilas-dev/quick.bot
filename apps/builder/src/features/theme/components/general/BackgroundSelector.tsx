import React from 'react'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ColorPicker } from '@urbiport/ui'
import { Background } from '@quickbot.io/schemas'
import {
  BackgroundType,
  defaultBackgroundColor,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { useBot } from '@/features/editor/providers/BotProvider'

type Props = {
  background?: Background
  onBackgroundChange: (newBackground: Background) => void
}

export const BackgroundSelector = ({ background, onBackgroundChange }: Props) => {
  const { t } = useTranslate()
  const { bot } = useBot()

  const handleBackgroundTypeChange = (type: string) =>
    onBackgroundChange({ ...background, type: type as BackgroundType, content: undefined })

  const handleBackgroundContentChange = (content: string) =>
    onBackgroundChange({ ...background, content })

  const options = [
    {
      label: t('theme.sideMenu.global.background.color.select'),
      value: BackgroundType.COLOR,
    },
    {
      label: t('theme.sideMenu.global.background.image.select'),
      value: BackgroundType.IMAGE,
    },
    {
      label: t('theme.sideMenu.global.background.none.select'),
      value: BackgroundType.NONE,
    },
  ]

  const handleTabClick = (value: string) => {
    handleBackgroundTypeChange(value)
  }

  if (!bot) return null

  return (
    <Tabs isLazy isFitted colorScheme={'green'} w={'full'}>
      <TabList mb={4}>
        {options.map((option) => (
          <Tab onClick={() => handleTabClick(option?.value)} key={option?.value}>
            {option?.label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          <ColorPicker
            color={background?.content ?? defaultBackgroundColor}
            setColor={handleBackgroundContentChange}
          />
        </TabPanel>

        <TabPanel p={0}>
          <ImageUploadContent
            uploadFileProps={{
              workspaceId: bot?.workspaceId,
              botId: bot?.id,
              fileName: 'background',
            }}
            defaultValue={background?.content}
            onChange={handleBackgroundContentChange}
            excludedTabs={['link']}
          />
        </TabPanel>
        <TabPanel />
      </TabPanels>
    </Tabs>
  )
}
