import React, { useEffect } from 'react'
import { HStack, Spinner, Text } from '@chakra-ui/react'
import useLoadingSave from '@/store/useLoadingSaveStore'
import { useTranslate } from '@tolgee/react'

export const LoadingSave = () => {
  const { t } = useTranslate()

  const isVisible = useLoadingSave((state) => state.isVisible)

  const setIsVisible = useLoadingSave((state) => state.setIsVisible)

  const handleClose = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    if (isVisible === true) {
      setTimeout(handleClose, 3000)
    }
  }, [isVisible, handleClose])

  if (!isVisible) return null

  return (
    <HStack>
      <Spinner size="sm" />
      <Text fontSize="sm" color="text.light">
        {t('editor.header.savingSpinner.label')}
      </Text>
    </HStack>
  )
}
