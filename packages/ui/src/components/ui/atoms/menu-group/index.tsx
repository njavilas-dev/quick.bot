import React, { ForwardedRef } from 'react'
import {
  MenuGroup as ChakraMenuGroup,
  MenuGroupProps as ChakraMenuGroupProps,
} from '@chakra-ui/react'
import { IReactElement } from '../../../../shared/interfaces'

export const MenuGroup = React.forwardRef(
  (props: ChakraMenuGroupProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    return <ChakraMenuGroup ref={ref} {...props} />
  },
)

MenuGroup.displayName = 'MenuGroup'
