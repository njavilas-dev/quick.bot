import React, { useRef, useEffect, useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { useBillingFormFields } from './BillingFormFields'
import { useWorkspace } from '@/hooks/useWorkspace'

type Props = {
  isOpen: boolean
  onClose: () => void
  onClick: () => void
}

export const PlanPricingCheckoutModal = ({ isOpen, onClose, onClick }: Props) => {

  const { t } = useTranslate()

  const { renderBillingFields, handleSubmit, itsSubmiting } = useBillingFormFields()
  const { workspace: currentWorkspace } = useWorkspace()

  const [waitingForEmailChange, setWaitingForEmailChange] = useState(false)
  const prevEmailRef = useRef<string | null | undefined>()

  useEffect(() => {
    if (waitingForEmailChange && prevEmailRef.current !== undefined) {
      if (currentWorkspace?.billingEmail && currentWorkspace.billingEmail !== prevEmailRef.current) {
        setWaitingForEmailChange(false)
        prevEmailRef.current = undefined
        onClick()
      }
    }
  }, [currentWorkspace?.billingEmail, waitingForEmailChange, onClick])

  const handleButtonClick = async () => {
    if (currentWorkspace) {
      prevEmailRef.current = currentWorkspace.billingEmail;
    }

    const success = await handleSubmit()

    if (success) {
      setWaitingForEmailChange(true)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalBody py="8">
          <Stack>
            {renderBillingFields(false)}
            <Button
              colorScheme="blue"
              onClick={handleButtonClick}
              isLoading={itsSubmiting || waitingForEmailChange}
              isDisabled={waitingForEmailChange}
            >
              {t('billing.preCheckoutModal.submitButton.label')}
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
