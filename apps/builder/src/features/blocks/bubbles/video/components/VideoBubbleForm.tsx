import { Stack, Tab, TabList, TabPanels, Tabs } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@quickbot.io/schemas'
import { parseVideoUrl } from '@quickbot.io/schemas/features/blocks/bubbles/video/helpers'
import { useState } from 'react'
import { PexelsPicker } from '@/components/VideoUploadContent/PexelsPicker'
import { VideoLinkEmbedContent } from '@/components/VideoUploadContent/VideoLinkEmbedContent'
import { env } from '@quickbot.io/env'

const TABS = {
  link: {
    label: 'Link',
    component: VideoLinkEmbedContent,
    hidden: false,
  },
  pexels: {
    label: 'Pexels',
    component: PexelsPicker,
    hidden: !env.NEXT_PUBLIC_PEXELS_API_KEY,
  },
}

type Tabs = keyof typeof TABS

type Props = {
  content?: VideoBubbleBlock['content']
  onSubmit: (content: VideoBubbleBlock['content']) => void
  initialTab?: Tabs
  includedTabs?: Tabs[]
  excludedTabs?: Tabs[]
}

export const VideoBubbleForm = ({
  content,
  onSubmit,
  initialTab,
  excludedTabs,
  includedTabs,
}: Props) => {
  const getDisplayedTabs = () =>
    Object.keys(TABS).filter((tab) => {
      const isExcluded = excludedTabs?.includes(tab as Tabs)
      const isIncluded = includedTabs ? includedTabs.includes(tab as Tabs) : true
      const isHidden = TABS[tab as Tabs].hidden
      return !isExcluded && isIncluded && !isHidden
    }) as Tabs[]

  const displayedTabs = getDisplayedTabs()
  const [currentTab, setCurrentTab] = useState<Tabs>(initialTab ?? displayedTabs[0])

  const handleTabChange = (tab: Tabs) => setCurrentTab(tab)

  const updateUrl = (url: string) => {
    const { type, url: matchedUrl, id, videoSizeSuggestion } = parseVideoUrl(url)
    if (currentTab !== 'link') {
      handleTabChange('link')
    }
    return onSubmit({
      ...content,
      type,
      url: matchedUrl,
      id,
      ...(!content?.aspectRatio && !content?.maxWidth ? videoSizeSuggestion : {}),
    })
  }

  const TabCurrent = TABS[currentTab]?.component

  return (
    <Stack spacing={6}>
      <Tabs isFitted colorScheme="green">
        <TabList mb={4}>
          {displayedTabs.map((tab) => (
            <Tab key={tab} onClick={() => handleTabChange(tab)}>
              {TABS[tab].label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {TabCurrent && (
            <TabCurrent
              onVideoSelect={updateUrl}
              videoSize="medium"
              content={content}
              updateUrl={updateUrl}
              onSubmit={onSubmit}
            />
          )}
        </TabPanels>
      </Tabs>
    </Stack>
  )
}
