import React from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { SidebarSlide } from '@urbiport/ui'
import { env } from '@quickbot.io/env'
import { ChatTheme, GeneralTheme, ThemeTemplate } from '@quickbot.io/schemas'
import { useBot } from '@/features/editor/providers/BotProvider'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { ThemeTemplatesForm } from './ThemeTemplatesForm'
import { ThemeGeneralForm } from './ThemeGeneralForm'
import { ThemeContainerForm } from './ThemeContainerForm'
import { ThemeCustomCssForm } from './ThemeCustomCssForm'
import { ThemeBubbleForm } from '@/features/theme/components/ThemeBubbleForm'
import { ThemeButtonsForm } from './ThemeButtonsForm'
import { ThemeInputsForm } from './ThemeInputsForm'

export const ThemeSideMenu = () => {
  const { t } = useTranslate()

  const { bot, updateBot } = useBot()

  const updateChatTheme = (chat: ChatTheme) =>
    bot && updateBot({ updates: { theme: { ...bot.theme, chat } } })

  const updateGeneralTheme = (general?: GeneralTheme) =>
    bot && updateBot({ updates: { theme: { ...bot.theme, general } } })

  const updateCustomCss = (customCss: string) =>
    bot && updateBot({ updates: { theme: { ...bot.theme, customCss } } })

  const selectTemplate = (selectedTemplate: Partial<Pick<ThemeTemplate, 'id' | 'theme'>>) => {
    if (!bot) return
    const { theme, id } = selectedTemplate
    updateBot({
      updates: {
        selectedThemeTemplateId: id,
        theme: theme ? { ...theme } : bot.theme,
      },
    })
  }

  const updateBranding = (isBrandingEnabled: boolean) =>
    bot &&
    updateBot({
      updates: {
        settings: { ...bot.settings, general: { isBrandingEnabled } },
      },
    })

  const templateId = bot?.selectedThemeTemplateId ?? undefined

  return (
    <SidebarSlide
      title="Theme"
      labels={{
        unlockTooltip: t('editor.sidebarBlocks.sidebar.unlock.label'),
        lockTooltip: t('editor.sidebarBlocks.sidebar.lock.label'),
        unlockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.unlock.label'),
        lockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.lock.label'),
      }}
    >
      <Accordion allowMultiple defaultIndex={[1]} mx={-4}>
        {env.NEXT_PUBLIC_BETA_ENV && (
          <AccordionItem>
            <AccordionButton>
              {t('theme.sideMenu.template')}
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {bot && (
                <ThemeTemplatesForm
                  selectedTemplateId={templateId}
                  currentTheme={bot.theme}
                  workspaceId={bot.workspaceId}
                  onTemplateSelect={selectTemplate}
                />
              )}
            </AccordionPanel>
          </AccordionItem>
        )}
        <AccordionItem>
          <AccordionButton>
            {t('theme.sideMenu.global')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <ThemeGeneralForm
                key={templateId}
                isBrandingEnabled={
                  bot.settings.general?.isBrandingEnabled ??
                  defaultSettings.general.isBrandingEnabled
                }
                generalTheme={bot.theme.general}
                onGeneralThemeChange={updateGeneralTheme}
                onBrandingChange={updateBranding}
              />
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            {t('theme.sideMenu.chat')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <ThemeContainerForm
                key={templateId}
                chatTheme={bot.theme.chat}
                generalTheme={bot.theme.general}
                generalBackground={bot.theme.general?.background}
                onChatThemeChange={updateChatTheme}
                onGeneralThemeChange={updateGeneralTheme}
              />
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            {t('theme.sideMenu.bubble')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <ThemeBubbleForm
                key={templateId}
                workspaceId={bot.workspaceId}
                botId={bot.id}
                chatTheme={bot.theme.chat}
                onChatThemeChange={updateChatTheme}
              />
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            {t('theme.sideMenu.chat.buttons')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <ThemeButtonsForm
                key={templateId}
                chatTheme={bot.theme.chat}
                generalBackground={bot.theme.general?.background}
                onChatThemeChange={updateChatTheme}
              />
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            {t('theme.sideMenu.chat.inputs')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <ThemeInputsForm
                key={templateId}
                chatTheme={bot.theme.chat}
                generalBackground={bot.theme.general?.background}
                onChatThemeChange={updateChatTheme}
              />
            )}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionButton>
            {t('theme.sideMenu.customCSS')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <ThemeCustomCssForm
                key={templateId}
                customCss={bot.theme.customCss}
                onCustomCssChange={updateCustomCss}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </SidebarSlide>
  )
}
