import React from 'react'
import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { RatingInputBlock, Variable } from '@quickbot.io/schemas'
import { defaultRatingInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/rating/constants'
import { InputNumberWithVariables, InputTextWithVariables } from '@/components/inputs'

import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'
import { FormControl, Select } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { env } from '@quickbot.io/env'

type Props = {
  options: RatingInputBlock['options']
  onOptionsChange: (options: RatingInputBlock['options']) => void
}

export const RatingInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const handleLengthChange = (length: number) => onOptionsChange({ ...options, length })

  const handleTypeChange = (buttonType: 'Icons' | 'Numbers') =>
    onOptionsChange({ ...options, buttonType })

  const handleCustomIconCheck = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      customIcon: { ...options?.customIcon, isEnabled },
    })

  const handleIconSvgChange = (svg: string) =>
    onOptionsChange({ ...options, customIcon: { ...options?.customIcon, svg } })

  const handleLeftLabelChange = (left: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, left } })

  const handleRightLabelChange = (right: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, right } })

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const handleOneClickSubmitChange = (isOneClickSubmitEnabled: boolean) =>
    onOptionsChange({ ...options, isOneClickSubmitEnabled })

  const updateStartsAt = (startsAt: number | `{{${string}}}` | undefined) =>
    onOptionsChange({ ...options, startsAt })

  const length = options?.length ?? defaultRatingInputOptions.length
  const isOneClickSubmitEnabled =
    options?.isOneClickSubmitEnabled ?? defaultRatingInputOptions.isOneClickSubmitEnabled

  const buttonType = options?.buttonType ?? defaultRatingInputOptions.buttonType
  return (
    <Stack spacing={6}>
      <FormControl label={t('blocks.inputs.rating.settings.maximum.label')}>
        <Select
          onSelect={handleLengthChange}
          items={[3, 4, 5, 6, 7, 8, 9, 10]}
          selectedItem={length}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.rating.settings.type.label')}>
        <Select
          onSelect={handleTypeChange}
          items={['Icons', 'Numbers'] as const}
          selectedItem={buttonType}
        />
      </FormControl>
      {buttonType === 'Numbers' && (
        <FormControl label="Starts at">
          <InputNumberWithVariables
            withVariableButton={true}
            defaultValue={options?.startsAt ?? defaultRatingInputOptions.startsAt}
            onChange={updateStartsAt}
          />
        </FormControl>
      )}

      {buttonType === 'Icons' && (
        <SwitchWithRelatedSettings
          label={t('blocks.inputs.rating.settings.customIcon.label')}
          defaultValue={
            options?.customIcon?.isEnabled ?? defaultRatingInputOptions.customIcon.isEnabled
          }
          onChange={handleCustomIconCheck}
        >
          <FormControl direction="column" label={t('blocks.inputs.rating.settings.iconSVG.label')}>
            <CodeEditorWithVariables
              withVariableButton={true}
              lang="xml"
              defaultValue={options?.customIcon?.svg}
              onChange={handleIconSvgChange}
              placeholder="<svg>...</svg>"
            />
          </FormControl>
        </SwitchWithRelatedSettings>
      )}
      <FormControl
        label={t('blocks.inputs.rating.settings.rateLabel.label', {
          rate:
            buttonType === 'Icons' ? '1' : options?.startsAt ?? defaultRatingInputOptions.startsAt,
        })}
      >
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.labels?.left}
          onChange={handleLeftLabelChange}
          placeholder={t('blocks.inputs.rating.settings.notLikely.placeholder.label')}
        />
      </FormControl>
      <FormControl
        label={t('blocks.inputs.rating.settings.rateLabel.label', {
          rate: length,
        })}
      >
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.labels?.right}
          onChange={handleRightLabelChange}
          placeholder={t('blocks.inputs.rating.settings.extremelyLikely.placeholder.label')}
        />
      </FormControl>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.rating.settings.oneClickSubmit.label')}
        moreInfoTooltip={t('blocks.inputs.rating.settings.oneClickSubmit.infoText.label')}
        defaultValue={isOneClickSubmitEnabled}
        onChange={handleOneClickSubmitChange}
      >
        {env.NEXT_PUBLIC_BETA_ENV && (
          <FormControl label={t('blocks.inputs.settings.button.label')}>
            <InputTextWithVariables
              withVariableButton={true}
              defaultValue={options?.labels?.button ?? defaultRatingInputOptions.labels.button}
              onChange={handleButtonLabelChange}
            />
          </FormControl>
        )}
      </SwitchWithRelatedSettings>
      <FormControl label={t('blocks.inputs.settings.saveAnswer.label')}>
        <VariablesDropdown
          initialVariableId={options?.variableId}
          onSelect={handleVariableChange}
        />
      </FormControl>
    </Stack>
  )
}
