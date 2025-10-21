import { InputTextWithVariables } from '@/components/inputs'

import { Stack } from '@chakra-ui/react'
import { PhoneNumberInputBlock, Variable } from '@quickbot.io/schemas'
import React from 'react'
import { CountryCodeSelect } from './CountryCodeSelect'
import { useTranslate } from '@tolgee/react'
import { defaultPhoneInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/phone/constants'
import { FormControl } from '@urbiport/ui'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'
import { env } from '@quickbot.io/env'

type Props = {
  options: PhoneNumberInputBlock['options']
  onOptionsChange: (options: PhoneNumberInputBlock['options']) => void
}

export const PhoneInputBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent })
  const handleDefaultCountryChange = (defaultCountryCode: string) =>
    onOptionsChange({ ...options, defaultCountryCode })

  return (
    <Stack spacing={6}>
      <FormControl label={t('blocks.inputs.settings.placeholder.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={options?.labels?.placeholder ?? defaultPhoneInputOptions.labels.placeholder}
          onChange={handlePlaceholderChange}
        />
      </FormControl>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl label={t('blocks.inputs.settings.button.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={options?.labels?.button ?? defaultPhoneInputOptions.labels.button}
            onChange={handleButtonLabelChange}
          />
        </FormControl>
      )}
      <FormControl label={t('blocks.inputs.phone.settings.defaultCountry.label')}>
        <CountryCodeSelect
          onSelect={handleDefaultCountryChange}
          countryCode={options?.defaultCountryCode}
        />
      </FormControl>
      <FormControl label={t('blocks.inputs.settings.retryMessage.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          defaultValue={
            options?.retryMessageContent ?? defaultPhoneInputOptions.retryMessageContent
          }
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
