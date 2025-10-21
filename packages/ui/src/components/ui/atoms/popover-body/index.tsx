import React, { ForwardedRef } from 'react'
import { PopoverBody as ChakraPopoverBody, PopoverBodyProps as ChakraPopoverBodyProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverBody = React.forwardRef(
  (props: ChakraPopoverBodyProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraPopoverBody ref={ref} {...props} />
  },
)

PopoverBody.displayName = 'PopoverBody'