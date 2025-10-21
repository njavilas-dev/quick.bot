import React from 'react'
import { Flex } from '@chakra-ui/react'
import { ToastProps } from '../../molecules'
import { AlertIcon, InfoIcon, SuccessIcon } from '@urbiport/icons'

export const ToastIcon = ({
  customIcon,
  status,
}: {
  customIcon?: React.ReactNode
  status: ToastProps['status']
}) => {
  const icon = parseIcon(status, customIcon)
  return (
    <Flex
      bgColor={`alert.${status}.bg`}
      boxSize="40px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      rounded="full"
      flexShrink={0}
    >
      {icon}
    </Flex>
  )
}

const parseIcon = (status: ToastProps['status'], customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon
  switch (status) {
    case 'error':
      return <AlertIcon color="alert.error.color" />
    case 'success':
      return <SuccessIcon color="alert.success.color" />
    case 'info':
      return <InfoIcon color="alert.info.color" />
  }
}
