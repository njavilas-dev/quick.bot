import { Stack } from '@chakra-ui/react'
import { AvatarProps, ChatTheme, Theme } from '@quickbot.io/schemas'
import React from 'react'
import { AvatarForm } from './chat/AvatarForm'
import { useTranslate } from '@tolgee/react'
import {
  defaultGuestBubblesBackgroundColor,
  defaultGuestBubblesColor,
  defaultHostBubblesBackgroundColor,
  defaultHostBubblesColor,
  defaultOpacity,
  defaultBlur,
  defaultRoundness,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { SettingsFilteredContainer } from '@/features/theme/components/SettingsFilteredContainer'
import { Control } from '@urbiport/ui'

type Props = {
  workspaceId: string
  botId: string
  chatTheme: Theme['chat']
  onChatThemeChange: (chatTheme: ChatTheme) => void
}

export const ThemeBubbleForm = ({ workspaceId, botId, chatTheme, onChatThemeChange }: Props) => {
  const { t } = useTranslate()

  const updateHostBubbles = (hostBubbles: NonNullable<Theme['chat']>['hostBubbles']) =>
    onChatThemeChange({ ...chatTheme, hostBubbles })

  const updateGuestBubbles = (guestBubbles: NonNullable<Theme['chat']>['guestBubbles']) =>
    onChatThemeChange({ ...chatTheme, guestBubbles })

  const updateHostAvatar = (hostAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, hostAvatar })

  const updateGuestAvatar = (guestAvatar: AvatarProps) =>
    onChatThemeChange({ ...chatTheme, guestAvatar })

  return (
    <Stack spacing={3}>
      <SettingsFilteredContainer
        testId={'host-bubble-theme'}
        title={t('theme.sideMenu.chat.botBubbles')}
        theme={chatTheme?.hostBubbles}
        onThemeChange={updateHostBubbles}
        defaultTheme={{
          backgroundColor: defaultHostBubblesBackgroundColor,
          color: defaultHostBubblesColor,
          opacity: defaultOpacity,
          blur: defaultBlur,
          border: {
            roundeness: defaultRoundness,
          },
        }}
      />
      <Control
        pill={chatTheme?.hostAvatar?.isEnabled ? chatTheme?.hostAvatar?.url : 'none'}
        label={t('theme.sideMenu.chat.botAvatar')}
      >
        <AvatarForm
          uploadFileProps={{
            workspaceId,
            botId: botId,
            fileName: 'hostAvatar',
          }}
          title={t('theme.sideMenu.chat.botAvatar')}
          avatarProps={chatTheme?.hostAvatar}
          isDefaultCheck
          onAvatarChange={updateHostAvatar}
        />
      </Control>

      <SettingsFilteredContainer
        testId={'guestBubblesTheme'}
        title={t('theme.sideMenu.chat.userBubbles')}
        theme={chatTheme?.guestBubbles}
        onThemeChange={updateGuestBubbles}
        defaultTheme={{
          backgroundColor: defaultGuestBubblesBackgroundColor,
          color: defaultGuestBubblesColor,
          opacity: defaultOpacity,
          blur: defaultBlur,
          border: {
            roundeness: defaultRoundness,
          },
        }}
      />

      <Control
        pill={chatTheme?.guestAvatar?.isEnabled ? chatTheme?.guestAvatar?.url : 'none'}
        label={t('theme.sideMenu.chat.userAvatar')}
      >
        <AvatarForm
          uploadFileProps={{
            workspaceId,
            botId: botId,
            fileName: 'guestAvatar',
          }}
          title={t('theme.sideMenu.chat.userAvatar')}
          avatarProps={chatTheme?.guestAvatar}
          onAvatarChange={updateGuestAvatar}
        />
      </Control>
    </Stack>
  )
}
