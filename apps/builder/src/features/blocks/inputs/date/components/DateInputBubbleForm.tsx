import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { InputTextWithVariables } from '@/components/inputs'
import { Switch } from '@urbiport/ui'

import { Stack } from '@chakra-ui/react'
import { DateInputBlock, Variable } from '@quickbot.io/schemas'
import React from 'react'
import { defaultDateInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/date/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { env } from '@quickbot.io/env'

type Props = {
  options: DateInputBlock['options']
  onOptionsChange: (options: DateInputBlock['options']) => void
}

export const DateInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const updateFromLabel = (from: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, from } })
  const updateToLabel = (to: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, to } })
  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const updateIsRange = (isRange: boolean) => onOptionsChange({ ...options, isRange })
  const updateHasTime = (hasTime: boolean) => onOptionsChange({ ...options, hasTime })
  const updateVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const updateFormat = (format: string) => {
    if (format === '') return onOptionsChange({ ...options, format: undefined })
    onOptionsChange({ ...options, format })
  }
  const updateMin = (min: string) => {
    if (min === '') return onOptionsChange({ ...options, min: undefined })
    onOptionsChange({ ...options, min })
  }
  const updateMax = (max: string) => {
    if (max === '') return onOptionsChange({ ...options, max: undefined })
    onOptionsChange({ ...options, max })
  }

  return (
    <Stack spacing={6}>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.date.settings.isRange.label')}
        defaultValue={options?.isRange ?? defaultDateInputOptions.isRange}
        onChange={updateIsRange}
      >
        <FormControl label={t('blocks.inputs.date.settings.from.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.labels?.from ?? defaultDateInputOptions.labels.from}
            onChange={updateFromLabel}
          />
        </FormControl>
        <FormControl label={t('blocks.inputs.date.settings.to.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={
              options?.labels?.to ?? t('blocks.inputs.date.settings.toInputValue.label')
            }
            onChange={updateToLabel}
          />
        </FormControl>
      </SwitchWithRelatedSettings>
      <FormControl direction="row" label={t('blocks.inputs.date.settings.withTime.label')}>
        <Switch
          defaultValue={options?.hasTime ?? defaultDateInputOptions.hasTime}
          onChange={updateHasTime}
        />
      </FormControl>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl label={t('blocks.inputs.settings.button.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.labels?.button ?? defaultDateInputOptions.labels.button}
            onChange={updateButtonLabel}
          />
        </FormControl>
      )}
      <FormControl label={t('blocks.inputs.settings.min.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.min}
          placeholder={options?.hasTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD'}
          onChange={updateMin}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.max.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.max}
          placeholder={options?.hasTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD'}
          onChange={updateMax}
        />
      </FormControl>
      <FormControl
        label={t('blocks.inputs.date.settings.format.label')}
        moreInfoTooltip={`
					${t('blocks.inputs.date.settings.format.example.label')} dd/MM/yyyy, MM/dd/yy, yyyy-MM-dd
				`}
      >
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={
            options?.format ??
            (options?.hasTime
              ? defaultDateInputOptions.formatWithTime
              : defaultDateInputOptions.format)
          }
          placeholder={options?.hasTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
          onChange={updateFormat}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.saveAnswer.label')}>
        <VariablesDropdown initialVariableId={options?.variableId} onSelect={updateVariable} />
      </FormControl>
    </Stack>
  )
}
