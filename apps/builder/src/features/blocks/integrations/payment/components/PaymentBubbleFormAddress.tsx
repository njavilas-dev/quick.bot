import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from '@chakra-ui/react'
import React from 'react'
import { InputTextWithVariables } from '@/components/inputs'
import { PaymentAddress } from '@quickbot.io/schemas'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'

type Props = {
  address: PaymentAddress
  onAddressChange: (address: PaymentAddress) => void
}

export const PaymentBubbleFormAddress = ({ address, onAddressChange }: Props) => {
  const { t } = useTranslate()

  const updateCountry = (country: string) =>
    onAddressChange({
      ...address,
      country,
    })

  const updateLine1 = (line1: string) =>
    onAddressChange({
      ...address,
      line1,
    })

  const updateLine2 = (line2: string) =>
    onAddressChange({
      ...address,
      line2,
    })

  const updateCity = (city: string) =>
    onAddressChange({
      ...address,
      city,
    })

  const updateState = (state: string) =>
    onAddressChange({
      ...address,
      state,
    })

  const updatePostalCode = (postalCode: string) =>
    onAddressChange({
      ...address,
      postalCode,
    })

  return (
    <AccordionItem>
      <AccordionButton>
        {t('blocks.inputs.payment.settings.address.label')}
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <FormControl label={t('blocks.inputs.payment.settings.address.country.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={address?.country ?? ''}
            onChange={updateCountry}
          />
        </FormControl>
        <FormControl
          label={t('blocks.inputs.payment.settings.address.line.label', {
            line: '1',
          })}
        >
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={address?.line1 ?? ''}
            onChange={updateLine1}
          />
        </FormControl>
        <FormControl
          label={t('blocks.inputs.payment.settings.address.line.label', {
            line: '2',
          })}
        >
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={address?.line2 ?? ''}
            onChange={updateLine2}
          />
        </FormControl>
        <FormControl label={t('blocks.inputs.payment.settings.address.city.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={address?.city ?? ''}
            onChange={updateCity}
          />
        </FormControl>
        <FormControl label={t('blocks.inputs.payment.settings.address.state.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={address?.state ?? ''}
            onChange={updateState}
          />
        </FormControl>
        <FormControl label={t('blocks.inputs.payment.settings.address.postalCode.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            defaultValue={address?.postalCode ?? ''}
            onChange={updatePostalCode}
          />
        </FormControl>
      </AccordionPanel>
    </AccordionItem>
  )
}
