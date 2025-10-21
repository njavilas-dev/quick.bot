import React, { useEffect, useState } from 'react'
import { HStack, Box, Tooltip } from '@chakra-ui/react'
import { FormControl, InputText, Select, Button, useToast } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { taxIdTypes } from '@quickbot.io/billing/taxIdTypes'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole'
import { useUser } from '@/hooks/useUser'
import { useLoadingSave } from '@/hooks/useLoadingSave'

const vatCodeLabels = taxIdTypes.map((taxIdType) => ({
  label: `${taxIdType.emoji} ${taxIdType.name} (${taxIdType.code})`,
  value: taxIdType.type,
  extras: {
    placeholder: taxIdType.placeholder,
  },
}))

export const useBillingFormFields = () => {
  const { workspace, updateCurrentWorkspace } = useWorkspace()
  const { isAdmin } = useWorkspaceRole()
  const { user } = useUser()
  const { t } = useTranslate()
  const { showToast } = useToast()
  const setLoadingSave = useLoadingSave()

  const [itsSubmiting, setItsSubmiting] = useState<boolean>(false)

  const [billingInfo, setBillingInfo] = useState({
    billingCompany: '',
    billingEmail: '',
    billingVatType: '',
    billingVatValue: '',
  })

  useEffect(() => {
    setBillingInfo({
      billingCompany: workspace?.billingCompany ?? user?.name ?? '',
      billingEmail: workspace?.billingEmail ?? user?.email ?? '',
      billingVatType: workspace?.billingVatType ?? '',
      billingVatValue: workspace?.billingVatValue ?? '',
    })
  }, [
    workspace?.billingCompany,
    workspace?.billingEmail,
    workspace?.billingVatType,
    workspace?.billingVatValue,
    user?.name,
    user?.email,
  ])

  const handleInputChange = (field: string) => (value: string | number) => {
    setBillingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault()
    if (!workspace?.id) return
    try {
      setItsSubmiting(true)
      setLoadingSave()
      await updateCurrentWorkspace(billingInfo)
      setItsSubmiting(false)
      showToast({
        detailsTitle: t('toast.details'),
        description: t('billing.preCheckoutModal.successMessage'),
        status: 'success',
      })
      return true
      // eslint-disable-next-line
    } catch (e) {
      setItsSubmiting(false)
      showToast({
        detailsTitle: t('toast.details'),
        status: 'error',
      })
      return false
    }
  }

  const renderBillingFields = (withButton: boolean = true) => (
    <form onSubmit={handleSubmit}>
      <FormControl isRequired label={t('billing.preCheckoutModal.companyInput.label')}>
        <Tooltip
          label={!isAdmin ? 'Only workspace admins can edit billing information' : ''}
          hasArrow
        >
          <InputText
            defaultValue={workspace?.billingCompany ?? user?.name ?? ''}
            onChange={handleInputChange('billingCompany')}
            isDisabled={!isAdmin}
          />
        </Tooltip>
      </FormControl>
      <FormControl isRequired label={t('billing.preCheckoutModal.emailInput.label')}>
        <Tooltip
          label={!isAdmin ? 'Only workspace admins can edit billing information' : ''}
          hasArrow
        >
          <InputText
            type="email"
            defaultValue={workspace?.billingEmail ?? user?.email ?? ''}
            onChange={handleInputChange('billingEmail')}
            isDisabled={!isAdmin}
          />
        </Tooltip>
      </FormControl>
      <FormControl label={t('billing.preCheckoutModal.taxId.label')}>
        <Tooltip
          label={!isAdmin ? 'Only workspace admins can edit billing information' : ''}
          hasArrow
        >
          <HStack>
            <Select
              key={workspace?.id}
              placeholder={t('billing.preCheckoutModal.taxId.placeholder')}
              items={vatCodeLabels}
              onSelect={handleInputChange('billingVatType')}
              selectedItem={billingInfo?.billingVatType ?? workspace?.billingVatType}
              width="150px"
              usePortal={false}
              isDisabled={!isAdmin}
            />
            <InputText
              defaultValue={workspace?.billingVatValue ?? ''}
              onChange={handleInputChange('billingVatValue')}
              isDisabled={!isAdmin}
            />
          </HStack>
        </Tooltip>
      </FormControl>
      {withButton && isAdmin && (
        <Box w={'100%'} mt={4} display={'flex'} justifyContent={'flex-end'}>
          <Button type={'submit'} isLoading={itsSubmiting}>
            {t('billing.preCheckoutModal.saveButton.label')}
          </Button>
        </Box>
      )}
    </form>
  )

  const isFormValid = !!workspace?.billingCompany && !!workspace?.billingEmail

  return {
    renderBillingFields,
    handleSubmit,
    isFormValid,
    workspace,
    itsSubmiting,
  }
}
