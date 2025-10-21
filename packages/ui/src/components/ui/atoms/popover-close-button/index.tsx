import React, { ForwardedRef } from 'react'
import { PopoverCloseButton as ChakraPopoverCloseButton, PopoverCloseButtonProps as ChakraPopoverCloseButtonProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverCloseButton = React.forwardRef(
  (props: ChakraPopoverCloseButtonProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraPopoverCloseButton ref={ref} {...props} />
  },
)

PopoverCloseButton.displayName = 'PopoverCloseButton'