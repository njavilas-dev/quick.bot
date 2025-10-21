import { InputTextWithVariables } from '@/components/inputs'

import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { UrlInputBlock, Variable } from '@quickbot.io/schemas'
import { defaultUrlInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/url/constants'
import { FormControl } from '@urbiport/ui'
import React from 'react'
import { env } from '@quickbot.io/env'

type Props = {
  options: UrlInputBlock['options']
  onOptionsChange: (options: UrlInputBlock['options']) => void
}

export const UrlInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent })

  return (
    <Stack spacing={6}>
      <FormControl label={t('blocks.inputs.settings.placeholder.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.labels?.placeholder ?? defaultUrlInputOptions.labels.placeholder}
          onChange={handlePlaceholderChange}
        />
      </FormControl>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl label={t('blocks.inputs.settings.button.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.labels?.button ?? defaultUrlInputOptions.labels.button}
            onChange={handleButtonLabelChange}
          />
        </FormControl>
      )}
      <FormControl label={t('blocks.inputs.settings.retryMessage.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.retryMessageContent ?? defaultUrlInputOptions.retryMessageContent}
          onChange={handleRetryMessageChange}
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
