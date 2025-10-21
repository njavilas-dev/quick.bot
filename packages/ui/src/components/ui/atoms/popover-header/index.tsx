import React, { ForwardedRef } from 'react'
import { PopoverHeader as ChakraPopoverHeader, PopoverHeaderProps as ChakraPopoverHeaderProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverHeader = React.forwardRef(
  (props: ChakraPopoverHeaderProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraPopoverHeader ref={ref} {...props} />
  },
)

PopoverHeader.displayName = 'PopoverHeader'