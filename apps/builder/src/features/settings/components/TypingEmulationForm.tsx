import { Stack } from '@chakra-ui/react'
import { Settings } from '@quickbot.io/schemas'
import React from 'react'
import { defaultSettings } from '@quickbot.io/schemas/features/bot/settings/constants'
import { isDefined } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { Control, Switch, FormControl, InputNumber } from '@urbiport/ui'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'

type Props = {
  typingEmulation: Settings['typingEmulation']
  onUpdate: (typingEmulation: Settings['typingEmulation']) => void
}

export const TypingEmulationForm = ({ typingEmulation, onUpdate }: Props) => {
  const { t } = useTranslate()

  const updateIsEnabled = (enabled: boolean) =>
    onUpdate({
      ...typingEmulation,
      enabled,
    })

  const updateSpeed = (speed?: string | number) => {
    if (typeof speed === 'string') return
    onUpdate({ ...typingEmulation, speed })
  }

  const updateMaxDelay = (maxDelay?: string | number) => {
    if (typeof maxDelay === 'string') return
    onUpdate({
      ...typingEmulation,
      maxDelay: isDefined(maxDelay) ? Math.max(Math.min(maxDelay, 5), 0) : undefined,
    })
  }

  const updateIsDisabledOnFirstMessage = (isDisabledOnFirstMessage: boolean) =>
    onUpdate({
      ...typingEmulation,
      isDisabledOnFirstMessage,
    })

  const updateDelayBetweenBubbles = (delayBetweenBubbles?: string | number) => {
    if (typeof delayBetweenBubbles === 'string') return
    onUpdate({ ...typingEmulation, delayBetweenBubbles })
  }

  return (
    <Stack spacing={3}>
      <Control label={t('settings.typingEmulation.button.title')}>
        <SwitchWithRelatedSettings
          boxPadding={0}
          boxMargin={0}
          withBorders={false}
          isVisible={true}
          label={t('settings.typingEmulation.switch.label')}
          defaultValue={typingEmulation?.enabled ?? defaultSettings.typingEmulation.enabled}
          onChange={updateIsEnabled}
        >
          <FormControl
            direction="row"
            label={t('settings.typingEmulation.disableOnFirstMessage.label')}
            moreInfoTooltip={t('settings.typingEmulation.disableOnFirstMessage.tooltip')}
          >
            <Switch
              onChange={updateIsDisabledOnFirstMessage}
              defaultValue={
                typingEmulation?.isDisabledOnFirstMessage ??
                defaultSettings.typingEmulation.isDisabledOnFirstMessage
              }
            />
          </FormControl>
          <FormControl direction="row" label={t('settings.typingEmulation.wordsPerMinute.label')}>
            <InputNumber
              data-testid="speed"
              defaultValue={typingEmulation?.speed ?? defaultSettings.typingEmulation.speed}
              onChange={updateSpeed}
              step={30}
            />
          </FormControl>
          <FormControl direction="row" label={t('settings.typingEmulation.maxDelay.label')}>
            <InputNumber
              data-testid="max-delay"
              defaultValue={
                typingEmulation?.delayBetweenBubbles ??
                defaultSettings.typingEmulation.delayBetweenBubbles
              }
              onChange={updateMaxDelay}
              min={0}
              max={5}
            />
          </FormControl>
        </SwitchWithRelatedSettings>
      </Control>

      <Control label={t('settings.typingEmulation.delayButton.title')}>
        <FormControl
          direction="row"
          label={t('settings.typingEmulation.delayBetweenMessages.label')}
        >
          <InputNumber
            defaultValue={
              typingEmulation?.delayBetweenBubbles ??
              defaultSettings.typingEmulation.delayBetweenBubbles
            }
            onChange={updateDelayBetweenBubbles}
            min={0}
            max={5}
          />
        </FormControl>
      </Control>
    </Stack>
  )
}
