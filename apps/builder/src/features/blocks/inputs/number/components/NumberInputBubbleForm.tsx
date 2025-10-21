import { InputTextWithVariables, InputNumberWithVariables } from '@/components/inputs'

import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { NumberInputBlock, Variable } from '@quickbot.io/schemas'
import { defaultNumberInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/number/constants'
import React from 'react'
import { FormControl } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { env } from '@quickbot.io/env'

type Props = {
  options: NumberInputBlock['options']
  onOptionsChange: (options: NumberInputBlock['options']) => void
}

export const NumberInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleMinChange = (min?: NonNullable<NumberInputBlock['options']>['min']) =>
    onOptionsChange({ ...options, min })
  const handleMaxChange = (max?: NonNullable<NumberInputBlock['options']>['max']) =>
    onOptionsChange({ ...options, max })
  const handleStepChange = (step?: NonNullable<NumberInputBlock['options']>['step']) =>
    onOptionsChange({ ...options, step })
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id })
  }

  return (
    <Stack spacing={6}>
      <FormControl label={t('blocks.inputs.settings.placeholder.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={
            options?.labels?.placeholder ?? defaultNumberInputOptions.labels.placeholder
          }
          onChange={handlePlaceholderChange}
        />
      </FormControl>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl label={t('blocks.inputs.settings.button.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.labels?.button ?? defaultNumberInputOptions.labels.button}
            onChange={handleButtonLabelChange}
          />
        </FormControl>
      )}
      <FormControl label={t('blocks.inputs.settings.min.label')}>
        <InputNumberWithVariables
          withVariableButton={true}
          defaultValue={options?.min}
          onChange={handleMinChange}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.max.label')}>
        <InputNumberWithVariables
          withVariableButton={true}
          defaultValue={options?.max}
          onChange={handleMaxChange}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.number.settings.step.label')}>
        <InputNumberWithVariables
          withVariableButton={true}
          defaultValue={options?.step}
          onChange={handleStepChange}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.saveAnswer.label')}>
        <VariablesDropdown
          initialVariableId={options?.variableId}
          onSelect={handleVariableChange}
        />
      </FormControl>
    </Stack>
  )
}
