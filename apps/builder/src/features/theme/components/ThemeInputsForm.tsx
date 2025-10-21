import React from 'react'
import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { ChatTheme, GeneralTheme, Theme } from '@quickbot.io/schemas'
import {
  defaultInputsBackgroundColor,
  defaultInputsColor,
  defaultInputsPlaceholderColor,
  defaultInputsShadow,
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

export const ThemeInputsForm = ({ chatTheme, onChatThemeChange }: Props) => {
  const { t } = useTranslate()

  const updateInputs = (inputs: NonNullable<Theme['chat']>['inputs']) =>
    onChatThemeChange({ ...chatTheme, inputs })

  const updateInputsPlaceholderColor = (placeholderColor: string) =>
    onChatThemeChange({
      ...chatTheme,
      inputs: { ...chatTheme?.inputs, placeholderColor },
    })

  return (
    <Stack spacing={3}>
      <SettingsFilteredContainer
        testId={'inputsTheme'}
        title={t('theme.sideMenu.chat.inputs')}
        theme={chatTheme?.inputs}
        onThemeChange={updateInputs}
        onPlaceholderColorChange={updateInputsPlaceholderColor}
        defaultTheme={{
          backgroundColor: defaultInputsBackgroundColor,
          color: defaultInputsColor,
          placeholderColor: defaultInputsPlaceholderColor,
          shadow: defaultInputsShadow,
          opacity: defaultOpacity,
          blur: defaultBlur,
          border: {
            roundeness: defaultRoundness,
          },
        }}
      />
    </Stack>
  )
}
