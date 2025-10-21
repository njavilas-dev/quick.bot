import {
  Stack,
  useDisclosure,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react'
import { PaymentAddress, PaymentInputBlock } from '@quickbot.io/schemas'
import React, { useEffect } from 'react'
import { StripeConfigModal } from './StripeConfigModal'
import { ForgedCredentialsDropdown } from '@/features/forge/components/credentials/ForgedCredentialsDropdown'
import { InputTextWithVariables } from '@/components/inputs'
import { useWorkspace } from '@/hooks/useWorkspace'
import { PaymentBubbleFormAddress } from './PaymentBubbleFormAddress'
import { defaultPaymentInputOptions } from '@quickbot.io/schemas/features/blocks/inputs/payment/constants'
import { useTranslate } from '@tolgee/react'
import { FormControl } from '@urbiport/ui'
import { CurrencySelect } from './CurrencySelect'
import { env } from '@quickbot.io/env'

type Props = {
  options: PaymentInputBlock['options']
  onOptionsChange: (options: PaymentInputBlock['options']) => void
}

export const PaymentBubbleForm = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslate()

  useEffect(() => {
    if (options?.provider !== defaultPaymentInputOptions.provider) {
      onOptionsChange({
        ...options,
        provider: defaultPaymentInputOptions.provider,
      })
    }
  }, [options, onOptionsChange])

  const updateCredentials = (credentialsId?: string) => {
    onOptionsChange({
      ...options,
      credentialsId,
    })
  }

  const updateAmount = (amount?: string) =>
    onOptionsChange({
      ...options,
      amount,
    })

  const updateCurrency = (currency: string) => {
    onOptionsChange({
      ...options,
      currency,
    })
  }

  const updateName = (name: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, name },
    })

  const updateEmail = (email: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, email },
    })

  const updatePhoneNumber = (phoneNumber: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, phoneNumber },
    })

  const updateButtonLabel = (button: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, button },
    })

  const updateSuccessLabel = (success: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, success },
    })

  const updateDescription = (description: string) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, description },
    })

  const updateAddress = (address: PaymentAddress) =>
    onOptionsChange({
      ...options,
      additionalInformation: { ...options?.additionalInformation, address },
    })

  return (
    <Stack spacing={6}>
      {workspace && (
        <FormControl label={t('blocks.inputs.payment.settings.account.label')}>
          <ForgedCredentialsDropdown
            type="stripe"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentials}
            onCredentialsCreate={onOpen}
            credentialsName={t('blocks.inputs.payment.settings.accountText.label', {
              provider: 'Stripe',
            })}
          />
        </FormControl>
      )}
      <FormControl label={t('blocks.inputs.payment.settings.currency.label')}>
        <CurrencySelect currency={options?.currency} onSelect={updateCurrency} />
      </FormControl>
      <FormControl label={t('blocks.inputs.payment.settings.priceAmount.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          onChange={updateAmount}
          defaultValue={options?.amount}
          placeholder="30.00"
        />
      </FormControl>
      {env.NEXT_PUBLIC_BETA_ENV && (
        <FormControl label={t('blocks.inputs.settings.button.label')}>
          <InputTextWithVariables
            withVariableButton={true}
            onChange={updateButtonLabel}
            defaultValue={options?.labels?.button ?? defaultPaymentInputOptions.labels.button}
          />
        </FormControl>
      )}
      <FormControl label={t('blocks.inputs.payment.settings.successMessage.label')}>
        <InputTextWithVariables
          withVariableButton={true}
          onChange={updateSuccessLabel}
          defaultValue={options?.labels?.success ?? defaultPaymentInputOptions.labels.success}
        />
      </FormControl>
      <Accordion allowToggle allowMultiple>
        <AccordionItem>
          <AccordionButton>
            {t('blocks.inputs.payment.settings.additionalInformation.label')}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <FormControl label={t('blocks.inputs.settings.description.label')}>
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.additionalInformation?.description}
                onChange={updateDescription}
                placeholder={t(
                  'blocks.inputs.payment.settings.additionalInformation.description.placeholder.label',
                )}
              />
            </FormControl>
            <FormControl
              label={t('blocks.inputs.payment.settings.additionalInformation.name.label')}
            >
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.additionalInformation?.name}
                onChange={updateName}
                placeholder="John Doe"
              />
            </FormControl>
            <FormControl
              label={t('blocks.inputs.payment.settings.additionalInformation.email.label')}
            >
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.additionalInformation?.email}
                onChange={updateEmail}
                placeholder="email@example.com"
              />
            </FormControl>
            <FormControl
              label={t('blocks.inputs.payment.settings.additionalInformation.phone.label')}
            >
              <InputTextWithVariables
                withVariableButton={true}
                defaultValue={options?.additionalInformation?.phoneNumber}
                onChange={updatePhoneNumber}
                placeholder="+33XXXXXXXXX"
              />
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
        <PaymentBubbleFormAddress
          address={options?.additionalInformation?.address}
          onAddressChange={updateAddress}
        />
      </Accordion>

      <StripeConfigModal isOpen={isOpen} onClose={onClose} onNewCredentials={updateCredentials} />
    </Stack>
  )
}
