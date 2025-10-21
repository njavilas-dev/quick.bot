import { useState } from 'react'
import { Tab, TabList, Tabs } from '@urbiport/ui'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { EmbedLinkContent } from './EmbedLinkContent'
import { UploadFileContent } from './UploadFileContent'
import { GiphyPicker } from './GiphyPicker'
import { EmojiSearchableList } from './EmojiSearchableList'
import { UnsplashPicker } from './UnsplashPicker'
import { IconPicker } from './IconPicker'
import { env } from '@quickbot.io/env'
import { TabPanels } from '@chakra-ui/react'

const TABS = {
  link: {
    label: 'Link',
    component: EmbedLinkContent,
    hidden: false,
  },
  upload: {
    label: 'Upload',
    component: UploadFileContent,
    hidden: false,
  },
  giphy: {
    label: 'Giphy',
    component: GiphyPicker,
    hidden: !env.NEXT_PUBLIC_GIPHY_API_KEY || !env.NEXT_PUBLIC_BETA_ENV,
  },
  emoji: {
    label: 'Emoji',
    component: EmojiSearchableList,
    hidden: true,
  },
  unsplash: {
    label: 'Unsplash',
    component: UnsplashPicker,
    hidden: !env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || !env.NEXT_PUBLIC_BETA_ENV,
  },
  icon: {
    label: 'Icon',
    component: IconPicker,
    hidden: !env.NEXT_PUBLIC_BETA_ENV,
  },
}

type Tabs = keyof typeof TABS

type Props = {
  uploadFileProps?: FilePathUploadProps
  imageSize?: 'small' | 'regular' | 'thumb'
  initialTab?: Tabs
  includedTabs?: Tabs[]
  excludedTabs?: Tabs[]
  defaultValue?: string
  onChange: (url: string) => void
  onClose?: () => void
}

export const ImageUploadContent = ({
  initialTab,
  includedTabs,
  excludedTabs,
  onChange,
  onClose,
  ...props
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

  const handleOnChange = (url: string) => {
    onChange(url)
    if (onClose) onClose()
  }

  const TabCurrent = TABS[currentTab]?.component

  if (displayedTabs.length === 1) {
    const SingleTabComponent = TABS[displayedTabs[0]].component
    return <SingleTabComponent {...props} onChange={handleOnChange} />
  }

  const defaultTabIndex = displayedTabs.findIndex((tab) => tab === currentTab)

  return (
    <Tabs isFitted colorScheme="green" w="full" defaultIndex={defaultTabIndex}>
      <TabList mb={4}>
        {displayedTabs.map((tab) => (
          <Tab key={tab} onClick={() => handleTabChange(tab)}>
            {TABS[tab].label}
          </Tab>
        ))}
      </TabList>
      <TabPanels>{TabCurrent && <TabCurrent {...props} onChange={handleOnChange} />}</TabPanels>
    </Tabs>
  )
}
