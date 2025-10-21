import React from 'react'
import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ChatTheme, GeneralTheme, Theme } from '@quickbot.io/schemas'
import {
  defaultButtonsBackgroundColor,
  defaultButtonsColor,
  defaultButtonsBorderThickness,
  defaultOpacity,
  defaultBlur,
  defaultRoundness,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { SettingsFilteredContainer } from './SettingsFilteredContainer'

type Props = {
  generalBackground: GeneralTheme['background']
  chatTheme: Theme['chat']
  onChatThemeChange: (chatTheme: ChatTheme) => void
}

export const ThemeButtonsForm = ({ chatTheme, onChatThemeChange }: Props) => {
  const { t } = useTranslate()

  const updateButtons = (buttons: NonNullable<Theme['chat']>['buttons']) =>
    onChatThemeChange({ ...chatTheme, buttons })

  return (
    <Stack spacing={3}>
      <SettingsFilteredContainer
        testId={'buttonsTheme'}
        title={t('theme.sideMenu.chat.buttons')}
        theme={chatTheme?.buttons}
        onThemeChange={updateButtons}
        defaultTheme={{
          backgroundColor: defaultButtonsBackgroundColor,
          color: defaultButtonsColor,
          opacity: defaultOpacity,
          blur: defaultBlur,
          border: {
            roundeness: defaultRoundness,
            thickness: defaultButtonsBorderThickness,
            color: chatTheme?.buttons?.backgroundColor ?? defaultButtonsBackgroundColor,
          },
        }}
      />
    </Stack>
  )
}
