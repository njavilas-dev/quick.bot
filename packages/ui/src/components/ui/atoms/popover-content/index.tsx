import React, { ForwardedRef } from 'react'
import { PopoverContent as ChakraPopoverContent, PopoverContentProps as ChakraPopoverContentProps } from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const PopoverContent = React.forwardRef(
  (props: ChakraPopoverContentProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraPopoverContent ref={ref} {...props} />
  },
)

PopoverContent.displayName = 'PopoverContent'