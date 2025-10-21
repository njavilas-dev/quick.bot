import { useState } from 'react'
import {
  Button,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalFooter,
  ModalHeader,
  ModalBody,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

type ConfirmDeleteModalProps = {
  isOpen: boolean
  onConfirm: () => Promise<unknown> | unknown
  onClose?: () => void
  onReject: () => Promise<unknown> | unknown
  message: JSX.Element
  title?: string
  confirmButtonLabel: string
  confirmButtonColor?: 'blue' | 'red'
  hideConfirmButton?: boolean
}

export const ConfirmModal = ({
  message,
  title,
  isOpen,
  onConfirm,
  onClose,
  onReject,
  confirmButtonLabel,
  confirmButtonColor,
  hideConfirmButton = false,
}: ConfirmDeleteModalProps) => {
  const { t } = useTranslate()
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    await onConfirm()
    setIsConfirming(false)
  }

  const handleReject = async () => {
    await onReject()
  }

  const handleClose = () => {
    if (onClose) onClose()
    else onReject()
  }

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" blockScrollOnMount={true} onClose={handleClose}>
      <ModalOverlay>
        <ModalContent>
          {title && <ModalHeader>{title}</ModalHeader>}
          <ModalBody>{message}</ModalBody>
          <ModalFooter>
            <Button onClick={handleReject}>{t('cancel')}</Button>
            {!hideConfirmButton && (
              <Button
                colorScheme={confirmButtonColor ?? 'red'}
                onClick={handleConfirm}
                ml={3}
                isLoading={isConfirming}
              >
                {confirmButtonLabel}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}
