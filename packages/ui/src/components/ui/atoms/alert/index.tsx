import React from 'react'
import { Alert as ChakraAlert, AlertProps as ChakraAlertProps } from '@chakra-ui/react'
import { theme } from './theme'

// Definir el componente usando `forwardRef` como en el original
export const Alert = React.forwardRef<HTMLDivElement, ChakraAlertProps>((props, ref) => {
  const { status, ...rest } = props
  const alertStatus = status || theme.status || 'info'

  return <ChakraAlert ref={ref} {...rest} status={alertStatus} />
})

Alert.displayName = 'Alert'
