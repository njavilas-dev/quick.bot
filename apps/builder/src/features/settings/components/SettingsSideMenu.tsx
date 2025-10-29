import React from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import { FormControl, H4, InputText, SidebarSlide } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { Settings } from '@quickbot.io/schemas'
import { EditCustomDomain } from '@/features/publish/components/EditCustomDomain'
import { EditPublicId } from '@/features/publish/components/EditPublicId'
import { useBot } from '@/features/editor/providers/BotProvider'
import { GeneralSettingsForm } from './GeneralSettingsForm'
import { MetadataForm } from './MetadataForm'
import { TypingEmulationForm } from './TypingEmulationForm'
import { SecurityForm } from './SecurityForm'
import { useWorkspace } from '@/hooks/useWorkspace'
import { env } from '@quickbot.io/env'
import { EditableBotIcon } from '@/components/EditableBotIcon'

export const SettingsSideMenu = () => {
  const { bot, updateBot, currentUserMode } = useBot()
  const { workspace } = useWorkspace()
  const allowCustomDomain = workspace?.billingPlan?.allowCustomDomain

  const isGuest = currentUserMode === 'guest'

  const { t } = useTranslate()

  const updateTypingEmulation = (typingEmulation: Settings['typingEmulation']) =>
    bot &&
    updateBot({
      updates: { settings: { ...bot.settings, typingEmulation } },
    })

  const updateSecurity = (security: Settings['security']) =>
    bot &&
    updateBot({
      updates: { settings: { ...bot.settings, security } },
    })

  const handleGeneralSettingsChange = (general: Settings['general']) =>
    bot && updateBot({ updates: { settings: { ...bot.settings, general } } })

  const handleMetadataChange = (metadata: Settings['metadata']) =>
    bot && updateBot({ updates: { settings: { ...bot.settings, metadata } } })

  const handleBotNameChange = (name: string) => updateBot({ updates: { name }, save: true })

  const handleChangeIcon = (icon: string) => updateBot({ updates: { icon }, save: true })

  return (
    <SidebarSlide
      title="Settings"
      labels={{
        unlockTooltip: t('editor.sidebarBlocks.sidebar.unlock.label'),
        lockTooltip: t('editor.sidebarBlocks.sidebar.lock.label'),
        unlockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.unlock.label'),
        lockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.lock.label'),
      }}
    >
      <Accordion allowMultiple defaultIndex={[0]} mx={-4}>
        {!isGuest &&
          <AccordionItem>
            <AccordionButton>
              Name
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {bot && (
                <Stack spacing={3}>
                  <FormControl
                    label="Icon"
                    direction="row"
                  >
                    <EditableBotIcon
                      icon={bot.icon}
                      uploadFileProps={{
                        workspaceId: bot.workspaceId,
                        botId: bot.id,
                        fileName: 'icon',
                        blockId: bot.id,
                      }}
                      onChange={handleChangeIcon}
                    />
                  </FormControl>
                  <FormControl
                    label="Name"
                    direction="row"
                  >
                    <InputText
                      defaultValue={bot?.name ?? ''}
                      onChange={handleBotNameChange}
                      placeholder="Enter bot name"
                      debounceTimeout={800}
                    />
                  </FormControl>
                </Stack>
              )}
            </AccordionPanel>
          </AccordionItem>
        }
        {env.NEXT_PUBLIC_BETA_ENV && (
          <AccordionItem>
            <AccordionButton>
              Domain
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {bot && (
                <Stack spacing={3}>
                  <H4>Your bot link</H4>
                  <EditPublicId />
                  {allowCustomDomain && (
                    <>
                      <H4>Your bot domain</H4>
                      <EditCustomDomain />
                    </>
                  )}
                </Stack>
              )}
            </AccordionPanel>
          </AccordionItem>
        )}
        {env.NEXT_PUBLIC_BETA_ENV && (
          <AccordionItem>
            <AccordionButton>
              General
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {bot && (
                <GeneralSettingsForm
                  generalSettings={bot.settings.general}
                  onGeneralSettingsChange={handleGeneralSettingsChange}
                />
              )}
            </AccordionPanel>
          </AccordionItem>
        )}
        {env.NEXT_PUBLIC_BETA_ENV && (
          <AccordionItem>
            <AccordionButton>
              Typing
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {bot && (
                <TypingEmulationForm
                  typingEmulation={bot.settings.typingEmulation}
                  onUpdate={updateTypingEmulation}
                />
              )}
            </AccordionPanel>
          </AccordionItem>
        )}
        {env.NEXT_PUBLIC_BETA_ENV && (
          <AccordionItem>
            <AccordionButton>
              Security
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {bot && <SecurityForm security={bot.settings.security} onUpdate={updateSecurity} />}
            </AccordionPanel>
          </AccordionItem>
        )}
        <AccordionItem>
          <AccordionButton>
            Metadata
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {bot && (
              <MetadataForm
                workspaceId={bot.workspaceId}
                botId={bot.id}
                botName={bot.name}
                metadata={bot.settings.metadata}
                onMetadataChange={handleMetadataChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </SidebarSlide>
  )
}
