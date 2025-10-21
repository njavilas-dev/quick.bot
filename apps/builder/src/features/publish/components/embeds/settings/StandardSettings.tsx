import { useState, useEffect } from 'react'
import { StackProps, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { H4, Switch, InputNumberUnit, FormControl } from '@urbiport/ui'

type Props = {
  windowSettings: { height: string; width?: string }
  onUpdateWindowSettings: (windowSettings: { height: string; width?: string }) => void
} & StackProps

export const StandardSettings = ({ onUpdateWindowSettings, windowSettings, ...props }: Props) => {
  const { t } = useTranslate()
  const [isFullscreenChecked, setIsFullscreenChecked] = useState(false)
  const { width, height } = windowSettings

  useEffect(() => {
    const newWindowSettings = {
      width: isFullscreenChecked ? undefined : width,
      height: isFullscreenChecked ? '100vh' : height,
    }
    if (
      newWindowSettings.width !== windowSettings.width ||
      newWindowSettings.height !== windowSettings.height
    ) {
      onUpdateWindowSettings(newWindowSettings)
    }
  }, [isFullscreenChecked, width, height, onUpdateWindowSettings])

  return (
    <Stack {...props} spacing={4}>
      <H4>{t('publish.standard.settings.header')}</H4>
      <Stack pl="4" spacing={4}>
        <FormControl direction="row" label={t('publish.standard.settings.fullscreen.label')}>
          <Switch
            defaultValue={isFullscreenChecked}
            onChange={() => setIsFullscreenChecked(!isFullscreenChecked)}
          />
        </FormControl>
        {!isFullscreenChecked && (
          <>
            <FormControl direction="row" label={t('publish.standard.settings.width.label')}>
              <InputNumberUnit
                defaultValue={width}
                onChange={(width) => onUpdateWindowSettings({ width, height })}
                units={['px', '%']}
                maxWidth="100px"
              />
            </FormControl>
            <FormControl direction="row" label={t('publish.standard.settings.width.label')}>
              <InputNumberUnit
                defaultValue={height}
                onChange={(height) => onUpdateWindowSettings({ height: height ?? '100vh', width })}
                units={['px', '%']}
                maxWidth="100px"
              />
            </FormControl>
          </>
        )}
      </Stack>
    </Stack>
  )
}
