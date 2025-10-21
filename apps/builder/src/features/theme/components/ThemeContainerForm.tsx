import React from 'react'
import { Stack } from '@chakra-ui/react'
import { FormControl, InputNumberUnit, RadioButtons, H4 } from '@urbiport/ui'
import { ChatTheme, GeneralTheme, Theme, Font } from '@quickbot.io/schemas'
import {
  defaultOpacity,
  defaultBlur,
  defaultRoundness,
  defaultContainerBackgroundColor,
  defaultContainerMaxHeight,
  defaultContainerMaxWidth,
  defaultLightTextColor,
  defaultFontType,
  fontTypes,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { SettingsFilteredContainer } from './SettingsFilteredContainer'
import { FontForm } from './general/FontForm'
import { useTranslate } from '@tolgee/react'
import { env } from '@quickbot.io/env'

type Props = {
  generalBackground: GeneralTheme['background']
  chatTheme: Theme['chat']
  generalTheme: Theme['general']
  onChatThemeChange: (chatTheme: ChatTheme) => void
  onGeneralThemeChange: (general: Theme['general']) => void
}

export const ThemeContainerForm = ({
  chatTheme,
  generalTheme,
  onChatThemeChange,
  onGeneralThemeChange
}: Props) => {
  const { t } = useTranslate()

  const updateChatContainer = (container: NonNullable<Theme['chat']>['container']) =>
    onChatThemeChange({ ...chatTheme, container })

  const updateFont = (font: Font) => onGeneralThemeChange({ ...generalTheme, font })

  const updateFontType = (type: (typeof fontTypes)[number]) => {
    onGeneralThemeChange({
      ...generalTheme,
      font: typeof generalTheme?.font === 'string' ? { type } : { ...generalTheme?.font, type },
    })
  }

  const handleUpdateMaxWidth = (maxWidth?: string) => {
    onChatThemeChange({
      ...chatTheme,
      container: {
        ...chatTheme?.container,
        maxWidth,
      },
    })
  }

  const handleUpdateMaxHeight = (maxHeight?: string) => {
    onChatThemeChange({
      ...chatTheme,
      container: {
        ...chatTheme?.container,
        maxHeight,
      },
    })
  }

  const fontType =
    (typeof generalTheme?.font === 'string' ? 'Google' : generalTheme?.font?.type) ??
    defaultFontType

  return (
    <Stack spacing={3}>
      <FormControl direction="row" label="Max width">
        <InputNumberUnit
          defaultValue={chatTheme?.container?.maxWidth ?? defaultContainerMaxWidth}
          onChange={handleUpdateMaxWidth}
          units={['px', '%', 'vh', 'vw']}
          maxWidth="100px"
        />
      </FormControl>
      <FormControl direction="row" label="Max height">
        <InputNumberUnit
          defaultValue={chatTheme?.container?.maxHeight ?? defaultContainerMaxHeight}
          onChange={handleUpdateMaxHeight}
          units={['px', '%', 'vh', 'vw']}
          maxWidth="100px"
        />
      </FormControl>
      <SettingsFilteredContainer
        title="Container"
        theme={chatTheme?.container}
        defaultTheme={{
          backgroundColor: defaultContainerBackgroundColor,
          border: {
            roundeness: defaultRoundness,
          },
          blur: defaultBlur,
          opacity: defaultOpacity,
          color: defaultLightTextColor,
        }}
        onThemeChange={updateChatContainer}
      />
      {env.NEXT_PUBLIC_BETA_ENV && (
        <Stack spacing={3}>
          <H4>{t('theme.sideMenu.global.font')}</H4>
          <RadioButtons
            options={fontTypes}
            defaultValue={fontType}
            onSelect={(newValue) => updateFontType(newValue as (typeof fontTypes)[number])}
          />
          <FontForm font={generalTheme?.font} onFontChange={updateFont} />
        </Stack>
      )}
    </Stack>
  )
}
