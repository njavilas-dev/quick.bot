import { useState } from 'react'
import { Stack } from '@chakra-ui/react'
import { ThemeTemplate } from '@quickbot.io/schemas'
import { useTranslate } from '@tolgee/react'
import { ControlPill } from '@urbiport/ui'
import { MyTemplates } from './templates/MyTemplates'
import { TemplatesGallery } from './templates/TemplatesGallery'

type Props = {
  workspaceId: string
  selectedTemplateId: string | undefined
  currentTheme: ThemeTemplate['theme']
  onTemplateSelect: (template: Partial<Pick<ThemeTemplate, 'id' | 'theme'>>) => void
}

export const ThemeTemplatesForm = ({
  workspaceId,
  selectedTemplateId,
  currentTheme,
  onTemplateSelect,
}: Props) => {
  const { t } = useTranslate()

  const [selectedTab, setSelectedTab] = useState('my-templates')

  return (
    <Stack spacing={3}>
      <ControlPill
        label={t('theme.sideMenu.template.myTemplates')}
        onClick={() => setSelectedTab('my-templates')}
      />
      <ControlPill
        label={t('theme.sideMenu.template.gallery')}
        onClick={() => setSelectedTab('gallery')}
      />
      <ThemeTemplatesBody
        tab={selectedTab}
        currentTheme={currentTheme}
        workspaceId={workspaceId}
        selectedTemplateId={selectedTemplateId}
        onTemplateSelect={onTemplateSelect}
      />
    </Stack>
  )
}

type ThemeTemplatesBodyProps = {
  tab: string
} & Props

const ThemeTemplatesBody = ({
  tab,
  workspaceId,
  selectedTemplateId,
  currentTheme,
  onTemplateSelect,
}: ThemeTemplatesBodyProps) => {
  switch (tab) {
    case 'my-templates':
      return (
        <MyTemplates
          onTemplateSelect={onTemplateSelect}
          currentTheme={currentTheme}
          selectedTemplateId={selectedTemplateId}
          workspaceId={workspaceId}
        />
      )
    case 'gallery':
      return (
        <TemplatesGallery
          onTemplateSelect={onTemplateSelect}
          currentTheme={currentTheme}
          selectedTemplateId={selectedTemplateId}
          workspaceId={workspaceId}
        />
      )
  }
}
