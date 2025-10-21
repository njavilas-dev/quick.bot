import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { ProgressBar } from '@quickbot.io/schemas'
import {
  defaultProgressBarBackgroundColor,
  defaultProgressBarColor,
  defaultProgressBarIsEnabled,
  defaultProgressBarPlacement,
  defaultProgressBarPosition,
  defaultProgressBarThickness,
  progressBarPlacements,
  progressBarPlacementValues,
  progressBarPositions,
  progressBarPositionValues,
} from '@quickbot.io/schemas/features/bot/theme/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl, InputNumber, InputColor, ButtonSwitch } from '@urbiport/ui'
import { isDefined } from '@quickbot.io/lib'
import React from 'react'

type Props = {
  progressBar: ProgressBar | undefined
  onProgressBarChange: (progressBar: ProgressBar) => void
}

export const ProgressBarForm = ({ progressBar, onProgressBarChange }: Props) => {
  const { t } = useTranslate()

  const updateEnabled = (isEnabled: boolean) => onProgressBarChange({ ...progressBar, isEnabled })

  const updateColor = (color: string) => onProgressBarChange({ ...progressBar, color })

  const updatePlacement = (placement: (typeof progressBarPlacementValues)[number]) =>
    onProgressBarChange({ ...progressBar, placement })

  const updatePosition = (position: (typeof progressBarPositionValues)[number]) =>
    onProgressBarChange({ ...progressBar, position })

  const updateThickness = (thickness?: number | string) =>
    isDefined(thickness) && onProgressBarChange({ ...progressBar, thickness: Number(thickness) })

  const updateBackgroundColor = (backgroundColor: string) =>
    onProgressBarChange({ ...progressBar, backgroundColor })

  return (
    <SwitchWithRelatedSettings
      boxPadding={0}
      boxMargin={0}
      withBorders={false}
      isVisible={true}
      label={t('theme.progressBar.enable.label')}
      defaultValue={progressBar?.isEnabled ?? defaultProgressBarIsEnabled}
      onChange={updateEnabled}
    >
      <FormControl direction="row" label={t('theme.progressBar.placement.label')}>
        <ButtonSwitch
          width={160}
          selectedItem={progressBar?.placement ?? defaultProgressBarPlacement}
          onSelect={updatePlacement}
          items={progressBarPlacements}
        />
      </FormControl>
      <FormControl label={t('theme.progressBar.backgroundColor.label')} direction="row">
        <InputColor
          width={160}
          defaultValue={progressBar?.backgroundColor ?? defaultProgressBarBackgroundColor}
          onChange={updateBackgroundColor}
        />
      </FormControl>
      <FormControl label={t('theme.progressBar.color.label')} direction="row">
        <InputColor
          width={160}
          defaultValue={progressBar?.color ?? defaultProgressBarColor}
          onChange={updateColor}
        />
      </FormControl>
      <FormControl label={t('theme.progressBar.thickness.label')} direction="row">
        <InputNumber
          width={160}
          suffix={'px'}
          defaultValue={progressBar?.thickness ?? defaultProgressBarThickness}
          onChange={updateThickness}
        />
      </FormControl>
      <FormControl
        direction="row"
        label={t('theme.progressBar.position.label')}
        moreInfoTooltip={t('theme.progressBar.position.tooltip')}
      >
        <ButtonSwitch
          width={160}
          selectedItem={progressBar?.position ?? defaultProgressBarPosition}
          onSelect={updatePosition}
          items={progressBarPositions}
        />
      </FormControl>
    </SwitchWithRelatedSettings>
  )
}
