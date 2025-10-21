import React, { useState } from 'react'
import { MenuItem, IconButton, HStack, Stack, Spacer, VStack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import {
  DropdownMenu,
  H4,
  FormControl,
  Control,
  InputNumber,
  BackgroundPicker,
  ColorPicker,
} from '@urbiport/ui'
import { MoreVerticalIcon, CheckIcon } from '@urbiport/icons'
import { ContainerTheme, InputTheme, ContainerBorderTheme } from '@quickbot.io/schemas'
import { isDefined } from '@quickbot.io/lib'
import ShadowThemeForm from '@/features/theme/components/chat/ShadowThemeForm'
import BorderThemeForm from '@/features/theme/components/chat/BorderThemeForm'

type ThemeOptions = {
  [key: string]: { title: string; enable: boolean }
}

type ThemeType = ContainerTheme | InputTheme

type SettingsFilteredContainerProps = {
  title: string
  theme: ThemeType | undefined
  testId?: string
  onThemeChange: (theme: ThemeType) => void
  defaultTheme: ThemeType
  onPlaceholderColorChange?: (color: string) => void
}

export const SettingsFilteredContainer = ({
  title,
  theme,
  testId,
  onThemeChange,
  defaultTheme,
  onPlaceholderColorChange,
}: SettingsFilteredContainerProps) => {
  const [themeOptions, setThemeOptions] = useState<ThemeOptions>({
    backgroundColor: { title: 'Background', enable: true },
    color: { title: 'Color', enable: true },
    border: { title: 'Border', enable: false },
    effects: { title: 'Effects', enable: false },
  })

  const toggleOptionVisibility = (optionKey: string) => {
    setThemeOptions((prevOptions) => ({
      ...prevOptions,
      [optionKey]: {
        ...prevOptions[optionKey],
        enable: !prevOptions[optionKey].enable,
      },
    }))
  }

  const renderCheckIcon = (isEnabled: boolean) => (
    <CheckIcon color={isEnabled ? 'black' : '#B3B3B3'} />
  )

  return (
    <VStack spacing={3} w="full">
      <HStack w="full">
        <H4>{title}</H4>
        <Spacer />
        <DropdownMenu
          closeOnSelect={false}
          placement={'bottom-end'}
          matchWidth={false}
          menuButtonProps={{
            as: IconButton,
            variant: 'link',
            icon: <MoreVerticalIcon />,
            size: 'sm',
          }}
        >
          <MenuItem>
            <H4>{title}</H4>
          </MenuItem>
          {Object.entries(themeOptions).map(([key, option]) => (
            <MenuItem
              key={key}
              onClick={() => toggleOptionVisibility(key)}
              icon={renderCheckIcon(option.enable)}
            >
              {option.title}
            </MenuItem>
          ))}
        </DropdownMenu>
      </HStack>
      <ContainerThemeForm
        themeOptions={themeOptions}
        testId={testId}
        theme={theme}
        onPlaceholderColorChange={onPlaceholderColorChange}
        onThemeChange={onThemeChange}
        defaultTheme={defaultTheme}
      />
    </VStack>
  )
}

type Props<T extends ((placeholder: string) => void) | undefined> = {
  theme: (T extends undefined ? ContainerTheme : InputTheme) | undefined
  defaultTheme: T extends undefined ? ContainerTheme : InputTheme
  placeholderColor?: T extends undefined ? never : string
  testId?: string
  onThemeChange: (theme: T extends undefined ? ContainerTheme : InputTheme) => void
  onPlaceholderColorChange?: T
  themeOptions: ThemeOptions
}

const ContainerThemeForm = <T extends ((placeholder: string) => void) | undefined>({
  theme,
  testId,
  defaultTheme,
  onPlaceholderColorChange,
  onThemeChange,
  themeOptions,
}: Props<T>) => {
  const { t } = useTranslate()

  const updateBackgroundColor = (backgroundColor: string) =>
    onThemeChange({ ...theme, backgroundColor })

  const updateTextColor = (color: string) => onThemeChange({ ...theme, color })

  const updateShadow = (shadow?: ContainerTheme['shadow']) => onThemeChange({ ...theme, shadow })

  const updateBlur = (blur?: number | string) => {
    if (typeof blur === 'string') return
    if (!isDefined(blur)) return
    onThemeChange({ ...theme, blur: blur })
  }

  const updateOpacity = (opacity?: number | string) => {
    if (typeof opacity === 'string') return
    if (!isDefined(opacity)) return
    onThemeChange({ ...theme, opacity: opacity })
  }

  const updateBorder = (border: ContainerBorderTheme) => onThemeChange({ ...theme, border })

  const backgroundColor = theme?.backgroundColor ?? defaultTheme?.backgroundColor

  const shadow = theme?.shadow ?? defaultTheme?.shadow ?? 'none'

  return (
    <Stack spacing={3} w="full" data-testid={testId}>
      {themeOptions?.backgroundColor.enable && (
        <Control
          pill={backgroundColor ? backgroundColor : undefined}
          label={t('theme.sideMenu.chat.theme.background')}
        >
          <BackgroundPicker color={backgroundColor} setColor={updateBackgroundColor} />
        </Control>
      )}

      {themeOptions?.color.enable && (
        <Control
          label={t('theme.sideMenu.chat.theme.text')}
          pill={theme?.color ?? defaultTheme?.color}
        >
          <ColorPicker
            color={theme?.color ?? defaultTheme?.color}
            setColor={updateTextColor}
            outputFormat="auto"
          />
        </Control>
      )}

      {onPlaceholderColorChange && (
        <Control
          pill={
            theme && 'placeholderColor' in theme
              ? theme.placeholderColor
              : defaultTheme && 'placeholderColor' in defaultTheme
              ? defaultTheme.placeholderColor
              : undefined
          }
          label={t('theme.sideMenu.chat.theme.placeholder')}
        >
          <ColorPicker
            color={
              theme && 'placeholderColor' in theme
                ? theme.placeholderColor
                : defaultTheme && 'placeholderColor' in defaultTheme
                ? defaultTheme.placeholderColor
                : undefined
            }
            setColor={onPlaceholderColorChange}
            outputFormat="auto"
          />
        </Control>
      )}

      {themeOptions?.border.enable && (
        <Control label={'Border'} pill={theme?.border ? theme.border.color : 'none'}>
          <BorderThemeForm
            border={theme?.border}
            defaultBorder={defaultTheme.border}
            onBorderChange={updateBorder}
          />
        </Control>
      )}

      {themeOptions?.effects.enable && (
        <Control label={'Effects'}>
          {backgroundColor !== 'transparent' && (
            <>
              <FormControl direction="column" label="Opacity:" mb={'20px'}>
                <InputNumber
                  // h={'36px'}
                  width="100px"
                  min={0}
                  max={1}
                  step={0.1}
                  defaultValue={theme?.opacity ?? defaultTheme?.opacity}
                  onChange={updateOpacity}
                />
              </FormControl>
              {(theme?.opacity ?? defaultTheme?.opacity) !== 1 && (
                <FormControl direction="row" label="Blur:">
                  <InputNumber
                    size="sm"
                    suffix="px"
                    width="100px"
                    min={0}
                    defaultValue={theme?.blur ?? defaultTheme?.blur}
                    onChange={updateBlur}
                  />
                </FormControl>
              )}
            </>
          )}
          <FormControl label="Shadow:">
            <ShadowThemeForm currentItem={shadow} onItemSelect={updateShadow} />
          </FormControl>
        </Control>
      )}
    </Stack>
  )
}
