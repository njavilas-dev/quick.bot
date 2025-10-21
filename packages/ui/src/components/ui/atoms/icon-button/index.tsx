import React, { ForwardedRef } from 'react'
import {
  IconButton as ChakraIconButton,
  IconButtonProps as ChakraIconButtonProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const IconButton = React.forwardRef(
  (props: ChakraIconButtonProps, ref: ForwardedRef<HTMLButtonElement>): IReactElement => {
    return <ChakraIconButton ref={ref} {...props} />
  },
)

IconButton.displayName = 'IconButton'
